import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/db';
import { QuestionR2 } from '@/models/Question';
import { TeamScoreR2 } from '@/models/TeamScore';
import { Team } from '@/models';
import { fetchTeamSubmissions } from '@/services/codeforcesService';
import { calculateTeamScore } from '@/services/bingoCalculator';
import { checkRateLimit } from '@/lib/rateLimit';
import type { SyncResponse } from '@/types';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.teamId) {
      return NextResponse.json<SyncResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (!session.user?.hasRound2Access) {
      return NextResponse.json<SyncResponse>(
        { success: false, error: 'Access denied to Round 2' },
        { status: 403 }
      );
    }

    const teamId = session.user.teamId;

    const identifier = `${teamId}_r2`;
    const rateLimit = await checkRateLimit(identifier, 5, 60000);

    if (rateLimit.limited) {
      const resetIn = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json<SyncResponse>(
        { success: false, error: `Rate limit exceeded. Try again in ${resetIn} seconds.` },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
          }
        }
      );
    }

    await connectDB();

    // Get team from database
    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json<SyncResponse>(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    const cfHandle = team.codeforcesHandle;
    if (!cfHandle) {
      return NextResponse.json<SyncResponse>(
        { success: false, error: 'Codeforces handle not set for this team' },
        { status: 400 }
      );
    }

    const allQuestions = await QuestionR2.find({}).sort({ gridIndex: 1 });
    if (!allQuestions || allQuestions.length === 0) {
      return NextResponse.json<SyncResponse>(
        { success: false, error: 'No Round 2 questions found' },
        { status: 404 }
      );
    }

    let teamScore = await TeamScoreR2.findOne({ teamId });
    if (!teamScore) {
      return NextResponse.json<SyncResponse>(
        { success: false, error: 'Team not initialized. Please load the game first.' },
        { status: 400 }
      );
    }

    const teamQuestions = teamScore.questionOrder.map((originalIndex: number, gridPosition: number) => {
      const question = allQuestions[originalIndex];
      return { ...question.toObject(), gridIndex: gridPosition };
    });

    const submissionsResult = await fetchTeamSubmissions([cfHandle]);

    if (!submissionsResult.success) {
      return NextResponse.json<SyncResponse>(
        { success: false, error: submissionsResult.error },
        { status: 502 }
      );
    }

    const scoreResult = calculateTeamScore(
      submissionsResult.submissions!,
      teamQuestions
    );

    let lastSubmissionTime: Date | null = null;
    if (scoreResult.solvedIndices.length > 0) {
      const solvedProblems = teamQuestions.filter((p: any) =>
        scoreResult.solvedIndices.includes(p.gridIndex)
      );

      const relevantSubmissions = submissionsResult.submissions!.filter(
        (sub: any) =>
          solvedProblems.some(
            (p: any) =>
              String(sub.problem.contestId) === String(p.contestId) &&
              sub.problem.index.toUpperCase() === p.problemIndex.toUpperCase()
          )
      );

      if (relevantSubmissions.length > 0) {
        const latestTimestamp = Math.max(...relevantSubmissions.map((s: any) => s.creationTimeSeconds));
        lastSubmissionTime = new Date(latestTimestamp * 1000);
      }
    }

    await TeamScoreR2.findOneAndUpdate(
      { teamId },
      {
        solvedIndices: scoreResult.solvedIndices,
        currentScore: scoreResult.currentScore,
        bingoLines: scoreResult.bingoLines,
        lastSubmissionTime,
        $inc: { syncCount: 1 },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json<SyncResponse>({
      success: true,
      progress: {
        solvedIndices: scoreResult.solvedIndices,
        currentScore: scoreResult.currentScore,
        bingoLines: scoreResult.bingoLines,
      },
    });
  } catch (error) {
    console.error('Sync error Round 2:', error);
    return NextResponse.json<SyncResponse>(
      { success: false, error: 'Server error during sync' },
      { status: 500 }
    );
  }
}