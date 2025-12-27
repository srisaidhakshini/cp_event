export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/db';
import { QuestionR2 } from '@/models/Question';
import { TeamScoreR2 } from '@/models/TeamScore';
import { Team } from '@/models';
import { authOptions } from '../auth/[...nextauth]/route';

function shuffleArray(array: any[]) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.teamId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!session.user?.hasRound2Access) {
      return NextResponse.json(
        { success: false, error: 'Access denied to Round 2' },
        { status: 403 }
      );
    }

    await connectDB();
    const teamId = session.user.teamId;

    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    const allQuestions = await QuestionR2.find({}).sort({ gridIndex: 1 });
    if (!allQuestions || allQuestions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No Round 2 questions found' },
        { status: 404 }
      );
    }

    const randomOrder = shuffleArray([0, 1, 2, 3, 4, 5, 6, 7, 8]);

    const teamScore = await TeamScoreR2.findOneAndUpdate(
      { teamId },
      {
        $setOnInsert: {
          teamId,
          questionOrder: randomOrder,
          solvedIndices: [],
          currentScore: 0,
          bingoLines: [],
        },
      },
      {
        new: true,   // return the existing or newly inserted document
        upsert: true // insert if missing
      }
    );

    const teamQuestions = teamScore.questionOrder.map(
      (originalIndex: number, gridPosition: number) => {
        const question = allQuestions[originalIndex];
        return {
          ...question.toObject(),
          gridIndex: gridPosition,
          originalIndex,
        };
      }
    );

    const gameData = {
      name: 'Round 2',
      problems: teamQuestions,
    };

    return NextResponse.json({
      success: true,
      game: gameData,
      progress: {
        solvedIndices: teamScore.solvedIndices,
        currentScore: teamScore.currentScore,
        bingoLines: teamScore.bingoLines,
      },
      teamName: team.teamName,
    });
  } catch (error) {
    console.error('Question API Round 2 error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error fetching Round 2 questions' },
      { status: 500 }
    );
  }
}
