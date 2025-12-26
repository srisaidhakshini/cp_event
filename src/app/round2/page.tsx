'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { GridCell } from '@/components/GridCell';
import { SyncButton } from '@/components/SyncButton';
import type { IProblem } from '@/types';

interface GameData {
  id: string;
  name: string;
  problems: IProblem[];
}

interface Progress {
  solvedIndices: number[];
  currentScore: number;
  bingoLines: number[][];
}

export default function Round2Page() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [game, setGame] = useState<GameData | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [teamName, setTeamName] = useState<string>('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || !session.user?.hasRound2Access) {
      router.push('/round1');
    }
  }, [session, status, router]);

  useEffect(() => {
    const loadRound2Data = async () => {
      try {
        const res = await fetch('/api/question-r2');
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to load questions');
        }

        setGame(data.game);
        setProgress(data.progress);
        setTeamName(data.teamName || 'Unknown Team');
      } catch (err) {
        setError('Failed to load Round 2 game data');
      } finally {
        setLoading(false);
      }
    };

    loadRound2Data();
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const handleSync = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch('/api/sync-r2', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        setProgress(data.progress);
        setLastSyncTime(new Date());
      } else {
        setError(data.error || 'Sync failed');
      }
    } catch (err) {
      setError('Failed to sync with Codeforces');
    }
  }, []);

  const getBingoIndices = useCallback((): Set<number> => {
    if (!progress?.bingoLines) return new Set();
    const indices = new Set<number>();
    for (const line of progress.bingoLines) {
      for (const idx of line) {
        indices.add(idx);
      }
    }
    return indices;
  }, [progress?.bingoLines]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-2 border-white/20 animate-spin" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-2 border-2 border-white/40 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
            <div className="absolute inset-4 border-2 border-white/60 animate-spin" style={{ animationDuration: '1s' }} />
          </div>
          <p className="font-ui text-[10px] uppercase tracking-[0.3em] text-white/40">
            Initializing Round 2...
          </p>
        </div>
      </div>
    );
  }

  const bingoIndices = getBingoIndices();
  const solvedSet = new Set(progress?.solvedIndices || []);

  return (
    <div className="min-h-screen bg-[#050505] text-[#F2F2F2]">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        
        {/* Header Section - Same UI, Different Logic */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6 sm:mb-8 border-b border-white/10 pb-4 sm:pb-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sans font-black tracking-tighter uppercase mb-2 chrome-text">
              {game?.name || 'Round 2'}
            </h1>

            <div className="flex flex-wrap items-center gap-4 font-ui text-[9px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.3em] text-purple-300/40 uppercase">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-purple-500 animate-pulse rounded-full shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                ELITE_CONTEST
              </span>
              <span className="h-[1px] w-8 sm:w-12 bg-white/10" />
              <span>GRID: 3×3</span>
            </div>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => window.location.href = '/leaderboard-r2'}
                className="px-4 py-2 border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-ui text-[10px] uppercase tracking-widest transition-all rounded-lg"
              >
                Leaderboard
              </button>
              <button 
                onClick={handleLogoutClick}
                className="px-4 py-2 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 font-ui text-[10px] uppercase tracking-widest transition-all rounded-lg"
              >
                Logout
              </button>
            </div>
            <p className="font-ui text-[10px] sm:text-xs text-white/30 max-w-[280px] leading-relaxed uppercase tracking-wider text-left lg:text-right">
              Round 2: Advanced Challenges. Complete rows, columns, or diagonals for elite bonus points.
            </p>
          </div>
        </header>

        {/* Stats Dashboard - Connecting to ProgressR2 */}
        <section className="flex justify-center mb-12 sm:mb-16">
          <div className="flex w-full max-w-md sm:max-w-3xl bg-[#0b0b0b] rounded-3xl border border-purple-500/20 overflow-hidden shadow-[0_10px_40px_rgba(168,85,247,0.1)]">
            
            <div className="flex-1 min-w-0 py-4 sm:py-6 flex flex-col group hover:bg-white/5 transition-all pl-6 sm:pl-10">
              <p className="font-ui text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-white/40 mb-1 text-left">Total Score</p>
              <div className="flex items-end justify-start gap-1.5">
                <span className="text-3xl sm:text-5xl font-sans font-black tracking-tighter tabular-nums text-white">
                  {progress?.currentScore || 0}
                </span>
                <span className="font-ui text-[9px] sm:text-[10px] text-white/20 mb-1 uppercase">pts</span>
              </div>
            </div>

            <div className="w-px bg-white/10 my-4 sm:my-6" />

            <div className="flex-1 min-w-0 py-4 sm:py-6 flex flex-col group hover:bg-white/5 transition-all pl-6 sm:pl-10">
              <p className="font-ui text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-white/40 mb-1 text-left">Solved</p>
              <div className="flex items-end justify-start gap-1.5">
                <span className="text-3xl sm:text-5xl font-sans font-black tracking-tighter tabular-nums text-white">
                  {progress?.solvedIndices?.length || 0}
                </span>
                <span className="font-ui text-[9px] sm:text-[10px] text-white/20 mb-1 uppercase">/ 09</span>
              </div>
            </div>

            <div className="w-px bg-white/10 my-4 sm:my-6" />

            <div className="flex-1 min-w-0 py-4 sm:py-6 flex flex-col group hover:bg-white/5 transition-all pl-6 sm:pl-10">
              <p className="font-ui text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-white/40 mb-1 text-left">Bingo Lines</p>
              <div className="flex items-end justify-start gap-1.5">
                <span className="text-3xl sm:text-5xl font-sans font-black tracking-tighter tabular-nums text-white">
                  {progress?.bingoLines?.length || 0}
                </span>
                <span className="font-ui text-[9px] sm:text-[10px] text-white/20 mb-1 uppercase">bin</span>
              </div>
            </div>
          </div>
        </section>

        {/* Grid Container */}
        <div className="grid grid-cols-3 gap-0 border border-purple-500/20 mb-6 sm:mb-8 shadow-[0_0_60px_rgba(168,85,247,0.08)]">
          {game?.problems
            .sort((a, b) => a.gridIndex - b.gridIndex)
            .map((problem) => (
              <div key={problem.gridIndex} className="border border-white/5">
                <GridCell
                  problem={problem}
                  isSolved={solvedSet.has(problem.gridIndex)}
                  isBingoCell={bingoIndices.has(problem.gridIndex)}
                />
              </div>
            ))}
        </div>

        {/* Sync Area */}
        <div className="flex flex-col items-center gap-8 sm:gap-12">
          <SyncButton onSync={handleSync} lastSyncTime={lastSyncTime} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 w-full pt-8 sm:pt-12 border-t border-white/10">
            <div className="space-y-4">
              <p className="font-ui text-[10px] uppercase tracking-[0.3em] font-bold text-white/80">Scoring Rules</p>
              <p className="text-white/40 text-[10px] sm:text-xs leading-relaxed font-ui uppercase">
                +10 points per solved problem. +30 bonus for each bingo line (row, column, or diagonal).
              </p>
            </div>

            <div className="space-y-4 font-ui">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/80">Possible Lines</p>
              <ul className="text-white/40 text-[10px] space-y-2 uppercase tracking-widest">
                <li className="flex justify-between"><span>Rows</span><span className="text-white/60">[ 03 ]</span></li>
                <li className="flex justify-between"><span>Columns</span><span className="text-white/60">[ 03 ]</span></li>
                <li className="flex justify-between"><span>Diagonals</span><span className="text-white/60">[ 02 ]</span></li>
              </ul>
            </div>

            <div className="space-y-4 font-ui">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/80">System Status</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-purple-300/40 text-[10px] uppercase">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.6)] animate-pulse" />
                  Elite Contest Active
                </div>
                {lastSyncTime && (
                  <p className="text-white/20 text-[10px] uppercase">
                    Last sync: {lastSyncTime.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>


        {/* Legend - Reduced top margin */}
        <div className="mt-8 sm:mt-10 pt-8 border-t border-white/5">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-black/40 border border-white/10" />
              <span className="font-ui text-[10px] uppercase tracking-wider text-white/40">Unsolved</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-white border border-white" />
              <span className="font-ui text-[10px] uppercase tracking-wider text-white/40">Solved</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-white border border-white ring-2 ring-white ring-offset-2 ring-offset-black" />
              <span className="font-ui text-[10px] uppercase tracking-wider text-white/40">Bingo Cell</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Reduced top margin and padding */}
      <footer className="border-t border-white/5 mt-8 sm:mt-6 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <p className="font-ui text-[10px] uppercase tracking-[0.2em] text-white/20">Codeforces Bingo Contest</p>
          <p className="font-ui text-[10px] uppercase tracking-[0.2em] text-white/20">Round 2 — Active</p>
        </div>
      </footer>

      {/* Logout Confirmation Modal - Purple Theme */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b0b0b] border border-purple-500/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-[0_20px_60px_rgba(168,85,247,0.2)]">
            <h2 className="text-2xl font-sans font-black tracking-tighter uppercase mb-4 text-white">
              Confirm Sign Out
            </h2>
            <p className="font-ui text-sm text-white/60 mb-8 uppercase tracking-wider">
              Are you sure you want to sign out? You will be redirected to the home page.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-6 py-3 border border-white/10 bg-white/5 hover:bg-white/10 text-white font-ui text-[10px] uppercase tracking-widest transition-all rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 px-6 py-3 border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-ui text-[10px] uppercase tracking-widest transition-all rounded-lg"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}