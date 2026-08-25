import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Trophy, RefreshCw, Filter, History } from 'lucide-react';
import Layout from '../../layouts/AdminLayout';

interface YearData {
  years: number[];
}

interface Major {
  major_id: number;
  major: string;
}

interface Standing {
  c_number: number;
  c_name: string;
  c_photo?: string;
  total_weight: number;
}

interface CurrentTitle {
  title: string;
  group: 'boy' | 'girl';
  standings: Standing[];
}

interface CurrentBoardResponse {
  festival_scope: 'major' | 'whole';
  major?: string;
  festival_year: number;
  voting_open: boolean;
  titles: CurrentTitle[];
}

interface HistoryRow {
  year: number;
  festival_scope: 'major' | 'whole';
  major?: string;
  title: string;
  candidate_number: number;
  candidate_name: string;
  candidate_photo?: string;
}

const categoryColors: Record<string, string> = {
  'boy': '#3b82f6',
  'girl': '#ec4899',
};

const Results: React.FC = () => {
  // Filter states
  const [years, setYears] = useState<number[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedScope, setSelectedScope] = useState<'whole' | 'major'>('whole');
  const [selectedMajor, setSelectedMajor] = useState<string>('');

  // Data states
  const [currentBoard, setCurrentBoard] = useState<CurrentBoardResponse | null>(null);
  const [historyRows, setHistoryRows] = useState<HistoryRow[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Selected Title Tab state for charts
  const [selectedTitleIndex, setSelectedTitleIndex] = useState<number>(0);

  // API: Fetch filter options (/api/leaderboard/years, /api/majors)
  const loadFilters = async () => {
    try {
      const [yearsRes, majorsRes] = await Promise.all([
        fetch('/api/leaderboard/years').then(r => r.json()),
        fetch('/api/majors').then(r => r.json())
      ]);

      const yearsData: YearData = yearsRes;
      const majorsData: Major[] = majorsRes;

      setYears(yearsData.years || []);
      setMajors(majorsData || []);

      if (yearsData.years?.length > 0) setSelectedYear(yearsData.years[0].toString());
      if (majorsData?.length > 0) setSelectedMajor(majorsData[0].major_id.toString());
    } catch (err) {
      console.error('Failed to load filters', err);
    }
  };

  // API: Fetch Current Live Standings (/api/leaderboard/current)
  const loadCurrent = async () => {
    try {
      const response = await fetch('/api/leaderboard/current');
      const data: CurrentBoardResponse = await response.json();
      setCurrentBoard(data);
    } catch (err) {
      console.error('Failed to load current board', err);
    }
  };

  // API: Fetch Winner History (/api/leaderboard/history)
  const loadHistory = async () => {
    if (!selectedYear) return;

    const params = new URLSearchParams();
    params.set('year', selectedYear);
    params.set('scope', selectedScope);

    if (selectedScope === 'major' && selectedMajor) {
      params.set('major_id', selectedMajor);
    }

    try {
      const response = await fetch(`/api/leaderboard/history?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        setHistoryError(data.detail || 'Unable to load history');
        setHistoryRows([]);
        return;
      }

      setHistoryError(null);
      setHistoryRows(data.history || []);
    } catch (err) {
      setHistoryError('Unable to load history');
      setHistoryRows([]);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadFilters();
      await loadCurrent();
    };
    init();

    // Live polling interval (every 5 seconds)
    const interval = setInterval(loadCurrent, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedYear) {
      loadHistory();
    }
  }, [selectedYear, selectedScope, selectedMajor]);

  const activeTitle = currentBoard?.titles[selectedTitleIndex] || currentBoard?.titles[0];

  // Prepare Bar Chart Data from active title standings
  const barChartData = (activeTitle?.standings || []).map((s) => ({
    name: `#${s.c_number} ${s.c_name.split(' ')[0]}`,
    fullName: s.c_name,
    votes: s.total_weight,
  }));

  // Prepare Pie Chart Data across all titles
  const pieChartData = (currentBoard?.titles || []).map((t) => ({
    name: t.title,
    value: t.standings.reduce((sum, s) => sum + s.total_weight, 0),
    group: t.group,
  }));

  const totalWeightedVotes = (currentBoard?.titles || []).reduce(
    (total, t) => total + t.standings.reduce((s, row) => s + row.total_weight, 0),
    0
  );

  return (
    <Layout>
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-serif font-bold text-3xl text-[hsl(265_30%_15%)]">
              Festival Leaderboard
            </h1>
            {currentBoard?.voting_open && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[hsl(140_60%_35%)] bg-[hsl(140_60%_93%)] px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[hsl(140_60%_45%)] animate-pulse" />
                LIVE
              </span>
            )}
          </div>
          <p className="text-[hsl(265_10%_45%)] text-sm">
            {currentBoard
              ? currentBoard.festival_scope === 'major'
                ? `${currentBoard.major} Major Festival · ${currentBoard.festival_year} · ${currentBoard.voting_open ? 'Live' : 'Stopped'}`
                : `Whole University Festival · ${currentBoard.festival_year} · ${currentBoard.voting_open ? 'Live' : 'Stopped'}`
              : 'Loading festival details...'}
          </p>
        </div>

        <button
          onClick={loadCurrent}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[hsl(265_10%_88%)] bg-white text-[hsl(265_30%_20%)] font-medium hover:bg-[hsl(265_20%_97%)] transition-all self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Standings
        </button>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-[hsl(265_10%_92%)] shadow-sm p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[hsl(265_85%_95%)] flex items-center justify-center">
              <Trophy className="w-5 h-5 text-[hsl(265_85%_55%)]" />
            </div>
            <span className="text-sm text-[hsl(265_10%_45%)]">Total Weighted Votes</span>
          </div>
          <p className="text-3xl font-bold font-serif text-[hsl(265_30%_15%)]">
            {totalWeightedVotes.toLocaleString()}
          </p>
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
            <span className="text-sm text-[hsl(265_10%_45%)]">
              Leading Candidate ({activeTitle?.title || '—'})
            </span>
          </div>
          <p className="text-2xl font-bold font-serif text-[hsl(265_30%_15%)] truncate">
            {activeTitle?.standings[0] ? `#${activeTitle.standings[0].c_number} ${activeTitle.standings[0].c_name}` : '—'}
          </p>
          <p className="text-sm text-[hsl(265_10%_45%)]">
            {activeTitle?.standings[0]?.total_weight.toLocaleString() || 0} weighted votes
          </p>
        </motion.div>
      </div>

      {/* Current Title Selection Tabs */}
      {currentBoard?.titles && currentBoard.titles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {currentBoard.titles.map((t, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedTitleIndex(idx)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedTitleIndex === idx
                  ? 'bg-[hsl(265_30%_20%)] text-white shadow-md'
                  : 'bg-white text-[hsl(265_10%_45%)] border border-[hsl(265_10%_90%)] hover:bg-[hsl(265_20%_97%)]'
              }`}
            >
              {t.title}
            </button>
          ))}
        </div>
      )}

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-[hsl(265_10%_92%)] shadow-sm p-6"
        >
          <h2 className="font-serif font-bold text-xl text-[hsl(265_30%_15%)] mb-1">
            {activeTitle?.title || 'Standings'} — Vote Distribution
          </h2>
          <p className="text-sm text-[hsl(265_10%_45%)] mb-6">Live weighted votes per candidate</p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={barChartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(265_10%_92%)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(265_10%_45%)' }} axisLine={{ stroke: 'hsl(265_10%_90%)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(265_10%_45%)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid hsl(265 10% 90%)',
                  borderRadius: '12px',
                }}
              />
              <Bar dataKey="votes" radius={[8, 8, 0, 0]} maxBarSize={60}>
                {barChartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={categoryColors[activeTitle?.group || 'boy']}
                    fillOpacity={1 - index * 0.12}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-[hsl(265_10%_92%)] shadow-sm p-6"
        >
          <h2 className="font-serif font-bold text-xl text-[hsl(265_30%_15%)] mb-1">Votes by Title</h2>
          <p className="text-sm text-[hsl(265_10%_45%)] mb-4">Overall category breakdown</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={categoryColors[entry.group] || '#a855f7'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid hsl(265 10% 90%)',
                  borderRadius: '12px',
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Live Standings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-[hsl(265_10%_92%)] shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-[hsl(265_10%_92%)]">
          <h2 className="font-serif font-bold text-xl text-[hsl(265_30%_15%)]">
            {activeTitle?.title || 'Category'} — Standings
          </h2>
          <p className="text-sm text-[hsl(265_10%_45%)]">Real-time candidate rankings</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[hsl(260_30%_97%)]">
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-[hsl(265_10%_45%)] px-6 py-3">Rank</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-[hsl(265_10%_45%)] px-6 py-3">Candidate</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider text-[hsl(265_10%_45%)] px-6 py-3">Weighted Votes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(265_10%_93%)]">
              {activeTitle?.standings && activeTitle.standings.length > 0 ? (
                activeTitle.standings.map((row, i) => (
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
                      <div className="flex items-center gap-3">
                        {row.c_photo && (
                          <img
                            src={row.c_photo}
                            alt={row.c_name}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                        )}
                        <span className="font-semibold text-[hsl(265_30%_15%)]">
                          #{row.c_number} {row.c_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-[hsl(265_30%_15%)]">
                        {row.total_weight.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-6 text-center text-sm text-[hsl(265_10%_45%)]">
                    No votes recorded yet for this title.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* History Filters & Output */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-[hsl(265_10%_92%)] shadow-sm p-6 space-y-6"
      >
        <div className="border-b border-[hsl(265_10%_92%)] pb-4">
          <h2 className="font-serif font-bold text-xl text-[hsl(265_30%_15%)] flex items-center gap-2">
            <History className="w-5 h-5 text-[hsl(265_85%_55%)]" /> Selected Winner History
          </h2>
          <p className="text-sm text-[hsl(265_10%_45%)]">Filter past festival winners by year, scope, and major</p>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(265_10%_50%)] mb-1.5">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[hsl(265_10%_88%)] text-sm bg-white outline-none"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(265_10%_50%)] mb-1.5">
              Festival Type
            </label>
            <select
              value={selectedScope}
              onChange={(e) => setSelectedScope(e.target.value as 'whole' | 'major')}
              className="w-full px-4 py-2.5 rounded-xl border border-[hsl(265_10%_88%)] text-sm bg-white outline-none"
            >
              <option value="whole">Whole University</option>
              <option value="major">Major Festival</option>
            </select>
          </div>

          {selectedScope === 'major' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(265_10%_50%)] mb-1.5">
                Major
              </label>
              <select
                value={selectedMajor}
                onChange={(e) => setSelectedMajor(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[hsl(265_10%_88%)] text-sm bg-white outline-none"
              >
                {majors.map((m) => (
                  <option key={m.major_id} value={m.major_id}>{m.major}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button
          onClick={loadHistory}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[hsl(265_30%_20%)] text-white font-bold text-sm hover:scale-[1.01] transition-all"
        >
          <Filter className="w-4 h-4" /> Show Winners
        </button>

        {/* Winner History Table */}
        <div className="overflow-x-auto rounded-xl border border-[hsl(265_10%_92%)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[hsl(260_30%_97%)] border-b border-[hsl(265_10%_90%)]">
                <th className="px-6 py-3 font-semibold text-[hsl(265_10%_45%)]">Year</th>
                <th className="px-6 py-3 font-semibold text-[hsl(265_10%_45%)]">Festival</th>
                <th className="px-6 py-3 font-semibold text-[hsl(265_10%_45%)]">Major</th>
                <th className="px-6 py-3 font-semibold text-[hsl(265_10%_45%)]">Title</th>
                <th className="px-6 py-3 font-semibold text-[hsl(265_10%_45%)]">Winner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(265_10%_92%)]">
              {historyError ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-red-600">
                    {historyError}
                  </td>
                </tr>
              ) : historyRows.length > 0 ? (
                historyRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[hsl(265_20%_97%)] transition-colors">
                    <td className="px-6 py-4 font-medium">{row.year}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[hsl(265_85%_95%)] text-[hsl(265_85%_35%)]">
                        {row.festival_scope === 'major' ? 'Major' : 'Whole'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[hsl(265_10%_45%)]">{row.major || '—'}</td>
                    <td className="px-6 py-4 font-semibold text-[hsl(265_30%_15%)]">{row.title}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {row.candidate_photo && (
                          <img
                            src={row.candidate_photo}
                            alt={row.candidate_name}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                        )}
                        <span className="font-semibold text-[hsl(265_30%_15%)]">
                          #{row.candidate_number} {row.candidate_name}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-[hsl(265_10%_45%)]">
                    No saved winners for this selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
    </Layout>
  );
};

export default Results;