// ===========================================
// LEADERBOARD API - Round 1
// ===========================================

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { TeamScore, Team } from '@/models';
import type { LeaderboardResponse, LeaderboardEntry } from '@/types';

export async function GET() {
    try {
        await connectDB();

        const teamScores = await TeamScore.find({})
            .sort({ currentScore: -1, lastSubmissionTime: 1 })
            .lean();

        const teams = await Team.find({}).lean();
        const teamMap = new Map(teams.map(t => [t._id.toString(), t]));

        const leaderboard: LeaderboardEntry[] = teamScores
            .map((score) => {
                const team = teamMap.get(score.teamId);
                if (!team) return null;

                return {
                    rank: 0,
                    teamName: team.teamName,
                    score: score.currentScore,
                    solvedCount: score.solvedIndices.length,
                    bingoCount: score.bingoLines.length,
                    lastSubmissionTime: score.lastSubmissionTime,
                };
            })
            .filter((entry): entry is LeaderboardEntry => entry !== null);

        let currentRank = 1;
        for (let i = 0; i < leaderboard.length; i++) {
            if (i > 0 && leaderboard[i].score < leaderboard[i - 1].score) {
                currentRank = i + 1;
            }
            leaderboard[i].rank = currentRank;
        }

        return NextResponse.json<LeaderboardResponse>({
            success: true,
            leaderboard,
        });
    } catch (error) {
        console.error('Leaderboard API error:', error);
        return NextResponse.json<LeaderboardResponse>(
            { success: false, error: 'Failed to fetch leaderboard' },
            { status: 500 }
        );
    }
}
