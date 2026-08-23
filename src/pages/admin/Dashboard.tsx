import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Vote, Clock, Users, Trophy, Activity, Calendar, Trash2 } from 'lucide-react';
import { useStore } from '../../lib/store';
import Layout from '../../layouts/AdminLayout';
import StatCard from '../../components/ui/StatCard';
import EventForm from '../../components/ui/EventForm';
import { format, formatDistanceToNow } from 'date-fns';

const Dashboard: React.FC = () => {
  const { activeEvent, candidates, totalVotes, admin, createEvent, resetEvent } = useStore();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateEvent = (data: any) => {
    const { candidates: candidateData, ...eventData } = data;
    createEvent({ ...eventData, isActive: true }, candidateData);
    setIsCreating(false);
  };

  if (!activeEvent && !isCreating) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-24 h-24 rounded-3xl green-bg flex items-center justify-center shadow-2xl shadow-[hsl(265_85%_60%)]/40 mb-8"
          >
            <Vote className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="font-serif font-bold text-4xl text-[hsl(265_30%_15%)] mb-4">No Active Event</h1>
          <p className="text-lg text-[hsl(265_10%_45%)] max-w-md mb-10">
            Welcome, {admin?.name}. You haven't created a voting event yet. Start by setting up your candidates and categories.
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="group relative px-8 py-4 rounded-2xl green-bg text-white font-bold text-lg hover:scale-105 transition-all flex items-center gap-3"
          >
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
            Create Your First Event
          </button>
        </div>
      </Layout>
    );
  }

  if (isCreating) {
    return (
      <Layout>
        <div className="py-8">
          <EventForm onSubmit={handleCreateEvent} onCancel={() => setIsCreating(false)} />
        </div>
      </Layout>
    );
  }

  const leadingCandidates = [...candidates].sort((a, b) => b.votes - a.votes).slice(0, 5);

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="font-serif font-bold text-3xl text-[hsl(265_30%_15%)] mb-1">
            {activeEvent?.title}
          </h1>
          <p className="text-[hsl(265_10%_45%)]">Live election monitoring and management</p>
        </motion.div>
        <button
          onClick={resetEvent}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/5 transition-all text-sm font-semibold"
        >
          <Trash2 className="w-4 h-4" />
          End & Reset Event
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon={Users} label="Total Candidates" value={candidates.length} color="bg-[hsl(265_85%_95%)] text-[hsl(265_85%_50%)]" />
        <StatCard icon={Vote} label="Total Votes" value={totalVotes.toLocaleString()} trend="+Live" color="bg-[hsl(140_60%_93%)] text-[hsl(140_60%_38%)]" />
        <StatCard icon={Activity} label="Status" value="Active" color="bg-[hsl(45_90%_93%)] text-[hsl(45_80%_42%)]" />
        <StatCard 
          icon={Clock} 
          label="Time Remaining" 
          value={activeEvent ? formatDistanceToNow(new Date(activeEvent.endDate)) : 'N/A'} 
          color="bg-[hsl(200_80%_95%)] text-[hsl(200_70%_40%)]" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[hsl(265_10%_92%)] shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif font-bold text-xl text-[hsl(265_30%_15%)]">Current Leaderboard</h2>
            <Trophy className="w-6 h-6 text-[hsl(45_80%_50%)]" />
          </div>
          <div className="space-y-4">
            {leadingCandidates.map((c, i) => (
              <div key={c.id} className="flex items-center gap-4 p-4 rounded-xl bg-[hsl(260_30%_98%)] border border-[hsl(265_10%_95%)]">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-[hsl(265_10%_40%)] shadow-sm">
                  #{i + 1}
                </div>
                <img src={c.photoUrl} alt={c.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                <div className="flex-1">
                  <p className="font-bold text-[hsl(265_30%_15%)]">{c.name}</p>
                  <p className="text-xs text-[hsl(265_10%_50%)]">No. {c.number} · {c.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-[hsl(265_85%_55%)]">{c.votes}</p>
                  <p className="text-[10px] uppercase tracking-wider text-[hsl(265_10%_50%)]">Votes</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[hsl(265_85%_25%)] to-[hsl(280_80%_30%)] rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-[hsl(45_90%_65%)]" />
              <h3 className="font-serif font-bold text-lg">Event Schedule</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Ends On</p>
                <p className="font-semibold">{activeEvent ? format(new Date(activeEvent.endDate), 'PPP p') : 'N/A'}</p>
              </div>
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm font-medium">Voting is currently LIVE</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[hsl(265_10%_92%)] shadow-sm p-6">
            <h3 className="font-serif font-bold text-lg text-[hsl(265_30%_15%)] mb-4">Event Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[hsl(265_10%_50%)]">Boy Title:</span>
                <span className="font-semibold text-[hsl(265_30%_20%)]">{activeEvent?.boyTitle}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[hsl(265_10%_50%)]">Girl Title:</span>
                <span className="font-semibold text-[hsl(265_30%_20%)]">{activeEvent?.girlTitle}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[hsl(265_10%_50%)]">Total Candidates:</span>
                <span className="font-semibold text-[hsl(265_30%_20%)]">{candidates.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;