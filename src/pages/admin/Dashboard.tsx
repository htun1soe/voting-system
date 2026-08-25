import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Lock,
  Layers,
  Award,
  Filter,
  X,
  Check,
  User,
  Hash,
  Upload
} from 'lucide-react';
import { motion } from 'framer-motion';
import Layout from '../../layouts/AdminLayout';

// --- ZOD SCHEMAS ---

const candidateFormSchema = z.object({
  c_name: z.string().min(1, 'Candidate name is required'),
  candidate_type: z.enum(['new', 'old']),
  c_number: z.string().optional(),
  c_gender: z.enum(['boy', 'girl']),
  history_scope: z.enum(['major', 'whole']).optional(),
  year: z.string().optional(),
  title_id: z.string().optional(),
  c_photo: z.any().refine((files) => files && files.length > 0, 'Photo is required')
});

const editFormSchema = z.object({
  c_name: z.string().min(1, 'Candidate name is required'),
  c_number: z.string().min(1, 'Candidate number is required'),
  c_gender: z.enum(['boy', 'girl']),
  c_photo: z.any().optional()
});

const wholeEditFormSchema = z.object({
  c_number: z.string().min(1, 'Candidate number is required'),
  c_photo: z.any().optional()
});

type CandidateFormData = z.infer<typeof candidateFormSchema>;
type EditFormData = z.infer<typeof editFormSchema>;
type WholeEditFormData = z.infer<typeof wholeEditFormSchema>;

