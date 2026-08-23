import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Users } from 'lucide-react';
import { useStore } from '../../lib/store';
import Layout from '../../layouts/AdminLayout';
import CandidateCard from '../../components/ui/CandidateCard';
import CandidateModal from '../../components/ui/CandidateModal';
import type { Candidate, Category } from '../../lib/types';

const Candidates: React.FC = () => {
  const { candidates, settings, addCandidate, updateCandidate, deleteCandidate } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      if (filterCategory !== 'All' && c.category !== filterCategory) return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.department.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [candidates, search, filterCategory]);

  const handleAdd = () => {
    setEditingCandidate(null);
    setModalOpen(true);
  };

  const handleEdit = (c: Candidate) => {
    setEditingCandidate(c);
    setModalOpen(true);
  };

  const handleSave = (data: Omit<Candidate, 'id' | 'votes'>) => {
    if (editingCandidate) {
      updateCandidate(editingCandidate.id, data);
    } else {
      addCandidate(data);
    }
  };

  const handleDelete = (id: string) => {
    deleteCandidate(id);
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="font-serif font-bold text-3xl text-[hsl(265_30%_15%)] mb-1">Candidates</h1>
          <p className="text-[hsl(265_10%_45%)]">Manage candidate profiles, photos, and information</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl green-bg text-white font-semibold hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Candidate
        </button>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(265_10%_50%)] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or department..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[hsl(265_10%_88%)] bg-white focus:ring-2 focus:ring-[hsl(265_85%_60%)]/50 focus:border-[hsl(265_85%_60%)] outline-none transition-all text-[hsl(265_30%_15%)]"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(265_10%_50%)] pointer-events-none" />
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value as Category | 'All')}
            className="pl-11 pr-8 py-2.5 rounded-xl border border-[hsl(265_10%_88%)] bg-white focus:ring-2 focus:ring-[hsl(265_85%_60%)]/50 focus:border-[hsl(265_85%_60%)] outline-none transition-all text-[hsl(265_30%_15%)] appearance-none cursor-pointer min-w-[180px]"
          >
            <option value="All">All Categories</option>
            {settings.enabledCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {filteredCandidates.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[hsl(265_85%_95%)] flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-[oklch(45%_0.07_180)] " />
          </div>
          <h3 className="font-serif font-bold text-xl text-[hsl(265_30%_15%)] mb-2">No candidates found</h3>
          <p className="text-[hsl(265_10%_45%)] mb-6 max-w-sm">
            {search || filterCategory !== 'All'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first candidate to the election.'}
          </p>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl green-bg text-white font-semibold hover:scale-105 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Candidate
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCandidates.map((candidate, i) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              onEdit={handleEdit}
              onDelete={handleDelete}
              delay={i * 0.05}
            />
          ))}
        </div>
      )}

      <CandidateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        candidate={editingCandidate}
        categories={settings.enabledCategories}
      />
    </Layout>
  );
};

export default Candidates;