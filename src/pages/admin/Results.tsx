import React from 'react';
import { Trophy, RefreshCw } from 'lucide-react';
import Layout from "../../layouts/AdminLayout";
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

interface WinnerDisplayProps {
  winners: WinnerTitle[];
  onRefresh: () => void;
  disabled?: boolean;
}

export const WinnerDisplay: React.FC<WinnerDisplayProps> = ({ winners, onRefresh }) => {
  return (
    <Layout> 
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1120px] mx-auto space-y-5"
      >
    <div className="bg-white border border-[hsl(265_10%_90%)] rounded-2xl p-6 shadow-xl space-y-4">
      <h2 className="font-serif font-bold text-xl text-[hsl(265_30%_15%)] flex items-center gap-2">
        <Trophy className="w-5 h-5 text-amber-500" /> Winners / Vote Weight
      </h2>
      <button
        type="button"
        onClick={onRefresh}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-[hsl(265_10%_88%)] text-sm font-semibold text-[hsl(265_10%_40%)] hover:bg-[hsl(265_20%_97%)] transition-all"
      >
        <RefreshCw className="w-4 h-4" /> Refresh
      </button>

      <div className="space-y-3 pt-2">
        {winners.length > 0 ? (
          winners.map((title, idx) => (
            <div key={idx} className="bg-[hsl(260_30%_99%)] p-4 rounded-xl border border-[hsl(265_10%_92%)] text-sm space-y-1">
              <p>
                <b>{title.title}</b> — Total vote weight: {title.total_vote_weight}
                <br />
                <span className="text-[hsl(265_10%_50%)]">
                  {title.winners && title.winners.length > 0
                    ? title.winners.map((w) => `${w.c_name} (#${w.c_number}) — ${w.total_vote_weight}`).join(', ')
                    : 'No votes'}
                </span>
              </p>
            </div>
          ))
        ) : (
          <p className="text-xs text-[hsl(265_10%_50%)]">No winners or results available yet.</p>
        )}
      </div>
    </div>
    </motion.div>
    </Layout>
  );
};