import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Trophy, TrendingUp, Vote, Download } from 'lucide-react';
import { useStore } from '../lib/store';
import Layout from '../components/Layout';
import type { Category } from '../lib/types';

const categoryColors: Record<string, string> = {
  'King': '#f59e0b',
  'Queen': '#ec4899',
  'Smart': '#3b82f6',
  'Style': '#10b981',
  'Mr. Popular': '#ef4444',
  'Ms. Popular': '#a855f7',
};

const Results: React.FC = () => {
  const { candidates, settings, totalVotes } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [tick, setTick] = useState(0);

  // Force re-render for real-time updates
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 4000);
    return () => clearInterval(interval);
  }, []);

  const activeCategories = settings.enabledCategories;
  const displayCategory = selectedCategory && activeCategories.includes(selectedCategory) ? selectedCategory : activeCategories[0];

  const categoryData = candidates
    .filter(c => c.category === displayCategory)
    .map(c => ({ name: c.name.split(' ')[0], votes: c.votes, fullName: c.name }))
    .sort((a, b) => b.votes - a.votes);

  const pieData = activeCategories.map(cat => {
    const catVotes = candidates.filter(c => c.category === cat).reduce((sum, c) => sum + c.votes, 0);
    return { name: cat, value: catVotes };
  });

  const leader = categoryData[0];

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-serif font-bold text-3xl text-[hsl(265_30%_15%)]">Live Results</h1>
            {settings.votingActive && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[hsl(140_60%_35%)] bg-[hsl(140_60%_93%)] px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[hsl(140_60%_45%)] animate-pulse" />
                LIVE
              </span>
            )}
          </div>
          <p className="text-[hsl(265_10%_45%)]">Real-time voting results across all categories</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[hsl(265_10%_88%)] bg-white text-[hsl(265_30%_20%)] font-medium hover:bg-[hsl(265_20%_97%)] transition-all">
          <Download className="w-5 h-5" />
          Export Results
        </button>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-[hsl(265_10%_92%)] shadow-sm p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[hsl(265_85%_95%)] flex items-center justify-center">
              <Vote className="w-5 h-5 text-[hsl(265_85%_55%)]" />
            </div>
            <span className="text-sm text-[hsl(265_10%_45%)]">Total Votes</span>
          </div>
          <p className="text-3xl font-bold font-serif text-[hsl(265_30%_15%)]">{totalVotes.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-[hsl(265_10%_92%)] shadow-sm p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[hsl(45_90%_93%)] flex items-center justify-center">
              <Trophy className="w-5 h-5 text-[hsl(45_80%_42%)]" />
            </div>
            <span className="text-sm text-[hsl(265_10%_45%)]">Current Leader ({displayCategory})</span>
          </div>
          <p className="text-2xl font-bold font-serif text-[hsl(265_30%_15%)] truncate">{leader?.fullName || '—'}</p>
          <p className="text-sm text-[hsl(265_10%_45%)]">{leader?.votes.toLocaleString() || 0} votes</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-[hsl(265_10%_92%)] shadow-sm p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[hsl(140_60%_93%)] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[hsl(140_60%_38%)]" />
            </div>
            <span className="text-sm text-[hsl(265_10%_45%)]">Candidates</span>
          </div>
          <p className="text-3xl font-bold font-serif text-[hsl(265_30%_15%)]">{candidates.filter(c => activeCategories.includes(c.category)).length}</p>
        </motion.div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {activeCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              displayCategory === cat
                ? 'text-white shadow-md'
                : 'bg-white text-[hsl(265_10%_45%)] border border-[hsl(265_10%_90%)] hover:bg-[hsl(265_20%_97%)]'
            }`}
            style={displayCategory === cat ? { backgroundColor: categoryColors[cat] } : {}}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <motion.div
          key={`bar-${displayCategory}-${tick}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-[hsl(265_10%_92%)] shadow-sm p-6"
        >
          <h2 className="font-serif font-bold text-xl text-[hsl(265_30%_15%)] mb-1">{displayCategory} — Vote Distribution</h2>
          <p className="text-sm text-[hsl(265_10%_45%)] mb-6">Live vote count per candidate</p>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={categoryData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(265_10%_92%)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(265_10%_45%)' }} axisLine={{ stroke: 'hsl(265_10%_90%)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(265_10%_45%)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid hsl(265 10% 90%)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
                cursor={{ fill: 'hsl(265_85%_97%)' }}
              />
              <Bar dataKey="votes" radius={[8, 8, 0, 0]} maxBarSize={60}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={categoryColors[displayCategory]} fillOpacity={1 - index * 0.15} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          key={`pie-${tick}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-[hsl(265_10%_92%)] shadow-sm p-6"
        >
          <h2 className="font-serif font-bold text-xl text-[hsl(265_30%_15%)] mb-1">Votes by Category</h2>
          <p className="text-sm text-[hsl(265_10%_45%)] mb-4">Overall distribution</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={categoryColors[entry.name]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid hsl(265 10% 90%)',
                  borderRadius: '12px',
                }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Leaderboard Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 bg-white rounded-2xl border border-[hsl(265_10%_92%)] shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-[hsl(265_10%_92%)]">
          <h2 className="font-serif font-bold text-xl text-[hsl(265_30%_15%)]">{displayCategory} — Full Rankings</h2>
          <p className="text-sm text-[hsl(265_10%_45%)]">Complete leaderboard with vote percentages</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[hsl(260_30%_97%)]">
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-[hsl(265_10%_45%)] px-6 py-3">Rank</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-[hsl(265_10%_45%)] px-6 py-3">Candidate</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-[hsl(265_10%_45%)] px-6 py-3 hidden sm:table-cell">Department</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider text-[hsl(265_10%_45%)] px-6 py-3">Votes</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider text-[hsl(265_10%_45%)] px-6 py-3">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(265_10%_93%)]">
              {categoryData.map((candidate, i) => {
                const total = categoryData.reduce((s, c) => s + c.votes, 0);
                const percentage = total > 0 ? ((candidate.votes / total) * 100).toFixed(1) : '0';
                return (
                  <tr key={i} className="hover:bg-[hsl(265_20%_97%)] transition-colors">
                    <td className="px-6 py-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        i === 0 ? 'bg-[hsl(45_90%_93%)] text-[hsl(45_80%_42%)]' :
                        i === 1 ? 'bg-[hsl(0_0%_90%)] text-[hsl(0_0%_40%)]' :
                        i === 2 ? 'bg-[hsl(25_60%_90%)] text-[hsl(25_60%_40%)]' :
                        'bg-[hsl(265_10%_93%)] text-[hsl(265_10%_45%)]'
                      }`}>
                        {i + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-[hsl(265_30%_15%)]">{candidate.fullName}</span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-sm text-[hsl(265_10%_45%)]">{candidates.find(c => c.name === candidate.fullName)?.department}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-[hsl(265_30%_15%)]">{candidate.votes.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-[hsl(265_10%_93%)] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%`, backgroundColor: categoryColors[displayCategory] }}
                          />
                        </div>
                        <span className="text-sm font-medium text-[hsl(265_10%_45%)] w-12 text-right">{percentage}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Results;