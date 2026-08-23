import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Calendar, ToggleLeft, ToggleRight, Save, Clock, AlertTriangle, Crown } from 'lucide-react';
import { useStore } from '../lib/store';
import Layout from '../components/Layout';
import { ALL_CATEGORIES, OPTIONAL_CATEGORIES } from '../lib/types';
import type { Category } from '../lib/types';
import { format } from 'date-fns';

const Settings: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const [endDate, setEndDate] = useState(format(new Date(settings.votingEndDate), "yyyy-MM-dd'T'HH:mm"));
  const [votingActive, setVotingActive] = useState(settings.votingActive);
  const [enabledCats, setEnabledCats] = useState<Category[]>(settings.enabledCategories);

  const toggleCategory = (cat: Category) => {
    if (enabledCats.includes(cat)) {
      setEnabledCats(enabledCats.filter(c => c !== cat));
    } else {
      setEnabledCats([...enabledCats, cat]);
    }
  };

  const handleSaveAll = () => {
    updateSettings({
      votingEndDate: new Date(endDate).toISOString(),
      votingActive,
      enabledCategories: enabledCats,
    });
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="font-serif font-bold text-3xl text-[hsl(265_30%_15%)] mb-1">Election Settings</h1>
        <p className="text-[hsl(265_10%_45%)]">Configure voting categories, schedule, and election status</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Selection */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-[hsl(265_10%_92%)] shadow-sm p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[hsl(265_85%_95%)] flex items-center justify-center">
                <Crown className="w-5 h-5 text-[hsl(265_85%_55%)]" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-xl text-[hsl(265_30%_15%)]">Voting Categories</h2>
                <p className="text-sm text-[hsl(265_10%_45%)]">Select which titles to include in the election</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(265_10%_45%)]">Main Titles</p>
              <div className="grid grid-cols-2 gap-3">
                {ALL_CATEGORIES.filter(c => !OPTIONAL_CATEGORIES.includes(c)).map(cat => {
                  const enabled = enabledCats.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                        enabled
                          ? 'border-[hsl(265_85%_60%)] bg-[hsl(265_85%_97%)]'
                          : 'border-[hsl(265_10%_90%)] bg-white hover:border-[hsl(265_10%_80%)]'
                      }`}
                    >
                      <span className={`font-medium ${enabled ? 'text-[hsl(265_85%_45%)]' : 'text-[hsl(265_10%_45%)]'}`}>{cat}</span>
                      {enabled
                        ? <ToggleRight className="w-6 h-6 text-[hsl(265_85%_55%)]" />
                        : <ToggleLeft className="w-6 h-6 text-[hsl(265_10%_60%)]" />
                      }
                    </button>
                  );
                })}
              </div>

              <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(265_10%_45%)] pt-3">Optional Titles</p>
              <div className="grid grid-cols-2 gap-3">
                {OPTIONAL_CATEGORIES.map(cat => {
                  const enabled = enabledCats.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                        enabled
                          ? 'border-[hsl(265_85%_60%)] bg-[hsl(265_85%_97%)]'
                          : 'border-[hsl(265_10%_90%)] bg-white hover:border-[hsl(265_10%_80%)]'
                      }`}
                    >
                      <span className={`font-medium ${enabled ? 'text-[hsl(265_85%_45%)]' : 'text-[hsl(265_10%_45%)]'}`}>{cat}</span>
                      {enabled
                        ? <ToggleRight className="w-6 h-6 text-[hsl(265_85%_55%)]" />
                        : <ToggleLeft className="w-6 h-6 text-[hsl(265_10%_60%)]" />
                      }
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Voting Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-[hsl(265_10%_92%)] shadow-sm p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[hsl(45_90%_93%)] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[hsl(45_80%_42%)]" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-xl text-[hsl(265_30%_15%)]">Voting Schedule</h2>
                <p className="text-sm text-[hsl(265_10%_45%)]">Set when the voting period ends</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[hsl(265_30%_20%)] mb-1.5">Voting End Date & Time</label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(265_10%_50%)] pointer-events-none" />
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[hsl(265_10%_88%)] bg-white focus:ring-2 focus:ring-[hsl(265_85%_60%)]/50 focus:border-[hsl(265_85%_60%)] outline-none transition-all text-[hsl(265_30%_15%)]"
                  />
                </div>
                <p className="text-xs text-[hsl(265_10%_45%)] mt-1.5">
                  Voting will automatically close at this time. Current: {format(new Date(settings.votingEndDate), 'MMM d, yyyy · h:mm a')}
                </p>
              </div>

              {new Date(endDate) <= new Date() && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-[hsl(0_70%_96%)] border border-[hsl(0_70%_85%)]">
                  <AlertTriangle className="w-5 h-5 text-[hsl(0_70%_45%)] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[hsl(0_70%_35%)]">The selected end date is in the past. Voting will be marked as ended.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar - Voting Status & Save */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-[hsl(265_10%_92%)] shadow-sm p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[hsl(140_60%_93%)] flex items-center justify-center">
                <SettingsIcon className="w-5 h-5 text-[hsl(140_60%_38%)]" />
              </div>
              <h2 className="font-serif font-bold text-lg text-[hsl(265_30%_15%)]">Voting Status</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-[hsl(260_30%_97%)] border border-[hsl(265_10%_92%)]">
                <div>
                  <p className="font-semibold text-[hsl(265_30%_15%)]">Active Voting</p>
                  <p className="text-xs text-[hsl(265_10%_45%)]">Allow students to cast votes</p>
                </div>
                <button
                  onClick={() => setVotingActive(!votingActive)}
                  className={`relative w-12 h-7 rounded-full transition-all ${votingActive ? 'bg-[hsl(140_60%_45%)]' : 'bg-[hsl(265_10%_80%)]'}`}
                  aria-label="Toggle voting active"
                >
                  <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${votingActive ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[hsl(265_85%_97%)] border border-[hsl(265_85%_90%)]">
                <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(265_85%_50%)] mb-2">Summary</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[hsl(265_10%_45%)]">Categories</span>
                    <span className="font-semibold text-[hsl(265_30%_15%)]">{enabledCats.length} active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[hsl(265_10%_45%)]">Status</span>
                    <span className={`font-semibold ${votingActive ? 'text-[hsl(140_60%_38%)]' : 'text-[hsl(0_70%_45%)]'}`}>
                      {votingActive ? 'Live' : 'Paused'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[hsl(265_10%_45%)]">End Date</span>
                    <span className="font-semibold text-[hsl(265_30%_15%)] text-right text-xs">
                      {format(new Date(endDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveAll}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl green-bg text-white font-semibold hover:scale-[1.02] transition-all shadow-lg shadow-[hsl(265_85%_58%)]/30"
              >
                <Save className="w-5 h-5" />
                Save All Settings
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-[hsl(265_85%_25%)] to-[hsl(280_80%_30%)] rounded-2xl p-6 text-white shadow-lg"
          >
            <h3 className="font-serif font-bold text-lg mb-2">Need Help?</h3>
            <p className="text-sm text-white/80 mb-4">
              Changes to categories won't affect existing votes. Disabling a category hides it from results but preserves data.
            </p>
            <a href="#" className="inline-flex items-center gap-1.5 text-sm font-medium text-[hsl(45_90%_65%)] hover:underline">
              View Documentation →
            </a>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;