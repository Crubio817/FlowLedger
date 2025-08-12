import { create, StateCreator } from 'zustand';
import { DashboardStats, ActivityItem, SipocDoc, Interview, InterviewResponse, ProcessMap, Question } from './types.ts';
import * as api from '../services/api.ts';

interface AppState {
  loading: boolean;
  error?: string;
  accent: 'mint' | 'amber';
  dashboard?: DashboardStats;
  activity: ActivityItem[];
  sipocVersion: 'current' | 'future';
  sipoc?: SipocDoc;
  interviews: Interview[];
  interviewResponses: Record<number, InterviewResponse[]>;
  processMaps: ProcessMap[];
  questions: Question[];
  toasts: { id: number; message: string }[];
  init: () => Promise<void>;
  toggleAccent: () => void;
  setSipocVersion: (v: 'current' | 'future') => void;
  loadSipoc: () => Promise<void>;
  saveSipoc: (doc: SipocDoc) => Promise<void>;
  pushToast: (message: string) => void;
  addActivity: (item: Omit<ActivityItem,'id'|'timestamp'> & { title: string }) => void;
}

const creator: StateCreator<AppState> = (set, get) => ({
  loading: false,
  accent: 'mint',
  activity: [],
  interviews: [],
  interviewResponses: {},
  processMaps: [],
  questions: [],
  sipocVersion: 'current',
  toasts: [],
  init: async () => {
    set({ loading: true, error: undefined });
    try {
      const [sipoc, questions] = await Promise.all([
        api.getSipoc(101),
        api.getQuestionBank()
      ]);
      set({ sipoc, questions, loading: false });
    } catch (e: any) {
      set({ error: e?.message || 'Unknown error', loading: false });
    }
  },
  toggleAccent: () => set(s => ({ accent: s.accent === 'mint' ? 'amber' : 'mint' })),
  setSipocVersion: (v: 'current' | 'future') => set({ sipocVersion: v }),
  loadSipoc: async () => {
    const doc = await api.getSipoc(101);
    set({ sipoc: doc });
  },
  saveSipoc: async (doc: SipocDoc) => {
    const saved = await api.putSipoc(101, doc);
    set({ sipoc: saved });
    get().pushToast('SIPOC saved');
    get().addActivity({ title: 'Saved SIPOC', type: 'SIPOC', auditId: doc.audit_id });
  },
  pushToast: (message: string) => {
    const id = Date.now();
    set(s => ({ toasts: [...s.toasts, { id, message }] }));
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 3000);
  },
  addActivity: (item) => {
    set(s => ({ activity: [{ id: Date.now(), timestamp: new Date().toISOString(), ...item }, ...s.activity].slice(0,50) }));
  }
});

export const useAppStore = create<AppState>(creator);
