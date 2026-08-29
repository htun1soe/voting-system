import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Trophy, RefreshCw, Crown, Medal, ArrowLeft } from 'lucide-react';
import Layout from '../../layouts/AdminLayout';
import { motion } from 'framer-motion';

interface Winner {
  c_number: number;
  c_name: string;
  total_vote_weight: number;
}

interface WinnerTitle {
  title: string;
  total_vote_weight: number;
  winners: Winner[];
}

interface WinnersResponse {
  titles?: WinnerTitle[];
  detail?: string;
}

const rankStyle = (rank: number) => {
  // Gold / silver / bronze accents for the top 3, quiet gray after that.
  switch (rank) {
    case 0:
      return {
        ring: 'ring-2 ring-amber-300',
        badge: 'bg-amber-400 text-amber-950',
        icon: <Crown className="w-3.5 h-3.5" />,
      };
    case 1:
      return {
        ring: 'ring-1 ring-slate-300',
        badge: 'bg-slate-300 text-slate-800',
        icon: <Medal className="w-3.5 h-3.5" />,
      };
    case 2:
      return {
        ring: 'ring-1 ring-orange-200',
        badge: 'bg-orange-300 text-orange-950',
        icon: <Medal className="w-3.5 h-3.5" />,
      };
    default:
      return {
        ring: '',
        badge: 'bg-[hsl(265_20%_94%)] text-[hsl(265_10%_45%)]',
        icon: null,
      };
  }
};

const Results: React.FC = () => {
  const [, setLocation] = useLocation();
  const targetIdParam = new URLSearchParams(window.location.search).get('target_id');
  const targetId = targetIdParam ? Number(targetIdParam) : null;

  const [titles, setTitles] = useState<WinnerTitle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWinners = useCallback(async () => {
    if (targetId === null || Number.isNaN(targetId)) {
      setError('Missing target ID.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/organizer/winners?target_id=${encodeURIComponent(targetId)}`,
        { credentials: 'include' }
      );

      const data: WinnersResponse = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Unable to load results.');
        setTitles([]);
        return;
      }

      // Matches the HTML reference (`showWinners(data.titles)`) — the
      // `/api/organizer/winners` endpoint returns `titles`, not `winners`.
      setTitles(data.titles || []);
    } catch (e) {
      console.error('Failed to load winners', e);
      setError('Network error while loading results.');
      setTitles([]);
    } finally {
      setLoading(false);
    }
  }, [targetId]);

  useEffect(() => {
    loadWinners();
  }, [loadWinners]);

  return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1120px] mx-auto p-15 space-y-5"
      >
        <button
          type="button"
          onClick={() => setLocation('/admin/organizer')}
          className="flex items-center gap-2 text-sm font-semibold text-[hsl(265_10%_40%)] hover:text-[hsl(265_30%_15%)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Organizer Dashboard
        </button>

        <div className="bg-white border border-[hsl(265_10%_90%)] rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-serif font-bold text-xl text-[hsl(265_30%_15%)] flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" /> Winners / Vote Weight
            </h2>

            <button
              type="button"
              onClick={loadWinners}
              disabled={loading || targetId === null}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-[hsl(265_10%_88%)] text-sm font-semibold text-[hsl(265_10%_40%)] hover:bg-[hsl(265_20%_97%)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {titles.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {titles.map((title, idx) => {
                const sortedWinners = [...(title.winners || [])].sort(
                  (a, b) => b.total_vote_weight - a.total_vote_weight
                );

                return (
                  <motion.div
                    key={title.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="rounded-2xl border border-[hsl(265_10%_92%)] bg-gradient-to-b from-[hsl(260_30%_99%)] to-white p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif font-bold text-[hsl(265_30%_18%)]">
                        {title.title}
                      </h3>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[hsl(265_20%_95%)] text-[hsl(265_10%_45%)]">
                        {title.total_vote_weight} total votes
                      </span>
                    </div>

                    {sortedWinners.length > 0 ? (
                      <ul className="space-y-2">
                        {sortedWinners.map((w, rank) => {
                          const style = rankStyle(rank);
                          return (
                            <li
                              key={w.c_number}
                              className={`flex items-center justify-between gap-3 rounded-xl bg-white border border-[hsl(265_10%_92%)] px-3 py-2.5 ${style.ring}`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span
                                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${style.badge}`}
                                >
                                  {style.icon || `#${rank + 1}`}
                                </span>
                                <div className="min-w-0">
                                  <p className="font-semibold text-[hsl(265_30%_18%)] truncate">
                                    {w.c_name}
                                  </p>
                                  <p className="text-xs text-[hsl(265_10%_50%)]">
                                    Candidate No. {w.c_number}
                                  </p>
                                </div>
                              </div>
                              <span className="shrink-0 text-sm font-bold text-[hsl(265_30%_25%)]">
                                {w.total_vote_weight}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-xs text-[hsl(265_10%_50%)] italic">
                        No votes yet.
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            !error && (
              <p className="text-xs text-[hsl(265_10%_50%)]">
                {loading ? 'Loading results...' : 'No winners or results available yet.'}
              </p>
            )
          )}
        </div>
      </motion.div>
  );
};

export default Results;