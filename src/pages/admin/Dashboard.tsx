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
    setTitleStatusMsg(data.locked ? 'Titles are locked because a festival has already started or completed.' : 'Titles can be managed before festivals begin.');
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
        className="max-w-[1120px] mx-auto p-5 space-y-5 min-h-screen"
      >
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* ADMIN NAVIGATION IDENTITY */}
      {me && (
        <div className="bg-white border border-[#e7ebf2] rounded-[20px] p-[22px] mb-[18px] shadow-[0_10px_32px_rgba(31,42,68,.06)]">
          <div className="flex items-center gap-[10px] flex-wrap">
            <span>Signed in as {me.admin_name}</span>
            <span className="inline-block p-[5px_9px] rounded-full bg-[#eef2ff] text-xs font-bold">
              {me.admin_role === 'major_admin' ? `Major: ${me.major || 'Unknown'}` : 'Whole Festival Admin'}
            </span>
            {me.admin_role === 'major_admin'}
          </div>
        </div>
      )}

      {/* MAJOR ADMIN UI */}
      {me && me.admin_role === 'major_admin' && (
        <div>
          {/* COMBINE MAJORS PANEL */}
          <div className="bg-white border border-[#e7ebf2] rounded-[20px] p-[22px] mb-[18px] shadow-[0_10px_32px_rgba(31,42,68,.06)]">
            <div className="flex items-center justify-between flex-wrap gap-[10px]">
              <h2 className="m-0 text-xl font-bold">Combine Majors</h2>
              <button type="button" onClick={() => openCombineForm()} className="border-0 rounded-[10px] p-[10px_16px] green-bg text-white font-bold cursor-pointer">Combine</button>
            </div>
            <p className="text-[#667085] mt-2">Create one shared festival with your major and selected available majors.</p>
            
            <div className="mt-4 flex flex-col gap-3">
              {combineRequests.map(request => {
                const pendingForMe = request.status === 'pending' && !request.is_requester && request.my_response === 'pending';
                return (
                  <div key={request.request_id} className="bg-white border border-[#e7ebf2] rounded-[16px] p-[14px]">
                    <b>{request.request_type === 'edit' ? 'Edit request' : 'Combine request'}: {request.combined_name}</b>
                    <p className="my-1">{request.majors.join(' + ')}</p>
                    <span className="inline-block p-[5px_9px] rounded-full bg-[#eef2ff] text-xs font-bold">{request.status}</span>
                    {request.status === 'rejected' && <p className="bg-[#f8fafc] p-3 rounded-[10px] mt-2">Rejected: {request.rejection_message || 'No reason provided.'}</p>}
                    {pendingForMe && (
                      <div className="flex gap-2 mt-3">
                        <button className="bg-[#067647] text-white rounded-[10px] p-[10px_16px] font-bold border-0 cursor-pointer" onClick={() => respondCombine(request.request_id, 'accepted')}>Accept</button>
                        <button className="bg-[#b42318] text-white rounded-[10px] p-[10px_16px] font-bold border-0 cursor-pointer" onClick={() => rejectCombine(request.request_id)}>Reject</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {!combinedFestivals.length ? (
                <p className="text-[#667085]">No accepted combined festival yet.</p>
              ) : (
                combinedFestivals.map(item => (
                  <div key={item.combined_id} className="bg-white border border-[#e7ebf2] rounded-[16px] p-[14px]">
                    <b>{item.combined_name}</b>
                    <p className="my-1">{item.majors.join(' + ')}</p>
                    <span className="inline-block p-[5px_9px] rounded-full bg-[#eef2ff] text-xs font-bold">
                      {item.status === 1 ? 'Running' : item.status === 2 ? 'Completed' : 'Not started'}
                    </span>
                    {item.editable && (
                      <button className="green-bg text-white rounded-[10px] p-[10px_16px] font-bold border-0 cursor-pointer ml-2" onClick={() => openCombineForm(item.combined_id)}>
                        Edit Combine
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COMBINE EDITOR MODAL / PANEL */}
          {isCombineEditorOpen && (
            <div className="bg-white border border-[#e7ebf2] rounded-[20px] p-[22px] mb-[18px] shadow-[0_10px_32px_rgba(31,42,68,.06)]">
              <h2>{editingCombinedId !== null ? 'Edit Combined Festival' : 'Create Combined Festival'}</h2>
              <form onSubmit={handleSaveCombine} className="flex flex-col gap-3">
                <input 
                  value={combinedName} 
                  onChange={e => setCombinedName(e.target.value)} 
                  placeholder="Combined festival name" 
                  required 
                  className="w-full p-[11px_12px] border border-[#d6dbe5] rounded-[10px] bg-white"
                />
                <p><b>Your major is included automatically.</b></p>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[14px]">
                  {availableMajors.map(major => (
                    <label key={major.major_id} className="bg-white border border-[#e7ebf2] rounded-[16px] p-[14px] flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        value={major.major_id}
                        checked={selectedMajorIds.includes(major.major_id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedMajorIds([...selectedMajorIds, major.major_id]);
                          } else {
                            setSelectedMajorIds(selectedMajorIds.filter(id => id !== major.major_id));
                          }
                        }}
                      />
                      {major.major}
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="border-0 rounded-[10px] p-[10px_16px] green-bg text-white font-bold cursor-pointer">
                    {editingCombinedId !== null ? 'Save Combine' : 'Combine'}
                  </button>
                  <button type="button" className="border-0 rounded-[10px] p-[10px_16px] green-bg text-white font-bold cursor-pointer" onClick={() => setIsCombineEditorOpen(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* ADD CANDIDATE PANEL */}
          <div className="bg-white border border-[#e7ebf2] rounded-[20px] p-[22px] mb-[18px] shadow-[0_10px_32px_rgba(31,42,68,.06)]">
            <h2>Add Current Candidate</h2>
            <p className="bg-[#f8fafc] p-[12px] rounded-[10px] my-3">{candidateStatusMsg}</p>
            <form onSubmit={candidateForm.handleSubmit(handleAddCandidate)} className="flex flex-col gap-3">
              <div>
                <input {...candidateForm.register('c_name')} placeholder="Name" disabled={candidateManagementLocked} className="w-full p-[11px_12px] border border-[#d6dbe5] rounded-[10px] bg-white" />
                {candidateForm.formState.errors.c_name && <p className="text-red-500 text-xs">{String(candidateForm.formState.errors.c_name.message)}</p>}
              </div>
              <div>
                <input {...candidateForm.register('c_number')} type="number" min="1" placeholder="Candidate number" disabled={candidateManagementLocked} className="w-full p-[11px_12px] border border-[#d6dbe5] rounded-[10px] bg-white" />
                {candidateForm.formState.errors.c_number && <p className="text-red-500 text-xs">{String(candidateForm.formState.errors.c_number.message)}</p>}
              </div>
              <div>
                <select {...candidateForm.register('c_gender')} disabled={candidateManagementLocked} className="w-full p-[11px_12px] border border-[#d6dbe5] rounded-[10px] bg-white">
                  <option value="boy">Boy</option>
                  <option value="girl">Girl</option>
                </select>
              </div>
              <div>
                <input {...candidateForm.register('c_photo')} type="file" accept="image/*" disabled={candidateManagementLocked} className="w-full p-[11px_12px] border border-[#d6dbe5] rounded-[10px] bg-white" />
                {candidateForm.formState.errors.c_photo && <p className="text-red-500 text-xs">{String(candidateForm.formState.errors.c_photo.message)}</p>}
              </div>
              <button disabled={candidateManagementLocked} className="border-0 rounded-[10px] p-[10px_16px] green-bg text-white font-bold cursor-pointer disabled:opacity-45">Add</button>
            </form>
          </div>

          {/* CANDIDATES LIST PANEL */}
          <div className="bg-white border border-[#e7ebf2] rounded-[20px] p-[22px] mb-[18px] shadow-[0_10px_32px_rgba(31,42,68,.06)]">
            <h2>Your Major Candidates</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-[14px] mt-4">
              {candidates.map(candidate => (
                <div key={candidate.c_id} className="bg-white border border-[#e7ebf2] rounded-[16px] p-[14px]">
                  {candidate.c_photo && <img src={candidate.c_photo} className="w-full h-[220px] object-cover rounded-[12px] bg-[#edf1f6] mb-2" />}
                  <b>#{candidate.c_number} {candidate.c_name}</b> ({candidate.c_gender})
                  {candidateManagementLocked ? (
                    <p className="text-[#667085] mt-2">Locked</p>
                  ) : (
                    <div className="flex gap-2 mt-3">
                      <button className="green-bg text-white rounded-[10px] p-[10px_16px] font-bold border-0 cursor-pointer" onClick={() => startCandidateEdit(candidate.c_id)}>Edit</button>
                      <button className="bg-[#b42318] text-white rounded-[10px] p-[10px_16px] font-bold border-0 cursor-pointer" onClick={() => deleteCandidate(candidate.c_id)}>Delete</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* COMBINED CANDIDATES PANEL */}
          {combinedCandidates.length > 0 && (
            <div className="bg-white border border-[#e7ebf2] rounded-[20px] p-[22px] mb-[18px] shadow-[0_10px_32px_rgba(31,42,68,.06)]">
              <h2>Combined Candidates</h2>
              <p className="text-[#667085] mb-4">Candidates from every major in your accepted combination.</p>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-[14px]">
                {combinedCandidates.map(c => (
                  <div key={c.c_id} className="bg-white border border-[#e7ebf2] rounded-[16px] p-[14px]">
                    {c.c_photo && <img src={c.c_photo} className="w-full h-[220px] object-cover rounded-[12px] bg-[#edf1f6] mb-2" />}
                    <b>#{c.c_number} {c.c_name}</b>
                    <p className="text-[#667085] mt-1">{c.major} — {c.c_gender}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TITLES PANEL */}
          <div className="bg-white border border-[#e7ebf2] rounded-[20px] p-[22px] mb-[18px] shadow-[0_10px_32px_rgba(31,42,68,.06)]">
            <h2>Titles</h2>
            <p className="bg-[#f8fafc] p-[12px] rounded-[10px] my-3">{titleStatusMsg}</p>
            <form onSubmit={titleForm.handleSubmit(handleAddTitle)} className="flex flex-col gap-3 mb-4">
              <input {...titleForm.register('title')} placeholder="Title name" disabled={titlesLocked} className="w-full p-[11px_12px] border border-[#d6dbe5] rounded-[10px] bg-white" />
              <select {...titleForm.register('group')} disabled={titlesLocked} className="w-full p-[11px_12px] border border-[#d6dbe5] rounded-[10px] bg-white">
                <option value="boy">Boy title</option>
                <option value="girl">Girl title</option>
              </select>
              <button disabled={titlesLocked} className="border-0 rounded-[10px] p-[10px_16px] green-bg text-white font-bold cursor-pointer disabled:opacity-45">Add Title</button>
            </form>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-[14px]">
              {titles.map(t => (
                <div key={t.title_id} className="bg-white border border-[#e7ebf2] rounded-[16px] p-[14px] flex justify-between items-center">
                  <div>
                    <b>{t.title}</b> <span className="inline-block p-[5px_9px] rounded-full bg-[#eef2ff] text-xs font-bold ml-2">{t.group}</span>
                  </div>
                  {!titlesLocked && (
                    <button className="text-[#b42318] rounded-[10px] p-[6px_12px] font-bold border-0 cursor-pointer" onClick={() => deleteTitle(t.title_id)}> <Trash2 size={16} /> </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* EDIT CANDIDATE MODAL / PANEL */}
          {editingCandidateId !== null && (
            <div className="bg-white border border-[#e7ebf2] rounded-[20px] p-[22px] mb-[18px] shadow-[0_10px_32px_rgba(31,42,68,.06)]">
              <h2>Edit Candidate</h2>
              <form onSubmit={editCandidateForm.handleSubmit(handleUpdateCandidate)} className="flex flex-col gap-3">
                <input {...editCandidateForm.register('c_name')} placeholder="Name" required className="w-full p-[11px_12px] border border-[#d6dbe5] rounded-[10px] bg-white" />
                <input {...editCandidateForm.register('c_number')} type="number" min="1" placeholder="Candidate number" required className="w-full p-[11px_12px] border border-[#d6dbe5] rounded-[10px] bg-white" />
                <input {...editCandidateForm.register('c_photo')} type="file" accept="image/*" className="w-full p-[11px_12px] border border-[#d6dbe5] rounded-[10px] bg-white" />
                <div className="flex gap-2">
                  <button type="submit" className="border-0 rounded-[10px] p-[10px_16px] green-bg text-white font-bold cursor-pointer">Save Changes</button>
                  <button type="button" className="border-0 rounded-[10px] p-[10px_16px] green-bg text-white font-bold cursor-pointer" onClick={cancelCandidateEdit}>Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* WHOLE ADMIN UI */}
      {me && me.admin_role === 'whole_admin' && (
        <div>
          <div className="bg-white border border-[#e7ebf2] rounded-[20px] p-[22px] mb-[18px] shadow-[0_10px_32px_rgba(31,42,68,.06)]">
            <h2>Whole Festival Candidates</h2>
            <p className="text-[#667085] mb-3">Only the Whole Admin can manage this list. Major admins cannot edit Whole candidates.</p>
            <button onClick={loadWhole} className="border-0 rounded-[10px] p-[10px_16px] green-bg text-white font-bold cursor-pointer mb-4">Refresh</button>
            
            {!wholeReady ? (
              <p className="text-red-500 font-semibold">Waiting for: {wholeMissingMajors.join(', ')}</p>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-[14px]">
                {wholeCandidates.map(candidate => (
                  <div key={candidate.c_id} className="bg-white border border-[#e7ebf2] rounded-[16px] p-[14px]">
                    <b>#{candidate.c_w_number} {candidate.c_name}</b> — {candidate.major}
                    <p className="text-[#667085] my-2">Awarded: {(candidate.awarded_titles || []).join(', ') || 'No title found'}</p>
                    <div className="flex items-center gap-2">
                      <input 
                        id={`wholeNumber${candidate.c_id}`}
                        type="number" 
                        min="1" 
                        defaultValue={candidate.c_w_number} 
                        className="w-[100px] p-[8px] border border-[#d6dbe5] rounded-[10px] bg-white"
                      />
                      <button onClick={() => {
                        const inputEl = document.getElementById(`wholeNumber${candidate.c_id}`) as HTMLInputElement;
                        if (inputEl) updateWholeNumber(candidate.c_id, Number(inputEl.value));
                      }} className="border-0 rounded-[10px] p-[8px_12px] green-bg text-white font-bold text-xs cursor-pointer">Save</button>
                      <button className="border-0 rounded-[10px] p-[8px_12px] bg-[#b42318] text-white font-bold text-xs cursor-pointer" onClick={() => removeWhole(candidate.c_id)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-[#e7ebf2] rounded-[20px] p-[22px] mb-[18px] shadow-[0_10px_32px_rgba(31,42,68,.06)]">
            <h2>Available Major Winners</h2>
            <button onClick={loadAvailableWhole} className="border-0 rounded-[10px] p-[10px_16px] green-bg text-white font-bold cursor-pointer mb-4">Refresh</button>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-[14px]">
              {availableWholeCandidates.map(candidate => (
                <div key={candidate.c_id} className="bg-white border border-[#e7ebf2] rounded-[16px] p-[14px]">
                  <b>#{candidate.c_number} {candidate.c_name}</b> — {candidate.major}
                  <p className="text-[#667085] my-2">Awarded: {(candidate.awarded_titles || []).join(', ')}</p>
                  {candidate.selected ? (
                    <span className="inline-block p-[5px_9px] rounded-full bg-[#eef2ff] text-xs font-bold">Added to Whole</span>
                  ) : (
                    <button className="border-0 rounded-[10px] p-[8px_14px] green-bg text-white font-bold cursor-pointer" onClick={() => addWhole(candidate.c_id)}>Add</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
    </Layout>
  );
}