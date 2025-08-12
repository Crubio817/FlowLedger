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
  loadSipoc: (auditId: number) => Promise<void>;
  saveSipoc: (auditId: number, doc: SipocDoc) => Promise<void>;
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
      const [questions] = await Promise.all([
        api.getQuestionBank()
      ]);
      // Do not fetch SIPOC by default; require an explicit auditId from the page
      set({ questions, loading: false });
    } catch (e: any) {
      set({ error: e?.message || 'Unknown error', loading: false });
    }
  },
  toggleAccent: () => set(s => ({ accent: s.accent === 'mint' ? 'amber' : 'mint' })),
  setSipocVersion: (v: 'current' | 'future') => set({ sipocVersion: v }),
  loadSipoc: async (auditId: number) => {
    const doc = await api.getSipoc(auditId);
    set({ sipoc: doc });
  },
  saveSipoc: async (auditId: number, doc: SipocDoc) => {
    const saved = await api.putSipoc(auditId, doc);
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
