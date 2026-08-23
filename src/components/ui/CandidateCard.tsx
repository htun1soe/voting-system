import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Vote } from 'lucide-react';
import type { Candidate } from '../lib/types';

interface CandidateCardProps {
  candidate: Candidate;
  onEdit: (c: Candidate) => void;
  onDelete: (id: string) => void;
  delay?: number;
}

const categoryColors: Record<string, string> = {
  'King': 'bg-[hsl(45_90%_95%)] text-[hsl(45_80%_40%)] border-[hsl(45_80%_80%)]',
  'Queen': 'bg-[hsl(320_80%_95%)] text-[hsl(320_70%_45%)] border-[hsl(320_70%_82%)]',
  'Smart': 'bg-[hsl(200_80%_95%)] text-[hsl(200_70%_40%)] border-[hsl(200_70%_80%)]',
  'Style': 'bg-[hsl(160_60%_93%)] text-[hsl(160_60%_35%)] border-[hsl(160_60%_78%)]',
  'Mr. Popular': 'bg-[hsl(15_80%_95%)] text-[hsl(15_70%_40%)] border-[hsl(15_70%_80%)]',
  'Ms. Popular': 'bg-[hsl(290_60%_95%)] text-[hsl(290_55%_45%)] border-[hsl(290_55%_82%)]',
};

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, onEdit, onDelete, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl border border-[hsl(265_10%_92%)] shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={candidate.photoUrl}
          alt={`${candidate.name} - ${candidate.category} candidate`}
          width={400}
          height={400}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${categoryColors[candidate.category] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            {candidate.category}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(candidate)}
            className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center text-[hsl(265_30%_25%)] hover:bg-white hover:scale-110 transition-all"
            aria-label={`Edit ${candidate.name}`}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(candidate.id)}
            className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center text-[hsl(0_70%_50%)] hover:bg-white hover:scale-110 transition-all"
            aria-label={`Delete ${candidate.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-serif font-bold text-lg text-[hsl(265_30%_15%)] mb-1">{candidate.name}</h3>
        <p className="text-sm text-[hsl(265_10%_50%)] mb-2">{candidate.department} · {candidate.year}</p>
        <p className="text-sm text-[hsl(265_10%_45%)] line-clamp-2 mb-4">{candidate.bio}</p>
        <div className="flex items-center justify-between pt-4 border-t border-[hsl(265_10%_93%)]">
          <div className="flex items-center gap-1.5">
            <Vote className="w-4 h-4 text-[hsl(265_85%_55%)]" />
            <span className="text-sm font-semibold text-[hsl(265_30%_20%)]">{candidate.votes.toLocaleString()}</span>
            <span className="text-xs text-[hsl(265_10%_50%)]">votes</span>
          </div>
          <span className="text-xs text-[hsl(265_10%_45%)]">ID: {candidate.id.slice(-4)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default CandidateCard;