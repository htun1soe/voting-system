import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Trash2,
  RefreshCw,
  Lock,
  Check,
  User,
  Edit2,
  Upload,
  Layers,
  Award,
  MoreVertical,
  X,
} from 'lucide-react';
import Layout from '@/layouts/AdminLayout';
import { motion } from 'framer-motion';

// --- ZOD SCHEMAS ---

const candidateFormSchema = z.object({
  c_name: z.string().min(1, 'Candidate name is required'),
  c_number: z.string().min(1, 'Candidate number is required'),
  c_gender: z.enum(['boy', 'girl']),
  c_photo: z.any().refine((files) => files && files.length > 0, 'Photo is required')
});

const editFormSchema = z.object({
  c_name: z.string().min(1, 'Candidate name is required'),
  c_number: z.string().min(1, 'Candidate number is required'),
  c_gender: z.enum(['boy', 'girl']).optional(),
  c_photo: z.any().optional()
});

const wholeEditFormSchema = z.object({
  c_w_number: z.string().min(1, 'Candidate number is required')
});

const titleFormSchema = z.object({
  title: z.string().min(1, 'Title name is required'),
  group: z.enum(['boy', 'girl'])
});

type CandidateFormData = z.infer<typeof candidateFormSchema>;
type EditFormData = z.infer<typeof editFormSchema>;
type WholeEditFormData = z.infer<typeof wholeEditFormSchema>;
type TitleFormData = z.infer<typeof titleFormSchema>;

