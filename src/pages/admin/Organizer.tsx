import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Play, Square, QrCode, Download } from 'lucide-react';
import Layout from '../../layouts/AdminLayout';

interface Target {
  target_id: number;
  name: string;
  type: string;
  major_ids: number[];
}

interface TargetsData {
  targets: Target[];
}

interface StatusData {
  major: string;
  year: number;
  status: number;
  can_start: boolean;
  can_end: boolean;
  action_message?: string;
  qr_counts: {
    students: number;
    teachers: number;
  };
}

const Organizer: React.FC = () => {
  const [, setLocation] = useLocation();

  // State Management
  const [targets, setTargets] = useState<Target[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<number | ''>('');
  const [festivalStatus, setFestivalStatus] = useState<StatusData | null>(null);
  
  // QR Form State
  const [studentsInput, setStudentsInput] = useState<number>(0);
  const [teachersInput, setTeachersInput] = useState<number>(0);
  const [qrMessage, setQrMessage] = useState<string>('Current QR counts will appear here.');

  const [festivalMessage, setFestivalMessage] = useState<string>('Use Start Event when candidates and QR codes are ready.');

  // Helper: Status Label
  const statusLabel = (status: number) => {
    if (status === 1) return 'Currently running';
    if (status === 2) return 'Completed';
    return 'Not started';
  };

  // API Call: Load Organizer Targets
  const loadOrganizerTargets = async () => {
    try {
      const response = await fetch('/api/organizer/targets', { credentials: 'include' });
      const data: TargetsData = await response.json();

      if (!response.ok) {
        setFestivalMessage('Unable to load event options.');
        return;
      }

      setTargets(data.targets || []);
      if (data.targets && data.targets.length > 0) {
        setSelectedTargetId(data.targets[0].target_id);
      }
    } catch (err) {
      console.error('Error loading targets:', err);
      setFestivalMessage('Unable to load event options.');
    }
  };

  // API Call: Refresh Status
  const refreshStatus = async (targetId: number) => {
    if (!targetId) return;
    try {
      const response = await fetch(`/api/organizer/status?target_id=${encodeURIComponent(targetId)}`, {
        credentials: 'include',
      });
      const data: StatusData = await response.json();

      if (!response.ok) {
        setFestivalMessage('Unable to load event status.');
        return;
      }

      setFestivalStatus(data);

      if (data.action_message) {
        setFestivalMessage(data.action_message);
      } else if (data.status === 0) {
        setFestivalMessage('Voting has not started. Generate the required QR codes, then start the event when ready.');
      } else if (data.status === 1) {
        setFestivalMessage('Voting is currently open. Only the admin who started a combined event can end it.');
      } else {
        setFestivalMessage('This event has finished. Winners have been finalized.');
      }
    } catch (err) {
      console.error('Error refreshing status:', err);
    }
  };

  useEffect(() => {
    loadOrganizerTargets();
  }, []);

  useEffect(() => {
    if (selectedTargetId !== '') {
      refreshStatus(Number(selectedTargetId));
    }
  }, [selectedTargetId]);

  // API Call: Start Event
  const handleStartFestival = async () => {
    if (selectedTargetId === '') return;
    const form = new FormData();
    form.append('target_id', selectedTargetId.toString());

    try {
      const response = await fetch('/api/organizer/start', {
        method: 'POST',
        body: form,
        credentials: 'include',
      });
      const data = await response.json();

      if (!response.ok) {
        setFestivalMessage(data.detail || 'Event could not be started.');
        return;
      }

      setFestivalMessage(`${data.major} Event started successfully. Voting is now open for ${data.year}.`);
      await refreshStatus(Number(selectedTargetId));
    } catch (err) {
      setFestivalMessage('Event could not be started.');
    }
  };

  // API Call: Stop Event
  const handleStopFestival = async () => {
    if (!window.confirm('End this event and finalize winners?')) return;
    if (selectedTargetId === '') return;

    const form = new FormData();
    form.append('target_id', selectedTargetId.toString());

    try {
      const response = await fetch('/api/organizer/stop', {
        method: 'POST',
        body: form,
        credentials: 'include',
      });
      const data = await response.json();

      if (!response.ok) {
        setFestivalMessage(data.detail || 'Event could not be ended.');
        return;
      }

      setLocation(`/organizer/results?target_id=${encodeURIComponent(selectedTargetId)}`);
    } catch (err) {
      setFestivalMessage('Event could not be ended.');
    }
  };

  // API Call: Generate QR Codes
  const handleGenerateQR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTargetId === '') return;

    const form = new FormData();
    form.append('students', studentsInput.toString());
    form.append('teachers', teachersInput.toString());
    form.append('target_id', selectedTargetId.toString());

    try {
      const response = await fetch('/api/organizer/generate-qr', {
        method: 'POST',
        body: form,
        credentials: 'include',
      });
      const data = await response.json();

      if (!response.ok) {
        setQrMessage(data.detail || 'QR codes could not be generated.');
        return;
      }

      if (festivalStatus) {
        setFestivalStatus({
          ...festivalStatus,
          qr_counts: data.counts,
        });
      }

      const studentCreated = data.result?.students?.created_count || 0;
      const teacherCreated = data.result?.teachers?.created_count || 0;
      const total = Number(data.counts.students) + Number(data.counts.teachers);

      setQrMessage(`QR generation completed: ${studentCreated} new student and ${teacherCreated} new teacher QR code(s) created. Total QR codes: ${total}.`);
    } catch (err) {
      setQrMessage('QR codes could not be generated.');
    }
  };

  // API Call: Download QR
  const handleDownloadQR = (role: 'student' | 'teacher') => {
    if (selectedTargetId === '') return;
    window.location.href = `/api/organizer/download-qr/${role}?target_id=${encodeURIComponent(selectedTargetId)}`;
  };

  const studentsCount = Number(festivalStatus?.qr_counts?.students || 0);
  const teachersCount = Number(festivalStatus?.qr_counts?.teachers || 0);

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1120px] mx-auto p-5 space-y-5"
      >
        <h1 className="text-2xl font-bold text-[hsl(265_30%_15%)] mb-4">Organizer Dashboard</h1>

        {/* Event Selection & Control Panel */}
        <div className="bg-white border border-[hsl(265_10%_90%)] rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(265_10%_50%)] mb-1.5">Event</label>
            <select
              value={selectedTargetId}
              onChange={(e) => setSelectedTargetId(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-[hsl(265_10%_88%)] bg-white text-sm outline-none"
            >
              {targets.map((target) => (
                <option key={target.target_id} value={target.target_id}>
                  {target.name} {target.type === 'combined' ? ` (${target.major_ids.length} majors combined)` : ''}
                </option>
              ))}
            </select>
          </div>

          <h2 className="font-serif font-bold text-xl text-[hsl(265_30%_15%)]">
            {festivalStatus ? `${festivalStatus.major} Event — ${festivalStatus.year}` : 'Event'}
          </h2>
          <p className="text-xs text-[hsl(265_10%_50%)]">
            {festivalStatus ? `Status: ${statusLabel(festivalStatus.status)}` : 'Loading event status...'}
          </p>
          <p className="bg-[hsl(260_30%_99%)] p-3 rounded-xl text-sm text-[hsl(265_30%_20%)] border border-[hsl(265_10%_92%)]">
            {festivalMessage}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            {festivalStatus?.can_start && (
              <button
                type="button"
                onClick={handleStartFestival}
                className="flex items-center gap-2 px-6 py-3 rounded-xl green-bg text-white font-bold text-sm hover:opacity-90 transition-all"
              >
                <Play className="w-4 h-4" /> Start Event
              </button>
            )}
            {festivalStatus?.can_end && (
              <button
                type="button"
                onClick={handleStopFestival}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-800 text-white font-bold text-sm hover:bg-red-800 transition-all"
              >
                <Square className="w-4 h-4" /> End Event
              </button>
            )}
            {festivalStatus?.status === 2 && (
              <button
                type="button"
                onClick={() => setLocation(`/admin/results?target_id=${encodeURIComponent(selectedTargetId)}`)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[hsl(265_10%_88%)] text-sm font-semibold text-[hsl(265_10%_40%)] hover:bg-[hsl(265_20%_97%)] transition-all"
              >
                View Results
              </button>
            )}
          </div>
        </div>

        {/* QR Codes Section */}
        <div className="bg-white border border-[hsl(265_10%_90%)] rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="font-serif font-bold text-xl text-[hsl(265_30%_15%)] flex items-center gap-2">
            <QrCode className="w-5 h-5" /> QR Codes
          </h2>
          <p className="text-xs text-[hsl(265_10%_50%)]">
            Enter the total number of QR codes required. Existing codes are kept and only missing codes are generated.
          </p>

          <form onSubmit={handleGenerateQR} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(265_10%_50%)] mb-1.5">Students</label>
                <input
                  type="number"
                  min="0"
                  value={studentsInput}
                  onChange={(e) => setStudentsInput(Number(e.target.value))}
                  placeholder="Students"
                  className="w-full px-4 py-3 rounded-xl border border-[hsl(265_10%_88%)] bg-white text-sm outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(265_10%_50%)] mb-1.5">Teachers</label>
                <input
                  type="number"
                  min="0"
                  value={teachersInput}
                  onChange={(e) => setTeachersInput(Number(e.target.value))}
                  placeholder="Teachers"
                  className="w-full px-4 py-3 rounded-xl border border-[hsl(265_10%_88%)] bg-white text-sm outline-none"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl green-bg text-white font-bold text-sm hover:opacity-90 transition-all"
            >
              Generate Needed QR Codes
            </button>
          </form>

          <div className="flex flex-wrap gap-4 pt-2">
            <div className="bg-[hsl(260_30%_99%)] border border-[hsl(265_10%_90%)] rounded-xl p-3 min-w-[150px]">
              <span className="text-xs text-[hsl(265_10%_50%)]">Student QR codes</span>
              <strong className="block text-xl font-bold text-[hsl(265_30%_15%)] mt-1">{studentsCount}</strong>
            </div>
            <div className="bg-[hsl(260_30%_99%)] border border-[hsl(265_10%_90%)] rounded-xl p-3 min-w-[150px]">
              <span className="text-xs text-[hsl(265_10%_50%)]">Teacher QR codes</span>
              <strong className="block text-xl font-bold text-[hsl(265_30%_15%)] mt-1">{teachersCount}</strong>
            </div>
            <div className="bg-[hsl(260_30%_99%)] border border-[hsl(265_10%_90%)] rounded-xl p-3 min-w-[150px]">
              <span className="text-xs text-[hsl(265_10%_50%)]">Total QR codes</span>
              <strong className="block text-xl font-bold text-[hsl(265_30%_15%)] mt-1">{studentsCount + teachersCount}</strong>
            </div>
          </div>

          <p className="bg-[hsl(260_30%_99%)] p-3 rounded-xl text-sm text-[hsl(265_30%_20%)] border border-[hsl(265_10%_92%)]">
            {qrMessage}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              type="button"
              onClick={() => handleDownloadQR('student')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl green-bg text-white font-bold text-sm hover:opacity-90 transition-all"
            >
              <Download className="w-4 h-4" /> Download Students
            </button>
            <button
              type="button"
              onClick={() => handleDownloadQR('teacher')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl green-bg text-white font-bold text-sm hover:opacity-90 transition-all"
            >
              <Download className="w-4 h-4" /> Download Teachers
            </button>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Organizer;