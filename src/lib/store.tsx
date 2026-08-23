import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Candidate, VotingEvent, AdminUser, VotingSettings } from './types';
import { DEFAULT_CATEGORIES } from './types';
import { toast } from 'react-toastify';

interface StoreContextType {
  candidates: Candidate[];
  activeEvent: VotingEvent | null;
  admin: AdminUser | null;
  settings: VotingSettings;
  createEvent: (event: VotingEvent, candidates: Omit<Candidate, 'id' | 'votes'>[]) => void;
  addCandidate: (candidate: Omit<Candidate, 'id' | 'votes'>) => void;
  updateCandidate: (id: string, c: Partial<Candidate>) => void;
  deleteCandidate: (id: string) => void;
  updateSettings: (settings: Partial<VotingSettings>) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  totalVotes: number;
  resetEvent: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const defaultSettings: VotingSettings = {
  enabledCategories: DEFAULT_CATEGORIES,
  votingEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  votingActive: true,
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [activeEvent, setActiveEvent] = useState<VotingEvent | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [settings, setSettings] = useState<VotingSettings>(defaultSettings);

  const createEvent = useCallback((event: VotingEvent, newCandidates: Omit<Candidate, 'id' | 'votes'>[]) => {
    setActiveEvent(event);
    const candidatesWithIds = newCandidates.map((c, i) => ({
      ...c,
      id: `c-${Date.now()}-${i}`,
      votes: 0
    }));
    setCandidates(candidatesWithIds);
    toast.success('Event created successfully!');
  }, []);

  const addCandidate = useCallback((candidate: Omit<Candidate, 'id' | 'votes'>) => {
    setCandidates(prev => [...prev, { ...candidate, id: `c-${Date.now()}`, votes: 0 }]);
    toast.success('Candidate added');
  }, []);

  const updateCandidate = useCallback((id: string, updates: Partial<Candidate>) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    toast.success('Candidate updated');
  }, []);

  const deleteCandidate = useCallback((id: string) => {
    setCandidates(prev => prev.filter(c => c.id !== id));
    toast.success('Candidate removed');
  }, []);

  const updateSettings = useCallback((updates: Partial<VotingSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    toast.success('Settings saved');
  }, []);

  const login = useCallback((email: string, password: string): boolean => {
    if (email && password.length >= 4) {
      setAdmin({ 
        email, 
        name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), 
        role: 'Administrator' 
      });
      toast.success('Welcome back, Administrator');
      return true;
    }
    toast.error('Invalid credentials');
    return false;
  }, []);

  const logout = useCallback(() => {
    setAdmin(null);
    toast.info('Logged out');
  }, []);

  const resetEvent = useCallback(() => {
    setActiveEvent(null);
    setCandidates([]);
    toast.info('Event reset');
  }, []);

  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

  return (
    <StoreContext.Provider value={{ 
      candidates, 
      activeEvent, 
      admin, 
      settings,
      createEvent, 
      addCandidate,
      updateCandidate, 
      deleteCandidate, 
      updateSettings,
      login, 
      logout, 
      totalVotes,
      resetEvent
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};