export default function AdminDashboard() {
  // Mode & State
  const [adminMode, setAdminMode] = useState<'major' | 'whole'>('major');
  
  // Major Mode States
  const [majorStatus, setMajorStatus] = useState<{ status_label?: string; candidate_management_locked?: boolean }>({});
  const [candidates, setCandidates] = useState<any[]>([]);
  const [candidateYears, setCandidateYears] = useState<string[]>([]);
  const [historyScope, setHistoryScope] = useState<'major' | 'whole'>('major');
  const [yearFilter, setYearFilter] = useState<string>('');
  const [editingCandidate, setEditingCandidate] = useState<any | null>(null);

  // Whole Mode States
  const [wholeStatus, setWholeStatus] = useState<{ status_label?: string; candidate_management_locked?: boolean }>({});
  const [wholeCandidates, setWholeCandidates] = useState<any[]>([]);
  const [wholeYear, setWholeYear] = useState<number | null>(null);
  const [wholeError, setWholeError] = useState<{ detail?: string; missing_majors?: string[] } | null>(null);
  const [availableCandidates, setAvailableCandidates] = useState<any[]>([]);
  const [showAvailablePanel, setShowAvailablePanel] = useState(false);
  const [availableError, setAvailableError] = useState<string | null>(null);
  const [editingWholeCandidate, setEditingWholeCandidate] = useState<any | null>(null);

  // --- REACT HOOK FORM INSTANCES ---

  const addForm = useForm<CandidateFormData>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: {
      candidate_type: 'new',
      c_gender: 'boy',
      history_scope: 'major'
    }
  });

  const editForm = useForm<EditFormData>({
    resolver: zodResolver(editFormSchema)
  });

  const wholeEditForm = useForm<WholeEditFormData>({
    resolver: zodResolver(wholeEditFormSchema)
  });

  const candidateType = addForm.watch('candidate_type');
  const candidateGender = addForm.watch('c_gender');

  // --- API FETCH LOGIC ---

  const loadAdminMajorStatus = async () => {
    const res = await fetch('/api/admin/major-status', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    setMajorStatus(data);
  };

  const loadCandidateYears = async (scope = historyScope) => {
    const res = await fetch(`/api/admin/candidate-years?history_scope=${encodeURIComponent(scope)}`, {
      credentials: 'include'
    });
    if (!res.ok) return;
    const data = await res.json();
    setCandidateYears(data.years || []);
  };

  const loadMajorCandidates = async () => {
    const params = new URLSearchParams();
    params.set('history_scope', historyScope);
    if (yearFilter) params.set('year', yearFilter);

    const res = await fetch(`/api/admin/candidates?${params.toString()}`, { credentials: 'include' });
    const data = await res.json();
    if (res.ok) {
      setCandidates(data);
    } else {
      setCandidates([]);
    }
  };

  const loadWholeFestivalStatus = async () => {
    const res = await fetch('/api/admin/whole-status', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    setWholeStatus(data);
  };

  const loadWholeCandidates = async () => {
    setWholeError(null);
    const res = await fetch('/api/admin/whole-candidates', { credentials: 'include' });
    const data = await res.json();

    if (res.status === 409) {
      setWholeError(data);
      setWholeCandidates([]);
      return;
    }
    if (!res.ok) {
      setWholeError({ detail: data.detail || 'Unable to load candidates' });
      setWholeCandidates([]);
      return;
    }

    setWholeCandidates(data.candidates || []);
    setWholeYear(data.year);
  };

  const openAvailableCandidates = async () => {
    if (wholeStatus.candidate_management_locked) {
      alert('Whole candidate management is locked while the Whole festival is running.');
      return;
    }
    setShowAvailablePanel(true);
    setAvailableError(null);

    const res = await fetch('/api/admin/whole-candidates/available', { credentials: 'include' });
    const data = await res.json();

    if (res.status === 409) {
      setAvailableError('All Major selections must be completed first.');
      setAvailableCandidates([]);
      return;
    }
    if (!res.ok) {
      setAvailableError(data.detail || 'Unable to load available candidates');
      setAvailableCandidates([]);
      return;
    }

    setAvailableCandidates(data.available_candidates || []);
  };

  // Switch tabs/modes
  useEffect(() => {
    if (adminMode === 'major') {
      loadAdminMajorStatus();
      loadCandidateYears();
      loadMajorCandidates();
    } else {
      loadWholeFestivalStatus();
      loadWholeCandidates();
    }
  }, [adminMode, historyScope, yearFilter]);

  // --- ACTIONS ---

  const onAddCandidate = async (data: CandidateFormData) => {
    if (majorStatus.candidate_management_locked) {
      alert('Candidate management is locked while this major festival is running.');
      return;
    }

    const formData = new FormData();
    formData.append('c_name', data.c_name);
    formData.append('candidate_type', data.candidate_type);
    formData.append('c_gender', data.c_gender);
    if (data.c_photo && data.c_photo[0]) {
      formData.append('c_photo', data.c_photo[0]);
    }

    if (data.candidate_type === 'old') {
      if (data.history_scope) formData.append('history_scope', data.history_scope);
      if (data.year) formData.append('year', data.year);
      if (data.title_id) formData.append('title_id', data.title_id);
    } else {
      if (data.c_number) formData.append('c_number', data.c_number);
    }

    const res = await fetch('/api/admin/candidates', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    const resData = await res.json();

    if (!res.ok) {
      alert(resData.detail || 'Candidate could not be added');
      return;
    }

    addForm.reset();
    setHistoryScope(data.candidate_type === 'old' ? data.history_scope || 'major' : 'major');
    await loadCandidateYears();
    await loadMajorCandidates();
  };

  const startEdit = (candidate: any) => {
    if (majorStatus.candidate_management_locked) {
      alert('Candidate editing is locked while this major festival is running.');
      return;
    }
    setEditingCandidate(candidate);
    editForm.reset({
      c_name: candidate.c_name,
      c_number: String(candidate.c_number),
      c_gender: candidate.c_gender
    });
  };

  const onUpdateCandidate = async (data: EditFormData) => {
    if (!editingCandidate) return;

    const formData = new FormData();
    formData.append('c_name', data.c_name);
    formData.append('c_number', data.c_number);
    formData.append('c_gender', data.c_gender);
    if (data.c_photo && data.c_photo[0]) {
      formData.append('c_photo', data.c_photo[0]);
    }

    const res = await fetch(`/api/admin/candidates/${editingCandidate.c_id}`, {
      method: 'PUT',
      body: formData,
      credentials: 'include'
    });
    const resData = await res.json();

    if (!res.ok) {
      alert(resData.detail || 'Update failed');
      return;
    }

    setEditingCandidate(null);
    loadMajorCandidates();
  };

  const deleteCandidate = async (candidateId: number) => {
    if (majorStatus.candidate_management_locked) {
      alert('Candidate deleting is locked while this major festival is running.');
      return;
    }
    if (!confirm('Delete this candidate and related selection history?')) return;

    const res = await fetch(`/api/admin/candidates/${candidateId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.detail || 'Delete failed');
      return;
    }

    loadCandidateYears();
    loadMajorCandidates();
  };

  const addWholeCandidate = async (candidateId: number) => {
    const res = await fetch(`/api/admin/whole-candidates/${candidateId}`, {
      method: 'POST',
      credentials: 'include'
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.detail || 'Unable to add candidate');
      return;
    }

    await loadWholeCandidates();
    await openAvailableCandidates();
  };

  const removeWholeCandidate = async (candidateId: number) => {
    if (wholeStatus.candidate_management_locked) {
      alert('Whole candidate removing is locked while the Whole festival is running.');
      return;
    }
    if (!confirm('Remove this candidate from the Whole-stage list?')) return;

    const res = await fetch(`/api/admin/whole-candidates/${candidateId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.detail || 'Unable to remove candidate');
      return;
    }

    await loadWholeCandidates();
    if (showAvailablePanel) openAvailableCandidates();
  };

  const startWholeEdit = (candidate: any) => {
    if (wholeStatus.candidate_management_locked) {
      alert('Whole candidate editing is locked while the Whole festival is running.');
      return;
    }
    setEditingWholeCandidate(candidate);
    wholeEditForm.reset({
      c_number: String(candidate.c_number)
    });
  };

  const onUpdateWholeCandidate = async (data: WholeEditFormData) => {
    if (!editingWholeCandidate) return;

    const formData = new FormData();
    formData.append('c_number', data.c_number);
    if (data.c_photo && data.c_photo[0]) {
      formData.append('c_photo', data.c_photo[0]);
    }

    const res = await fetch(`/api/admin/whole-candidates/${editingWholeCandidate.c_id}`, {
      method: 'PUT',
      body: formData,
      credentials: 'include'
    });
    const resData = await res.json();

    if (!res.ok) {
      alert(resData.detail || 'Whole candidate update failed');
      return;
    }

    setEditingWholeCandidate(null);
    loadWholeCandidates();
  };

  // Old Candidate Title options dependent on selected gender
  const oldTitleOptions = candidateGender === 'boy' 
    ? [{ id: 1, name: 'King' }, { id: 3, name: 'Smart' }, { id: 5, name: 'Mr.Popular' }]
    : [{ id: 2, name: 'Queen' }, { id: 4, name: 'Style' }, { id: 6, name: 'Ms.Popular' }];

  return (
    <Layout>
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-[hsl(265_10%_90%)] shadow-xl overflow-hidden max-w-xl mx-auto p-6"
    >
      {/* Header */}
      <div className="p-4 border-b border-[hsl(265_10%_92%)] bg-[hsl(265_85%_98%)] rounded-xl flex justify-center ">
        {/* View Selection Toggle */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-[hsl(265_10%_88%)]">
          <button
            type="button"
            onClick={() => setAdminMode('major')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              adminMode === 'major'
                ? 'green-bg text-white shadow'
                : 'text-[hsl(265_10%_40%)] hover:bg-[hsl(265_20%_97%)]'
            }`}
          >
            Major Mode
          </button>
          <button
            type="button"
            onClick={() => setAdminMode('whole')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              adminMode === 'whole'
                ? 'green-bg text-white shadow'
                : 'text-[hsl(265_10%_40%)] hover:bg-[hsl(265_20%_97%)]'
            }`}
          >
            Whole Mode
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* MAJOR MODE */}
        {adminMode === 'major' && (
          <>
            {/* Status Banner */}
            <div className="p-4 rounded-xl border border-[hsl(265_10%_90%)] bg-[hsl(260_30%_99%)] flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-[hsl(265_30%_20%)]">Major Festival Status: </span>
                <span className="px-3 py-1 rounded-full bg-[oklch(95%_0.02_180)] text-[oklch(45%_0.07_180)] text-xs font-bold inline-block ml-2">
                  {majorStatus.status_label || 'Unknown'}
                </span>
                {majorStatus.candidate_management_locked && (
                  <p className="text-xs text-[hsl(265_10%_50%)] mt-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-500" /> Candidate management is locked while voting is active.
                  </p>
                )}
              </div>
            </div>

            {/* Add Candidate Form */}
            <div className="p-6 rounded-2xl border border-[hsl(265_10%_90%)] bg-white space-y-4">
              <h3 className="font-serif font-bold text-xl text-[hsl(265_30%_15%)]">Add Candidate</h3>
              <form onSubmit={addForm.handleSubmit(onAddCandidate)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(265_10%_50%)] mb-1.5">Candidate Name</label>
                    <input
                      {...addForm.register('c_name')}
                      disabled={majorStatus.candidate_management_locked}
                      className="w-full px-3 py-2 rounded-lg border border-[hsl(265_10%_88%)] text-sm outline-none focus:ring-2 focus:ring-[hsl(265_85%_60%)]/30 disabled:opacity-50"
                      placeholder="Full Name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(265_10%_50%)] mb-1.5">Type</label>
                    <select
                      {...addForm.register('candidate_type')}
                      disabled={majorStatus.candidate_management_locked}
                      className="w-full px-3 py-2 rounded-lg border border-[hsl(265_10%_88%)] text-sm bg-white outline-none focus:ring-2 focus:ring-[hsl(265_85%_60%)]/30 disabled:opacity-50"
                    >
                      <option value="new">New Candidate</option>
                      <option value="old">Old Candidate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(265_10%_50%)] mb-1.5">Group</label>
                    <select
                      {...addForm.register('c_gender')}
                      disabled={majorStatus.candidate_management_locked}
                      className="w-full px-3 py-2 rounded-lg border border-[hsl(265_10%_88%)] text-sm bg-white outline-none focus:ring-2 focus:ring-[hsl(265_85%_60%)]/30 disabled:opacity-50"
                    >
                      <option value="boy">Boy</option>
                      <option value="girl">Girl</option>
                    </select>
                  </div>
                </div>

                {/* Conditional Fields for Candidate Type */}
                {candidateType === 'new' ? (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(265_10%_50%)] mb-1.5">Candidate Number</label>
                    <input
                      type="number"
                      {...addForm.register('c_number')}
                      disabled={majorStatus.candidate_management_locked}
                      className="w-full md:w-1/3 px-3 py-2 rounded-lg border border-[hsl(265_10%_88%)] text-sm outline-none focus:ring-2 focus:ring-[hsl(265_85%_60%)]/30 disabled:opacity-50"
                      placeholder="e.g. 101"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(265_10%_50%)] mb-1.5">Historical Scope</label>
                      <select
                        {...addForm.register('history_scope')}
                        disabled={majorStatus.candidate_management_locked}
                        className="w-full px-3 py-2 rounded-lg border border-[hsl(265_10%_88%)] text-sm bg-white outline-none disabled:opacity-50"
                      >
                        <option value="major">Major</option>
                        <option value="whole">Whole</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(265_10%_50%)] mb-1.5">Previous Year</label>
                      <input
                        type="number"
                        {...addForm.register('year')}
                        disabled={majorStatus.candidate_management_locked}
                        placeholder="e.g. 2025"
                        className="w-full px-3 py-2 rounded-lg border border-[hsl(265_10%_88%)] text-sm outline-none disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(265_10%_50%)] mb-1.5">Awarded Title</label>
                      <select
                        {...addForm.register('title_id')}
                        disabled={majorStatus.candidate_management_locked}
                        className="w-full px-3 py-2 rounded-lg border border-[hsl(265_10%_88%)] text-sm bg-white outline-none disabled:opacity-50"
                      >
                        {oldTitleOptions.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(265_10%_50%)] mb-1.5">Candidate Photo</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    {...addForm.register('c_photo')}
                    disabled={majorStatus.candidate_management_locked}
                    className="w-full px-3 py-2 rounded-lg border border-[hsl(265_10%_88%)] text-sm outline-none disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={majorStatus.candidate_management_locked}
                  className="px-6 py-2.5 rounded-xl green-bg text-white font-bold hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" /> Add Candidate
                </button>
              </form>
            </div>

            {/* Inline Major Edit Modal/Panel */}
            {editingCandidate && (
              <div className="p-6 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-4">
                <h3 className="font-serif font-bold text-lg text-amber-900">Edit Candidate: {editingCandidate.c_name}</h3>
                <form onSubmit={editForm.handleSubmit(onUpdateCandidate)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(265_10%_50%)] mb-1.5">Name</label>
                      <input
                        {...editForm.register('c_name')}
                        className="w-full px-3 py-2 rounded-lg border border-[hsl(265_10%_88%)] text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(265_10%_50%)] mb-1.5">Number</label>
                      <input
                        type="number"
                        {...editForm.register('c_number')}
                        className="w-full px-3 py-2 rounded-lg border border-[hsl(265_10%_88%)] text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(265_10%_50%)] mb-1.5">Group</label>
                      <select
                        {...editForm.register('c_gender')}
                        className="w-full px-3 py-2 rounded-lg border border-[hsl(265_10%_88%)] text-sm bg-white"
                      >
                        <option value="boy">Boy</option>
                        <option value="girl">Girl</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(265_10%_50%)] mb-1.5">Replace Photo (Optional)</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      {...editForm.register('c_photo')}
                      className="w-full px-3 py-2 rounded-lg border border-[hsl(265_10%_88%)] text-sm bg-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-5 py-2 rounded-lg green-bg text-white font-semibold text-sm">Save Changes</button>
                    <button type="button" onClick={() => setEditingCandidate(null)} className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold text-sm">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {/* List & Filters */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h3 className="font-serif font-bold text-xl text-[hsl(265_30%_15%)]">Candidates In Your Major</h3>
                <button onClick={loadMajorCandidates} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center gap-2 text-sm">
                  <RefreshCw className="w-4 h-4" /> Refresh
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Candidate Scope</label>
                  <select
                    value={historyScope}
                    onChange={(e) => setHistoryScope(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
                  >
                    <option value="major">Major Candidates</option>
                    <option value="whole">Whole Historical Candidates</option>
                  </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Filter by Year</label>
                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
                  >
                    <option value="">All Years</option>
                    {candidateYears.map((yr) => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto rounded-xl border border-[hsl(265_10%_90%)]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[hsl(265_85%_98%)] text-[hsl(265_30%_20%)] font-semibold">
                    <tr>
                      <th className="p-3">Photo</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Number</th>
                      <th className="p-3">Year</th>
                      <th className="p-3">Selection</th>
                      <th className="p-3">Awarded Title</th>
                      <th className="p-3">Group</th>
                      <th className="p-3">Major</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[hsl(265_10%_92%)]">
                    {candidates.length === 0 ? (
                      <tr><td colSpan={9} className="p-4 text-center text-gray-400">No candidates found.</td></tr>
                    ) : (
                      candidates.map((c) => (
                        <tr key={c.c_id} className="hover:bg-slate-50/50">
                          <td className="p-3">
                            {c.c_photo ? (
                              <img src={c.c_photo} alt={c.c_name} className="w-10 h-10 object-cover rounded-lg" />
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="p-3 font-semibold">{c.c_name}</td>
                          <td className="p-3">{c.c_number}</td>
                          <td className="p-3">{c.year}</td>
                          <td className="p-3">{c.history_scope === 'whole' ? 'Whole' : 'Major'}</td>
                          <td className="p-3">{c.title || '—'}</td>
                          <td className="p-3 capitalize">{c.c_gender}</td>
                          <td className="p-3">{c.major || '—'}</td>
                          <td className="p-3">
                            {c.history_scope === 'whole' ? (
                              <span className="text-xs text-gray-400">View only</span>
                            ) : majorStatus.candidate_management_locked ? (
                              <span className="text-xs text-gray-400">Locked</span>
                            ) : (
                              <div className="flex gap-2">
                                <button onClick={() => startEdit(c)} className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => deleteCandidate(c.c_id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* WHOLE MODE */}
        {adminMode === 'whole' && (
          <>
            {/* Status Banner */}
            <div className="p-4 rounded-xl border border-[hsl(265_10%_90%)] bg-[hsl(260_30%_99%)] flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-[hsl(265_30%_20%)]">Whole Festival Status: </span>
                <span className="px-3 py-1 rounded-full bg-[oklch(95%_0.02_180)] text-[oklch(45%_0.07_180)] text-xs font-bold inline-block ml-2">
                  {wholeStatus.status_label || 'Unknown'}
                </span>
                {wholeStatus.candidate_management_locked && (
                  <p className="text-xs text-[hsl(265_10%_50%)] mt-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-500" /> Whole-stage candidate management is locked while voting is active.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-xl text-[hsl(265_30%_15%)]">Whole Selection Candidates</h3>
                {wholeYear && <p className="text-xs text-gray-500">Current Year: {wholeYear}</p>}
              </div>
              <button
                onClick={openAvailableCandidates}
                disabled={wholeStatus.candidate_management_locked}
                className="px-4 py-2 rounded-xl green-bg text-white text-sm font-semibold hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" /> Add Candidate
              </button>
            </div>

            {/* Error Message for missing majors */}
            {wholeError && (
              <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
                <strong>{wholeError.detail || 'All Major selections must be completed first.'}</strong>
                {wholeError.missing_majors && (
                  <p className="mt-1 text-xs text-red-600">Missing majors: {wholeError.missing_majors.join(', ')}</p>
                )}
              </div>
            )}

            {/* Whole Candidates Table */}
            <div className="overflow-x-auto rounded-xl border border-[hsl(265_10%_90%)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[hsl(265_85%_98%)] text-[hsl(265_30%_20%)] font-semibold">
                  <tr>
                    <th className="p-3">Photo</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Whole Number</th>
                    <th className="p-3">Major</th>
                    <th className="p-3">Major Awarded Titles</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(265_10%_92%)]">
                  {wholeCandidates.length === 0 ? (
                    <tr><td colSpan={6} className="p-4 text-center text-gray-400">No Whole-stage candidates selected.</td></tr>
                  ) : (
                    wholeCandidates.map((c) => (
                      <tr key={c.c_id} className="hover:bg-slate-50/50">
                        <td className="p-3">
                          {c.c_photo ? (
                            <img src={c.c_photo} alt={c.c_name} className="w-10 h-10 object-cover rounded-lg" />
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="p-3 font-semibold">{c.c_name}</td>
                        <td className="p-3">{c.c_number}</td>
                        <td className="p-3">{c.major || '—'}</td>
                        <td className="p-3">{c.titles?.join(', ')}</td>
                        <td className="p-3">
                          {wholeStatus.candidate_management_locked ? (
                            <span className="text-xs text-gray-400">Locked</span>
                          ) : (
                            <div className="flex gap-2">
                              <button onClick={() => startWholeEdit(c)} className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => removeWholeCandidate(c.c_id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Whole Candidate Edit Form */}
            {editingWholeCandidate && (
              <div className="p-6 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-4">
                <h3 className="font-serif font-bold text-lg text-amber-900">
                  Edit Whole Candidate: {editingWholeCandidate.c_name} ({editingWholeCandidate.major})
                </h3>
                <form onSubmit={wholeEditForm.handleSubmit(onUpdateWholeCandidate)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(265_10%_50%)] mb-1.5">Whole-stage Candidate Number</label>
                    <input
                      type="number"
                      {...wholeEditForm.register('c_number')}
                      className="w-full md:w-1/3 px-3 py-2 rounded-lg border border-[hsl(265_10%_88%)] text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(265_10%_50%)] mb-1.5">Replace Photo (Optional)</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      {...wholeEditForm.register('c_photo')}
                      className="w-full px-3 py-2 rounded-lg border border-[hsl(265_10%_88%)] text-sm bg-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-semibold text-sm">Save Changes</button>
                    <button type="button" onClick={() => setEditingWholeCandidate(null)} className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold text-sm">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {/* Available Major Winners Side-Panel / Section */}
            {showAvailablePanel && (
              <div className="p-6 rounded-2xl border border-[hsl(265_10%_88%)] bg-slate-50 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-lg text-slate-800">Available Major Winners</h3>
                  <button onClick={() => setShowAvailablePanel(false)} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {availableError ? (
                  <p className="text-sm text-red-600">{availableError}</p>
                ) : availableCandidates.length === 0 ? (
                  <p className="text-sm text-gray-500">No additional Major-selection winners are available.</p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-[hsl(265_10%_90%)] bg-white">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-700">
                        <tr>
                          <th className="p-3">Photo</th>
                          <th className="p-3">Name</th>
                          <th className="p-3">Number</th>
                          <th className="p-3">Major</th>
                          <th className="p-3">Titles</th>
                          <th className="p-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {availableCandidates.map((ac) => (
                          <tr key={ac.c_id}>
                            <td className="p-3">
                              {ac.c_photo ? <img src={ac.c_photo} className="w-8 h-8 object-cover rounded-md" /> : '—'}
                            </td>
                            <td className="p-3 font-medium">{ac.c_name}</td>
                            <td className="p-3">{ac.c_number}</td>
                            <td className="p-3">{ac.major || '—'}</td>
                            <td className="p-3">{ac.titles?.join(', ')}</td>
                            <td className="p-3">
                              <button
                                onClick={() => addWholeCandidate(ac.c_id)}
                                className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                              >
                                Add
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
    </Layout>
  );
}
