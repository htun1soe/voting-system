import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, RefreshCw, QrCode, Trophy, Download } from 'lucide-react';
import Layout from '../../layouts/AdminLayout';

interface Major {
  major_id: number;
  major: string;
}

interface MajorCompletionStatus {
  major_id: number;
  major: string;
  status: number;
}

interface CompletionData {
  year: number;
  majors: MajorCompletionStatus[];
  whole: {
    status: number;
  };
}

interface StatusData {
  voting_open: boolean;
  festival_scope: 'major' | 'whole';
  major?: string;
  students: number;
  teachers: number;
}

interface Winner {
  c_number: number;
  c_name: string;
  c_photo?: string;
  total_weight: number;
}

interface WinnerTitle {
  title: string;
  group: 'boy' | 'girl';
  winners: Winner[];
}

const Candidates: React.FC = () => {
  // State management for Organizer features
  const [completionData, setCompletionData] = useState<CompletionData | null>(null);
  const [majors, setMajors] = useState<Major[]>([]);
  const [statusData, setStatusData] = useState<StatusData | null>(null);

  // Form selections
  const [festivalScope, setFestivalScope] = useState<'major' | 'whole'>('major');
  const [selectedMajor, setSelectedMajor] = useState<string>('');
  const [includePopular, setIncludePopular] = useState<boolean>(true);

  // QR Code form state
  const [qrStudents, setQrStudents] = useState<number>(10);
  const [qrTeachers, setQrTeachers] = useState<number>(5);
  const [qrMessage, setQrMessage] = useState<string>('');

  // Winners state
  const [winners, setWinners] = useState<WinnerTitle[]>([]);

  // Helpers
  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0: return 'Not started';
      case 1: return 'Currently running';
      case 2: return 'Completed';
      default: return 'Unknown';
    }
  };

  // API Call: Fetch Completion Data & Majors
  const loadCompletion = async () => {
    try {
      const response = await fetch('/api/organizer/completion', { credentials: 'include' });
      if (!response.ok) return;

      const data: CompletionData = await response.json();
      setCompletionData(data);

      // Fetch Majors
      const majorsRes = await fetch('/api/majors');
      const majorsData: Major[] = await majorsRes.json();
      setMajors(majorsData);

      if (majorsData.length > 0 && !selectedMajor) {
        setSelectedMajor(majorsData[0].major_id.toString());
      }
    } catch (err) {
      console.error('Error fetching completion data:', err);
    }
  };

  // API Call: Fetch Status Data
  const loadStatus = async () => {
    try {
      const response = await fetch('/api/organizer/status', { credentials: 'include' });
      if (!response.ok) return;

      const data: StatusData = await response.json();
      setStatusData(data);
    } catch (err) {
      console.error('Error fetching status data:', err);
    }
  };

  const refreshOrganizer = async () => {
    await loadCompletion();
    await loadStatus();
  };

  useEffect(() => {
    refreshOrganizer();
  }, []);

  // API Call: Start Voting
  const handleStartVoting = async () => {
    const form = new FormData();
    form.append('scope', festivalScope);

    if (festivalScope === 'major') {
      if (!selectedMajor) {
        alert('No available major can be started.');
        return;
      }
      form.append('major_id', selectedMajor);
      form.append('include_popular', includePopular.toString());
    } else {
      form.append('include_popular', 'true');
    }

    try {
      const response = await fetch('/api/organizer/start', {
        method: 'POST',
        body: form,
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.detail || 'Unable to start voting');
        return;
      }

      setWinners([]);
      await refreshOrganizer();
    } catch (err) {
      alert('Failed to start voting');
    }
  };

  // API Call: Stop Voting
  const handleStopVoting = async () => {
    try {
      const response = await fetch('/api/organizer/stop', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.detail || 'Unable to stop voting');
        return;
      }

      await refreshOrganizer();
      if (data.winners) {
        setWinners(data.winners);
      }
    } catch (err) {
      alert('Failed to stop voting');
    }
  };

  // API Call: Generate QR Codes
  const handleGenerateQr = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData();
    form.append('students', qrStudents.toString());
    form.append('teachers', qrTeachers.toString());

    try {
      const response = await fetch('/api/organizer/generate-qr', {
        method: 'POST',
        body: form,
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) {
        setQrMessage(data.detail || 'QR generation failed');
        return;
      }

      setQrMessage(`Students: ${data.counts.students}, Teachers: ${data.counts.teachers}`);
      await loadStatus();
    } catch (err) {
      setQrMessage('QR generation failed');
    }
  };

  // API Call: Download QR Codes
  const handleDownloadQr = (role: 'student' | 'teacher') => {
    window.location.href = `/api/organizer/download-qr/${role}`;
  };

  // API Call: Load Winners
  const handleLoadWinners = async () => {
    try {
      const response = await fetch('/api/organizer/winners', { credentials: 'include' });
      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || 'Winners unavailable');
        return;
      }

      setWinners(data.titles);
    } catch (err) {
      alert('Failed to load winners');
    }
  };

  const statusMap = new Map(
    (completionData?.majors || []).map((item) => [item.major_id, item.status])
  );

  return (
    <Layout>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-[hsl(265_10%_90%)] shadow-xl overflow-hidden max-w-xl mx-auto space-y-8 p-8"
    >
      {/* Header */}
      <div className="p-6 border-b border-[hsl(265_10%_92%)] bg-[hsl(265_85%_98%)] rounded-xl">
        <h2 className="font-serif font-bold text-2xl text-[hsl(265_30%_15%)]">Organizer Dashboard</h2>
      </div>

      {/* Festival Status Section */}
      <div className="p-6 rounded-2xl border border-[hsl(265_10%_90%)] bg-[hsl(260_30%_99%)] space-y-4">
        <h3 className="font-serif font-bold text-xl text-[hsl(265_30%_15%)]">Festival Status</h3>
        <p className="text-xs text-[hsl(265_10%_50%)]">
          {completionData ? `Year: ${completionData.year}` : 'Loading status...'}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[hsl(265_10%_90%)]">
                <th className="py-2">Festival</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {completionData?.majors.map((item) => (
                <tr key={item.major_id} className="border-b border-[hsl(265_10%_92%)]">
                  <td className="py-2">{item.major}</td>
                  <td className="py-2">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-[hsl(265_85%_95%)] text-[hsl(265_85%_35%)]">
                      {getStatusLabel(item.status)}
                    </span>
                  </td>
                </tr>
              ))}
              {completionData?.whole && (
                <tr className="border-b border-[hsl(265_10%_92%)]">
                  <td className="py-2 font-medium">Whole University</td>
                  <td className="py-2">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-[hsl(265_85%_95%)] text-[hsl(265_85%_35%)]">
                      {getStatusLabel(completionData.whole.status)}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Festival Setup Section */}
      <div className="p-6 rounded-2xl border border-[hsl(265_10%_90%)] bg-[hsl(260_30%_99%)] space-y-4">
        <h3 className="font-serif font-bold text-xl text-[hsl(265_30%_15%)]">Festival Setup</h3>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(265_10%_50%)] mb-1.5">Festival Type</label>
          <select
            value={festivalScope}
            onChange={(e) => setFestivalScope(e.target.value as 'major' | 'whole')}
            className="w-full px-4 py-3 rounded-xl border border-[hsl(265_10%_88%)] bg-white text-sm outline-none"
          >
            <option value="major">Major Festival</option>
            <option value="whole">The Whole University</option>
          </select>
        </div>

        {festivalScope === 'major' ? (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(265_10%_50%)] mb-1.5">Major</label>
            <select
              value={selectedMajor}
              onChange={(e) => setSelectedMajor(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[hsl(265_10%_88%)] bg-white text-sm outline-none"
            >
              {majors.map((m) => {
                const status = statusMap.get(m.major_id) || 0;
                return (
                  <option key={m.major_id} value={m.major_id} disabled={status !== 0}>
                    {m.major} - {getStatusLabel(status)}
                  </option>
                );
              })}
            </select>

            <label className="flex items-center gap-2 mt-3 text-sm text-[hsl(265_30%_20%)] cursor-pointer">
              <input
                type="checkbox"
                checked={includePopular}
                onChange={(e) => setIncludePopular(e.target.checked)}
                className="rounded border-[hsl(265_10%_88%)]"
              />
              Include Mr.Popular and Ms.Popular
            </label>
          </div>
        ) : (
          <p className="text-xs text-[hsl(265_10%_50%)]">
            Whole University Festival always includes all six titles.
          </p>
        )}

        <p className="text-sm font-semibold text-[hsl(265_30%_25%)] pt-2">
          {statusData?.voting_open
            ? `Running: ${statusData.festival_scope === 'major' ? `${statusData.major} Major Festival` : 'Whole University Festival'}`
            : 'No festival is currently running.'}
        </p>

        <div className="flex flex-wrap gap-4 pt-4">
          <button
            type="button"
            onClick={handleStartVoting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl green-bg text-white font-bold text-sm hover:bg-green-800 transition-all"
          >
            <Play className="w-4 h-4" /> Start Voting
          </button>
          <button
            type="button"
            onClick={handleStopVoting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-700 text-white font-bold text-sm hover:bg-red-800 transition-all"
          >
            <Square className="w-4 h-4" /> Stop Voting & Save Winners
          </button>
          <button
            type="button"
            onClick={refreshOrganizer}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[hsl(265_10%_88%)] text-sm font-semibold text-[hsl(265_10%_40%)] hover:bg-[hsl(265_20%_97%)] transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* QR Codes Section */}
      <div className="p-6 rounded-2xl border border-[hsl(265_10%_90%)] bg-[hsl(260_30%_99%)] space-y-4">
        <h3 className="font-serif font-bold text-xl text-[hsl(265_30%_15%)] flex items-center gap-2">
          <QrCode className="w-5 h-5" /> QR Codes
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-xl border border-[hsl(265_10%_90%)] text-center">
            <span className="text-xs uppercase font-bold text-[hsl(265_10%_50%)]">Students</span>
            <div className="text-3xl font-extrabold text-[hsl(265_30%_15%)]">{statusData?.students || 0}</div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-[hsl(265_10%_90%)] text-center">
            <span className="text-xs uppercase font-bold text-[hsl(265_10%_50%)]">Teachers</span>
            <div className="text-3xl font-extrabold text-[hsl(265_30%_15%)]">{statusData?.teachers || 0}</div>
          </div>
        </div>

        <form onSubmit={handleGenerateQr} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(265_10%_50%)] mb-1.5">Target Students</label>
              <input
                type="number"
                min="0"
                value={qrStudents}
                onChange={(e) => setQrStudents(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border border-[hsl(265_10%_88%)] text-sm outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(265_10%_50%)] mb-1.5">Target Teachers</label>
              <input
                type="number"
                min="0"
                value={qrTeachers}
                onChange={(e) => setQrTeachers(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border border-[hsl(265_10%_88%)] text-sm outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl green-bg text-white font-bold text-sm transition-all"
          >
            {statusData?.students === 0 && statusData?.teachers === 0
              ? 'Generate QR Codes'
              : 'Generate Needed QR Codes'}
          </button>
        </form>

        <div className="flex flex-wrap gap-4 pt-2">
          <button
            type="button"
            disabled={statusData?.students === 0}
            onClick={() => handleDownloadQr('student')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[hsl(265_10%_88%)] text-sm font-semibold text-[hsl(265_10%_40%)] disabled:opacity-50 hover:bg-[hsl(265_20%_97%)] transition-all"
          >
            <Download className="w-4 h-4" /> Download Students Folder
          </button>
          <button
            type="button"
            disabled={statusData?.teachers === 0}
            onClick={() => handleDownloadQr('teacher')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[hsl(265_10%_88%)] text-sm font-semibold text-[hsl(265_10%_40%)] disabled:opacity-50 hover:bg-[hsl(265_20%_97%)] transition-all"
          >
            <Download className="w-4 h-4" /> Download Teachers Folder
          </button>
        </div>

        {qrMessage && <p className="text-xs text-[hsl(265_10%_50%)] pt-1">{qrMessage}</p>}
      </div>

      {/* Final Winners Section */}
      <div className="p-6 rounded-2xl border border-[hsl(265_10%_90%)] bg-[hsl(260_30%_99%)] space-y-4">
        <h3 className="font-serif font-bold text-xl text-[hsl(265_30%_15%)] flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" /> Final Winners
        </h3>

        <button
          type="button"
          onClick={handleLoadWinners}
          className="px-6 py-2.5 rounded-xl border border-[hsl(265_10%_88%)] text-sm font-semibold text-[hsl(265_10%_40%)] hover:bg-[hsl(265_20%_97%)] transition-all"
        >
          Load Current Festival Winners
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {winners.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${
                item.group === 'boy'
                  ? 'bg-blue-50/50 border-blue-100'
                  : 'bg-pink-50/50 border-pink-100'
              }`}
            >
              <h4 className="font-bold text-md text-[hsl(265_30%_15%)] mb-2">{item.title}</h4>
              {item.winners.length > 0 ? (
                item.winners.map((winner, wIdx) => (
                  <div key={wIdx} className="flex items-center gap-3 mt-2">
                    {winner.c_photo && (
                      <img
                        src={winner.c_photo}
                        alt={winner.c_name}
                        className="w-14 h-14 object-cover rounded-xl"
                      />
                    )}
                    <div>
                      <p className="font-bold text-sm">
                        #{winner.c_number} {winner.c_name}
                      </p>
                      <p className="text-xs text-[hsl(265_10%_50%)]">
                        Weighted votes: {winner.total_weight}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[hsl(265_10%_50%)]">No votes for this title.</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
    </Layout>
  );
};

export default Candidates;