export default function AdminDashboard() {
  // Session & Identity States
  const [me, setMe] = useState<any>(null);
  const [candidateManagementLocked, setCandidateManagementLocked] = useState(false);
  const [candidateStatusMsg, setCandidateStatusMsg] = useState('Loading candidate management status...');
  
  // Data Lists & Editing States
  const [candidates, setCandidates] = useState<any[]>([]);
  const [editingCandidateId, setEditingCandidateId] = useState<number | null>(null);
  
  const [combinedFestivals, setCombinedFestivals] = useState<any[]>([]);
  const [combineRequests, setCombineRequests] = useState<any[]>([]);
  const [combinedCandidates, setCombinedCandidates] = useState<any[]>([]);
  const [isCombineEditorOpen, setIsCombineEditorOpen] = useState(false);
  const [editingCombinedId, setEditingCombinedId] = useState<number | null>(null);
  const [availableMajors, setAvailableMajors] = useState<any[]>([]);
  const [selectedMajorIds, setSelectedMajorIds] = useState<number[]>([]);
  const [combinedName, setCombinedName] = useState('');

  const [titles, setTitles] = useState<any[]>([]);
  const [titlesLocked, setTitlesLocked] = useState(false);
  const [titleStatusMsg, setTitleStatusMsg] = useState('');

  const [wholeCandidates, setWholeCandidates] = useState<any[]>([]);
  const [wholeReady, setWholeReady] = useState(true);
  const [wholeMissingMajors, setWholeMissingMajors] = useState<string[]>([]);
  const [availableWholeCandidates, setAvailableWholeCandidates] = useState<any[]>([]);

  // React Hook Forms
  const candidateForm = useForm<CandidateFormData>({ resolver: zodResolver(candidateFormSchema) });
  const editCandidateForm = useForm<EditFormData>({ resolver: zodResolver(editFormSchema) });
  const titleForm = useForm<TitleFormData>({ resolver: zodResolver(titleFormSchema) });

  // --- INITIALIZATION & SESSION RESTORE ---
  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const res = await fetch('/api/admin/me', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      applyAdminSession(data);
    } catch (err) {
      console.error(err);
    }
  };

  const applyAdminSession = (data: any) => {
    setMe(data);
    if (data.admin_role === 'major_admin') {
      loadCandidateManagementStatus().then(loadCandidates);
      loadCombinedFestivals();
      loadCombinedCandidates();
      loadTitles();
    } else if (data.admin_role === 'whole_admin') {
      loadWhole();
      loadAvailableWhole();
    }
  };

  // --- MAJOR ADMIN API CALLS ---

  const loadCandidateManagementStatus = async () => {
    const res = await fetch('/api/admin/candidate-management-status', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    setCandidateManagementLocked(Boolean(data.locked));
    setCandidateStatusMsg(data.message);
  };

  const loadCandidates = async () => {
    const res = await fetch('/api/admin/candidates', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    setCandidates(data);
  };

  const handleAddCandidate = async (formData: CandidateFormData) => {
    if (candidateManagementLocked) {
      alert('Candidate management is locked.');
      return;
    }
    const form = new FormData();
    form.append('c_name', formData.c_name);
    form.append('c_number', formData.c_number);
    form.append('c_gender', formData.c_gender);
    if (formData.c_photo?.[0]) {
      form.append('c_photo', formData.c_photo[0]);
    }

    const res = await fetch('/api/admin/candidates', {
      method: 'POST',
      body: form,
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.detail);
      return;
    }
    candidateForm.reset();
    loadCandidates();
  };

  const startCandidateEdit = (id: number) => {
    if (candidateManagementLocked) {
      alert('Candidate management is locked.');
      return;
    }
    const candidate = candidates.find(item => item.c_id === id);
    if (!candidate) return;

    setEditingCandidateId(id);
    editCandidateForm.setValue('c_name', candidate.c_name);
    editCandidateForm.setValue('c_number', String(candidate.c_number));
  };

  const cancelCandidateEdit = () => {
    setEditingCandidateId(null);
    editCandidateForm.reset();
  };

  const handleUpdateCandidate = async (formData: EditFormData) => {
    if (editingCandidateId === null || candidateManagementLocked) return;

    const form = new FormData();
    form.append('c_name', formData.c_name);
    form.append('c_number', formData.c_number);
    if (formData.c_photo?.[0]) {
      form.append('c_photo', formData.c_photo[0]);
    }

    const res = await fetch(`/api/admin/candidates/${editingCandidateId}`, {
      method: 'PUT',
      body: form,
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.detail);
      return;
    }

    cancelCandidateEdit();
    await loadCandidateManagementStatus();
    await loadCandidates();
  };

  const deleteCandidate = async (id: number) => {
    if (candidateManagementLocked) {
      alert('Candidate management is locked.');
      return;
    }
    if (!confirm('Delete this candidate?')) return;

    const res = await fetch(`/api/admin/candidates/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) alert(data.detail);

    await loadCandidateManagementStatus();
    await loadCandidates();
  };

  // --- COMBINE FESTIVALS LOGIC ---

  const loadCombinedFestivals = async () => {
    const res = await fetch('/api/admin/combine', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    setCombinedFestivals(data.combined_festivals || []);
    setCombineRequests(data.requests || []);
  };

  const loadCombinedCandidates = async () => {
    const res = await fetch('/api/admin/combined-candidates', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    if (data.combined) {
      setCombinedCandidates(data.candidates || []);
    } else {
      setCombinedCandidates([]);
    }
  };

  const openCombineForm = async (combinedId: number | null = null) => {
    const res = await fetch('/api/admin/combine/available-majors', { credentials: 'include' });
    const data = await res.json();
    if (!res.ok) {
      alert(data.detail);
      return;
    }

    setEditingCombinedId(combinedId);
    setAvailableMajors(data.available_majors || []);

    const current = combinedFestivals.find(item => item.combined_id === combinedId);
    setCombinedName(current ? current.combined_name : '');
    setSelectedMajorIds(current ? current.major_ids : []);
    setIsCombineEditorOpen(true);
  };

  const handleSaveCombine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMajorIds.length) {
      alert('Select at least one other major.');
      return;
    }

    const form = new FormData();
    form.append('combined_name', combinedName);
    selectedMajorIds.forEach(id => form.append('major_ids', String(id)));

    const isEditing = editingCombinedId !== null;
    const url = isEditing ? `/api/admin/combine/${editingCombinedId}` : '/api/admin/combine';

    const res = await fetch(url, {
      method: isEditing ? 'PUT' : 'POST',
      body: form,
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.detail);
      return;
    }

    setIsCombineEditorOpen(false);
    await loadCombinedFestivals();
    await loadCandidateManagementStatus();
  };

  const respondCombine = async (requestId: number, responseType: string) => {
    const form = new FormData();
    form.append('response', responseType);
    const res = await fetch(`/api/admin/combine/requests/${requestId}/response`, {
      method: 'PUT',
      body: form,
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.detail);
      return;
    }
    await loadCombinedFestivals();
    await loadCombinedCandidates();
    await loadCandidateManagementStatus();
    await loadCandidates();
  };

  const rejectCombine = async (requestId: number) => {
    const reason = prompt('Reason for rejection:') || 'Combination request rejected.';
    const form = new FormData();
    form.append('response', 'rejected');
    form.append('message', reason);
    const res = await fetch(`/api/admin/combine/requests/${requestId}/response`, {
      method: 'PUT',
      body: form,
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.detail);
      return;
    }
    await loadCombinedFestivals();
  };

  // --- TITLES LOGIC ---

  const loadTitles = async () => {
    const res = await fetch('/api/admin/titles', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    setTitlesLocked(Boolean(data.locked));
    setTitleStatusMsg(data.locked ? 'Titles are locked because a event has already started or completed.' : 'Titles can be managed before festivals begin.');
    setTitles(data.titles || []);
  };

  const handleAddTitle = async (formData: TitleFormData) => {
    const form = new FormData();
    form.append('title', formData.title);
    form.append('group', formData.group);

    const res = await fetch('/api/admin/titles', {
      method: 'POST',
      body: form,
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.detail);
      return;
    }
    titleForm.reset();
    await loadTitles();
  };

  const deleteTitle = async (titleId: number) => {
    if (!confirm('Delete this title?')) return;
    const res = await fetch(`/api/admin/titles/${titleId}`, { method: 'DELETE', credentials: 'include' });
    const data = await res.json();
    if (!res.ok) {
      alert(data.detail);
      return;
    }
    await loadTitles();
  };

  // --- WHOLE ADMIN LOGIC ---

  const loadWhole = async () => {
    const res = await fetch('/api/admin/whole-candidates', { credentials: 'include' });
    const data = await res.json();
    if (!res.ok) {
      alert(data.detail);
      return;
    }
    if (!data.ready) {
      setWholeReady(false);
      setWholeMissingMajors(data.missing_majors || []);
      return;
    }
    setWholeReady(true);
    setWholeCandidates(data.candidates || []);
  };

  const loadAvailableWhole = async () => {
    const res = await fetch('/api/admin/whole-candidates/available', { credentials: 'include' });
    const data = await res.json();
    if (!res.ok || !data.ready) return;
    setAvailableWholeCandidates(data.available_candidates || []);
  };

  const addWhole = async (id: number) => {
    const res = await fetch(`/api/admin/whole-candidates/${id}`, { method: 'POST', credentials: 'include' });
    const data = await res.json();
    if (!res.ok) alert(data.detail);
    await loadWhole();
    await loadAvailableWhole();
  };

  const removeWhole = async (id: number) => {
    const res = await fetch(`/api/admin/whole-candidates/${id}`, { method: 'DELETE', credentials: 'include' });
    const data = await res.json();
    if (!res.ok) alert(data.detail);
    await loadWhole();
    await loadAvailableWhole();
  };

  const updateWholeNumber = async (id: number, newNumber: number) => {
    const form = new FormData();
    form.append('c_w_number', String(newNumber));
    const res = await fetch(`/api/admin/whole-candidates/${id}`, {
      method: 'PUT',
      body: form,
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.detail);
      return;
    }
    await loadWhole();
  };

  // --- RENDER VIEWS ---

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen px-3 py-4 sm:px-5 sm:py-6"
      >
        <div className="mx-auto max-w-[1180px]">

          {/* =========================================================
              HEADER
          ========================================================= */}
          <div className="mb-5 sm:mb-6">
            <div className="flex items-start justify-between gap-3">
              <div>

                <h1 className="text-[26px] font-bold tracking-[-0.5px] text-[#182521] sm:text-[30px]">
                  Admin Dashboard
                </h1>

                {me && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-sm text-[#6d7b76]">
                      Welcome, {me.admin_name}
                    </span>

                    <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold text-[#238d77] shadow-sm ring-1 ring-black/[0.03]">
                      {me.admin_role === 'major_admin'
                        ? `Major: ${me.major || 'Unknown'}`
                        : 'The Whole Welcome Admin'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* =========================================================
              MAJOR ADMIN UI
          ========================================================= */}
          {me && me.admin_role === 'major_admin' && (
            <div className="space-y-5">

              {/* =====================================================
                  COMBINE MAJORS
              ===================================================== */}
              <section className="rounded-[24px] bg-white p-4 shadow-[0_10px_35px_rgba(31,42,68,.07)] sm:p-5">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e6f8f1]">
                        <Layers size={18} className="text-[#1e9c83]" />
                      </div>

                      <div>
                        <h2 className="text-[18px] font-bold text-[#182521]">
                          Combine Majors
                        </h2>

                        <p className="text-[12px] text-[#7a8783]">
                          Create a shared event.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openCombineForm()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl green-bg px-4 py-3 text-sm font-bold text-white shadow-[0_6px_16px_rgba(32,170,145,.22)] transition hover:bg-[#18977f] active:scale-[.98] sm:w-auto"
                  >
                    <Plus size={17} />
                    Combine
                  </button>
                </div>

                {/* Requests */}
                {combineRequests.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {combineRequests.map(request => {
                      const pendingForMe =
                        request.status === 'pending' &&
                        !request.is_requester &&
                        request.my_response === 'pending';

                      return (
                        <div
                          key={request.request_id}
                          className="rounded-[18px] border border-[#e8eeeb] bg-[#f9fcfa] p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-[#26332f]">
                                {request.request_type === 'edit'
                                  ? 'Edit request'
                                  : 'Combine request'}
                              </p>

                              <p className="mt-1 break-words text-sm text-[#687771]">
                                {request.combined_name}
                              </p>

                              <p className="mt-1 text-xs text-[#8a9692]">
                                {request.majors.join(' + ')}
                              </p>
                            </div>

                            <span className="shrink-0 rounded-full bg-[#e9f7f2] px-2.5 py-1 text-[10px] font-bold capitalize text-[#208d77]">
                              {request.status}
                            </span>
                          </div>

                          {request.status === 'rejected' && (
                            <p className="mt-3 rounded-xl bg-white p-3 text-xs leading-relaxed text-[#737f7b]">
                              Rejected:{' '}
                              {request.rejection_message ||
                                'No reason provided.'}
                            </p>
                          )}

                          {pendingForMe && (
                            <div className="mt-3 flex gap-2">
                              <button
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#168667] px-3 py-2.5 text-xs font-bold text-white transition active:scale-[.98]"
                                onClick={() =>
                                  respondCombine(
                                    request.request_id,
                                    'accepted'
                                  )
                                }
                              >
                                <Check size={15} />
                                Accept
                              </button>

                              <button
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#c7443a] px-3 py-2.5 text-xs font-bold text-white transition active:scale-[.98]"
                                onClick={() =>
                                  rejectCombine(request.request_id)
                                }
                              >
                                <X size={15} />
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Combined events */}
                <div className="mt-4">
                  {!combinedFestivals.length ? (
                    <div className="rounded-[18px] border border-dashed border-[#dce8e3] bg-[#fbfdfc] px-4 py-5 text-center">
                      <Layers
                        size={22}
                        className="mx-auto mb-2 text-[#a4b2ad]"
                      />

                      <p className="text-xs text-[#87938f]">
                        No accepted combined event yet.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {combinedFestivals.map(item => (
                        <div
                          key={item.combined_id}
                          className="rounded-[18px] border border-[#e8eeeb] bg-[#fbfdfc] p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-[#26332f]">
                                {item.combined_name}
                              </p>

                              <p className="mt-1 text-xs text-[#7a8783]">
                                {item.majors.join(' + ')}
                              </p>
                            </div>

                            <span className="shrink-0 rounded-full bg-[#e9f7f2] px-2.5 py-1 text-[10px] font-bold text-[#208d77]">
                              {item.status === 1
                                ? 'Running'
                                : item.status === 2
                                ? 'Completed'
                                : 'Not started'}
                            </span>
                          </div>

                          {item.editable && (
                            <button
                              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#dce8e3] bg-white px-3 py-2.5 text-xs font-bold text-[#278f7a] transition hover:bg-[#f4fbf8]"
                              onClick={() =>
                                openCombineForm(item.combined_id)
                              }
                            >
                              <Edit2 size={14} />
                              Edit Combine
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>


              {/* =====================================================
                  COMBINE EDITOR
              ===================================================== */}
              {isCombineEditorOpen && (
                <section className="rounded-[24px] border border-[#dcece6] bg-white p-4 shadow-[0_10px_35px_rgba(31,42,68,.07)] sm:p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[1px] text-[#24a58c]">
                        Event Setup
                      </p>

                      <h2 className="mt-1 text-xl font-bold text-[#182521]">
                        {editingCombinedId !== null
                          ? 'Edit Combined Event'
                          : 'Create Combined Event'}
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsCombineEditorOpen(false)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3f6f4] text-[#6e7b77]"
                    >
                      <X size={17} />
                    </button>
                  </div>

                  <form
                    onSubmit={handleSaveCombine}
                    className="space-y-4"
                  >
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-[#56645f]">
                        Combined event name
                      </label>

                      <input
                        value={combinedName}
                        onChange={e => setCombinedName(e.target.value)}
                        placeholder="e.g. Major Welcome 2026"
                        required
                        className="w-full rounded-xl border border-[#dce5e1] bg-[#fbfdfc] px-4 py-3 text-sm outline-none transition placeholder:text-[#aab5b1] focus:border-[#2aae94] focus:bg-white focus:ring-4 focus:ring-[#20aa91]/10"
                      />
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-bold text-[#56645f]">
                        Select other majors
                      </p>

                      <p className="mb-3 rounded-xl bg-[#f3faf7] px-3 py-2.5 text-xs text-[#668078]">
                        Your major is included automatically.
                      </p>

                      <div className="grid gap-2 sm:grid-cols-2">
                        {availableMajors.map(major => (
                          <label
                            key={major.major_id}
                            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                              selectedMajorIds.includes(major.major_id)
                                ? 'border-[#7bd3bf] bg-[#eefaf6]'
                                : 'border-[#e5ece9] bg-white hover:bg-[#fafcfb]'
                            }`}
                          >
                            <input
                              type="checkbox"
                              value={major.major_id}
                              checked={selectedMajorIds.includes(
                                major.major_id
                              )}
                              onChange={e => {
                                if (e.target.checked) {
                                  setSelectedMajorIds([
                                    ...selectedMajorIds,
                                    major.major_id
                                  ]);
                                } else {
                                  setSelectedMajorIds(
                                    selectedMajorIds.filter(
                                      id => id !== major.major_id
                                    )
                                  );
                                }
                              }}
                              className="h-4 w-4 accent-[#20aa91]"
                            />

                            <span className="text-sm font-semibold text-[#34413d]">
                              {major.major}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        type="submit"
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl green-bg px-4 py-3 text-sm font-bold text-white transition active:scale-[.98]"
                      >
                        <Check size={16} />
                        {editingCombinedId !== null
                          ? 'Save Combine'
                          : 'Combine'}
                      </button>

                      <button
                        type="button"
                        className="rounded-xl bg-[#f0f3f1] px-5 py-3 text-sm font-bold text-[#66736e] transition hover:bg-[#e8edeb]"
                        onClick={() => setIsCombineEditorOpen(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </section>
              )}


              {/* =====================================================
                  CANDIDATE MANAGEMENT
                  DESKTOP = LEFT FORM + RIGHT CANDIDATES
                  MOBILE = FORM ABOVE CANDIDATES
              ===================================================== */}
              <div className="grid items-start gap-5 lg:grid-cols-[350px_1fr]">

                {/* ADD CANDIDATE */}
                <section className="rounded-[24px] bg-white p-4 shadow-[0_10px_35px_rgba(31,42,68,.07)] sm:p-5 lg:sticky lg:top-5">

                  <div className="mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e5f8f2]">
                        <Plus size={19} className="text-[#20a88e]" />
                      </div>

                      <div>
                        <h2 className="text-[18px] font-bold text-[#182521]">
                          Add Candidate
                        </h2>

                        <p className="text-xs text-[#82908b]">
                          Add a new candidate
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`mb-4 rounded-xl px-3 py-2.5 text-xs leading-relaxed ${
                      candidateManagementLocked
                        ? 'bg-[#fff2f0] text-[#a33b32]'
                        : 'bg-[#f0faf6] text-[#4d7669]'
                    }`}
                  >
                    {candidateStatusMsg}
                  </div>

                  <form
                    onSubmit={candidateForm.handleSubmit(
                      handleAddCandidate
                    )}
                    className="space-y-3"
                  >
                    {/* Name */}
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-[#56645f]">
                        Name
                      </label>

                      <input
                        {...candidateForm.register('c_name')}
                        placeholder="Candidate name"
                        disabled={candidateManagementLocked}
                        className="w-full rounded-xl border border-[#dce5e1] bg-[#fbfdfc] px-3.5 py-3 text-sm outline-none transition placeholder:text-[#aab5b1] focus:border-[#2aae94] focus:bg-white focus:ring-4 focus:ring-[#20aa91]/10 disabled:cursor-not-allowed disabled:bg-[#f3f5f4]"
                      />

                      {candidateForm.formState.errors.c_name && (
                        <p className="mt-1 text-[11px] text-red-500">
                          {String(
                            candidateForm.formState.errors.c_name.message
                          )}
                        </p>
                      )}
                    </div>

                    {/* Number */}
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-[#56645f]">
                        Candidate number
                      </label>

                      <input
                        {...candidateForm.register('c_number')}
                        type="number"
                        min="1"
                        placeholder="e.g. 01"
                        disabled={candidateManagementLocked}
                        className="w-full rounded-xl border border-[#dce5e1] bg-[#fbfdfc] px-3.5 py-3 text-sm outline-none transition placeholder:text-[#aab5b1] focus:border-[#2aae94] focus:bg-white focus:ring-4 focus:ring-[#20aa91]/10 disabled:cursor-not-allowed disabled:bg-[#f3f5f4]"
                      />

                      {candidateForm.formState.errors.c_number && (
                        <p className="mt-1 text-[11px] text-red-500">
                          {String(
                            candidateForm.formState.errors.c_number.message
                          )}
                        </p>
                      )}
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-[#56645f]">
                        Group
                      </label>

                      <select
                        {...candidateForm.register('c_gender')}
                        disabled={candidateManagementLocked}
                        className="w-full rounded-xl border border-[#dce5e1] bg-[#fbfdfc] px-3.5 py-3 text-sm outline-none transition focus:border-[#2aae94] focus:bg-white focus:ring-4 focus:ring-[#20aa91]/10 disabled:cursor-not-allowed disabled:bg-[#f3f5f4]"
                      >
                        <option value="boy">Boy</option>
                        <option value="girl">Girl</option>
                      </select>
                    </div>

                    {/* Photo */}
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-[#56645f]">
                        Candidate photo
                      </label>

                      <label
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#cbd9d4] bg-[#fbfdfc] px-3 py-3 ${
                          candidateManagementLocked
                            ? 'pointer-events-none opacity-50'
                            : 'hover:bg-[#f6faf8]'
                        }`}
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#edf8f4]">
                          <Upload
                            size={16}
                            className="text-[#229c84]"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-[#4e5d57]">
                            Choose photo
                          </p>
                          <p className="text-[10px] text-[#97a39f]">
                            JPG, PNG or WEBP
                          </p>
                        </div>

                        <input
                          {...candidateForm.register('c_photo')}
                          type="file"
                          accept="image/*"
                          disabled={candidateManagementLocked}
                          className="hidden"
                        />
                      </label>

                      {candidateForm.formState.errors.c_photo && (
                        <p className="mt-1 text-[11px] text-red-500">
                          {String(
                            candidateForm.formState.errors.c_photo.message
                          )}
                        </p>
                      )}
                    </div>

                    <button
                      disabled={candidateManagementLocked}
                      className="flex w-full items-center justify-center gap-2 rounded-xl green-bg px-4 py-3 text-sm font-bold text-white shadow-[0_6px_16px_rgba(32,170,145,.18)] transition hover:bg-[#18977f] active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <Plus size={17} />
                      Add candidate
                    </button>
                  </form>
                </section>


                {/* CANDIDATES */}
                <section className="min-w-0 rounded-[24px] bg-white p-4 shadow-[0_10px_35px_rgba(31,42,68,.07)] sm:p-5">

                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-[19px] font-bold text-[#182521]">
                        Your Candidates
                      </h2>

                      <p className="mt-0.5 text-xs text-[#87938f]">
                        {candidates.length}{' '}
                        {candidates.length === 1
                          ? 'candidate'
                          : 'candidates'}
                      </p>
                    </div>

                    <div className="flex h-9 min-w-9 items-center justify-center rounded-full bg-[#eef9f5] px-3 text-xs font-bold text-[#218f78]">
                      {candidates.length}
                    </div>
                  </div>

                  {candidates.length === 0 ? (
                    <div className="rounded-[20px] border border-dashed border-[#dce7e3] bg-[#fbfdfc] px-5 py-10 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf8f4]">
                        <User
                          size={22}
                          className="text-[#2ba18a]"
                        />
                      </div>

                      <p className="text-sm font-bold text-[#586660]">
                        No candidates yet
                      </p>

                      <p className="mt-1 text-xs text-[#8d9995]">
                        Add your first candidate using the form.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">

{candidates.map(candidate => (
  <motion.div
    key={candidate.c_id}
    whileHover={{ y: -2 }}
    className="relative flex h-[95px] items-center gap-3 rounded-[18px] border border-white bg-white p-2.5 shadow-[0_6px_18px_rgba(30,70,55,.06)]"
  >

    {/* PHOTO */}
    <div className="h-[70px] w-[70px] shrink-0 overflow-hidden rounded-[14px] bg-[#edf5f1]">
      {candidate.c_photo ? (
        <img
          src={candidate.c_photo}
          alt={candidate.c_name}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[#a5b5af]">
          <User size={24} />
        </div>
      )}
    </div>

    {/* INFORMATION */}
    <div className="min-w-0 flex-1">

      <p className="text-[11px] font-medium text-[#7d8985]">
        No. {candidate.c_number} ·{' '}
        {candidate.c_gender === 'boy' ? 'Boys' : 'Girls'}
      </p>

      <h3 className="mt-0.5 truncate text-[15px] font-bold text-[#26332f]">
        {candidate.c_name}
      </h3>

      {/* EDIT BUTTON */}
      {!candidateManagementLocked && (
        <button
          onClick={() => startCandidateEdit(candidate.c_id)}
          className="mt-2 flex items-center gap-1.5 rounded-xl bg-[#e8f8f2] px-3 py-1.5 text-xs font-bold text-[#15836c] transition hover:bg-[#d9f3e9] active:scale-[.97]"
        >
          <Edit2 size={13} />
          Edit
        </button>
      )}
    </div>

    {/* DELETE BUTTON */}
    {!candidateManagementLocked && (
      <button
        onClick={() => deleteCandidate(candidate.c_id)}
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-[#e05b5b] hover:bg-[#fff0ed]"
        aria-label="Delete candidate"
      >
        <Trash2 size={14} />
      </button>
    )}

  </motion.div>
))}

                    </div>
                  )}
                </section>
              </div>


              {/* =====================================================
                  EDIT CANDIDATE
              ===================================================== */}
              {editingCandidateId !== null && (
                <section className="rounded-[24px] border border-[#dcece6] bg-white p-4 shadow-[0_10px_35px_rgba(31,42,68,.07)] sm:p-5">

                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[1px] text-[#24a58c]">
                        Candidate Management
                      </p>

                      <h2 className="mt-1 text-xl font-bold text-[#182521]">
                        Edit Candidate
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={cancelCandidateEdit}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3f6f4] text-[#6e7b77]"
                    >
                      <X size={17} />
                    </button>
                  </div>

                  <form
                    onSubmit={editCandidateForm.handleSubmit(
                      handleUpdateCandidate
                    )}
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    <input
                      {...editCandidateForm.register('c_name')}
                      placeholder="Name"
                      required
                      className="w-full rounded-xl border border-[#dce5e1] bg-[#fbfdfc] px-3.5 py-3 text-sm outline-none focus:border-[#2aae94] focus:ring-4 focus:ring-[#20aa91]/10"
                    />

                    <input
                      {...editCandidateForm.register('c_number')}
                      type="number"
                      min="1"
                      placeholder="Candidate number"
                      required
                      className="w-full rounded-xl border border-[#dce5e1] bg-[#fbfdfc] px-3.5 py-3 text-sm outline-none focus:border-[#2aae94] focus:ring-4 focus:ring-[#20aa91]/10"
                    />

                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#cbd9d4] bg-[#fbfdfc] px-3 py-3 sm:col-span-2">
                      <Upload
                        size={17}
                        className="text-[#229c84]"
                      />

                      <span className="text-xs font-semibold text-[#596760]">
                        Choose new photo
                      </span>

                      <input
                        {...editCandidateForm.register('c_photo')}
                        type="file"
                        accept="image/*"
                        className="hidden"
                      />
                    </label>

                    <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">
                      <button
                        type="submit"
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl green-bg px-4 py-3 text-sm font-bold text-white transition active:scale-[.98]"
                      >
                        <Check size={16} />
                        Save Changes
                      </button>

                      <button
                        type="button"
                        className="rounded-xl bg-[#f0f3f1] px-5 py-3 text-sm font-bold text-[#66736e]"
                        onClick={cancelCandidateEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </section>
              )}


              {/* =====================================================
                  COMBINED CANDIDATES
              ===================================================== */}
              {combinedCandidates.length > 0 && (
                <section className="rounded-[24px] bg-white p-4 shadow-[0_10px_35px_rgba(31,42,68,.07)] sm:p-5">

                  <div className="mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff5dc]">
                        <User
                          size={19}
                          className="text-[#d39429]"
                        />
                      </div>

                      <div>
                        <h2 className="text-[18px] font-bold text-[#182521]">
                          Combined Candidates
                        </h2>

                        <p className="text-xs text-[#87938f]">
                          Candidates from your accepted combination
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {combinedCandidates.map(c => (
                      <div
                        key={c.c_id}
                        className="overflow-hidden rounded-[20px] border border-[#e8ece9] bg-[#fbfdfc]"
                      >
                        <div className="relative aspect-[1.55/1] overflow-hidden bg-[#edf2ef]">
                          {c.c_photo ? (
                            <img
                              src={c.c_photo}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <User
                                size={36}
                                className="text-[#b2c0bb]"
                              />
                            </div>
                          )}

                          <div className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#34423d] shadow-sm">
                            #{c.c_number}
                          </div>
                        </div>

                        <div className="p-3.5">
                          <p className="truncate text-sm font-bold text-[#27342f]">
                            {c.c_name}
                          </p>

                          <p className="mt-1 text-xs text-[#7f8c87]">
                            {c.major} — {c.c_gender}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}


              {/* =====================================================
                  TITLES
              ===================================================== */}
              <section className="rounded-[24px] bg-white p-4 shadow-[0_10px_35px_rgba(31,42,68,.07)] sm:p-5">

                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff1dc]">
                    <Award
                      size={19}
                      className="text-[#d28b22]"
                    />
                  </div>

                  <div>
                    <h2 className="text-[18px] font-bold text-[#182521]">
                      Titles
                    </h2>

                    <p className="text-xs text-[#87938f]">
                      Manage event titles
                    </p>
                  </div>
                </div>

                <div
                  className={`mb-4 rounded-xl px-3 py-2.5 text-xs leading-relaxed ${
                    titlesLocked
                      ? 'bg-[#fff5ed] text-[#a86c38]'
                      : 'bg-[#f0faf6] text-[#4d7669]'
                  }`}
                >
                  {titleStatusMsg}
                </div>

                {/* Add title */}
                <form
                  onSubmit={titleForm.handleSubmit(handleAddTitle)}
                  className="mb-4 grid gap-2 sm:grid-cols-[1fr_180px_auto]"
                >
                  <input
                    {...titleForm.register('title')}
                    placeholder="Title name"
                    disabled={titlesLocked}
                    className="w-full rounded-xl border border-[#dce5e1] bg-[#fbfdfc] px-3.5 py-3 text-sm outline-none placeholder:text-[#aab5b1] focus:border-[#2aae94] focus:ring-4 focus:ring-[#20aa91]/10 disabled:bg-[#f3f5f4]"
                  />

                  <select
                    {...titleForm.register('group')}
                    disabled={titlesLocked}
                    className="w-full rounded-xl border border-[#dce5e1] bg-[#fbfdfc] px-3.5 py-3 text-sm outline-none focus:border-[#2aae94] focus:ring-4 focus:ring-[#20aa91]/10 disabled:bg-[#f3f5f4]"
                  >
                    <option value="boy">Boy title</option>
                    <option value="girl">Girl title</option>
                  </select>

                  <button
                    disabled={titlesLocked}
                    className="flex items-center justify-center gap-2 rounded-xl green-bg px-4 py-3 text-sm font-bold text-white transition active:scale-[.98] disabled:opacity-45"
                  >
                    <Plus size={16} />
                    Add
                  </button>
                </form>

                {/* Title list */}
                <div className="grid gap-2 sm:grid-cols-2">
                  {titles.map(t => (
                    <div
                      key={t.title_id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[#e7ece9] bg-[#fbfdfc] px-3.5 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#33413c]">
                          {t.title}
                        </p>

                        <span className="mt-1 inline-block rounded-full bg-[#eaf7f3] px-2 py-0.5 text-[9px] font-bold capitalize text-[#238f78]">
                          {t.group}
                        </span>
                      </div>

                      {!titlesLocked && (
                        <button
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff0ee] text-[#bd4037] transition hover:bg-[#ffe5e2]"
                          onClick={() => deleteTitle(t.title_id)}
                          aria-label="Delete title"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}


          {/* =========================================================
              WHOLE ADMIN UI
          ========================================================= */}
          {me && me.admin_role === 'whole_admin' && (
            <div className="space-y-5">

              {/* Whole candidates */}
              <section className="rounded-[24px] bg-white p-4 shadow-[0_10px_35px_rgba(31,42,68,.07)] sm:p-5">

                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f7f2]">
                        <Award
                          size={19}
                          className="text-[#219d84]"
                        />
                      </div>

                      <div>
                        <h2 className="text-[19px] font-bold text-[#182521]">
                          The Whole Welcome
                        </h2>

                        <p className="text-xs text-[#87938f]">
                          Manage the whole welcome candidates
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={loadWhole}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#f0f5f3] px-4 py-3 text-xs font-bold text-[#52625b] transition hover:bg-[#e8eeeb] sm:w-auto"
                  >
                    <RefreshCw size={14} />
                    Refresh
                  </button>
                </div>

                {!wholeReady ? (
                  <div className="rounded-[18px] bg-[#fff4f1] p-4">
                    <p className="text-sm font-bold text-[#b3473e]">
                      Waiting for major data
                    </p>

                    <p className="mt-1 text-xs text-[#9c716c]">
                      {wholeMissingMajors.join(', ')}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {wholeCandidates.map(candidate => (
                      <div
                        key={candidate.c_id}
                        className="rounded-[20px] border border-[#e6ece9] bg-[#fbfdfc] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-[#293630]">
                              #{candidate.c_w_number}{' '}
                              {candidate.c_name}
                            </p>

                            <p className="mt-1 text-xs text-[#7d8a85]">
                              {candidate.major}
                            </p>
                          </div>

                          <span className="rounded-full bg-[#fff4dc] px-2.5 py-1 text-[9px] font-bold text-[#b47a27]">
                            Winner
                          </span>
                        </div>

                        <p className="mt-3 rounded-xl bg-white p-3 text-xs leading-relaxed text-[#687670]">
                          <span className="font-bold text-[#4b5954]">
                            Awarded:
                          </span>{' '}
                          {(candidate.awarded_titles || []).join(
                            ', '
                          ) || 'No title found'}
                        </p>

                        <div className="mt-3 flex gap-2">
                          <input
                            id={`wholeNumber${candidate.c_id}`}
                            type="number"
                            min="1"
                            defaultValue={candidate.c_w_number}
                            className="min-w-0 flex-1 rounded-xl border border-[#dce5e1] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#2aae94] focus:ring-4 focus:ring-[#20aa91]/10"
                          />

                          <button
                            onClick={() => {
                              const inputEl =
                                document.getElementById(
                                  `wholeNumber${candidate.c_id}`
                                ) as HTMLInputElement;

                              if (inputEl)
                                updateWholeNumber(
                                  candidate.c_id,
                                  Number(inputEl.value)
                                );
                            }}
                            className="rounded-xl green-bg px-3.5 py-2.5 text-xs font-bold text-white"
                          >
                            Save
                          </button>

                          <button
                            className="rounded-xl bg-[#fff0ee] px-3.5 py-2.5 text-xs font-bold text-[#bd4037]"
                            onClick={() =>
                              removeWhole(candidate.c_id)
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>


              {/* Available winners */}
              <section className="rounded-[24px] bg-white p-4 shadow-[0_10px_35px_rgba(31,42,68,.07)] sm:p-5">

                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-[19px] font-bold text-[#182521]">
                      Available Major Winners
                    </h2>

                    <p className="mt-1 text-xs text-[#87938f]">
                      Select winners for the whole welcome
                    </p>
                  </div>

                  <button
                    onClick={loadAvailableWhole}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#f0f5f3] px-4 py-3 text-xs font-bold text-[#52625b] sm:w-auto"
                  >
                    <RefreshCw size={14} />
                    Refresh
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {availableWholeCandidates.map(candidate => (
                    <div
                      key={candidate.c_id}
                      className="rounded-[20px] border border-[#e6ece9] bg-[#fbfdfc] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[#293630]">
                            #{candidate.c_number}{' '}
                            {candidate.c_name}
                          </p>

                          <p className="mt-1 text-xs text-[#7d8a85]">
                            {candidate.major}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-xs leading-relaxed text-[#687670]">
                        <span className="font-bold text-[#4b5954]">
                          Awarded:
                        </span>{' '}
                        {(candidate.awarded_titles || []).join(
                          ', '
                        ) || 'No title found'}
                      </p>

                      {candidate.selected ? (
                        <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-[#eaf8f3] px-3 py-2.5 text-xs font-bold text-[#218f78]">
                          <Check size={14} />
                          Added to Whole
                        </div>
                      ) : (
                        <button
                          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl green-bg px-3 py-2.5 text-xs font-bold text-white transition active:scale-[.98]"
                          onClick={() =>
                            addWhole(candidate.c_id)
                          }
                        >
                          <Plus size={15} />
                          Add to Whole
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

        </div>
      </motion.div>
    </Layout>
  );
}
