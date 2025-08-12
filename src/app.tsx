import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { NavBar } from './components/NavBar.tsx';
import { useAppStore } from './store/useAppStore.ts';
import './styles/theme.css';
import { Loading } from './components/Loading.tsx';
import { currentIsoUtc } from './utils/date.ts';

export const AppLayout: React.FC = () => {
  const init = useAppStore(s => s.init);
  const loading = useAppStore(s => s.loading);
  const error = useAppStore(s => s.error);
  const accent = useAppStore(s => s.accent);
  useEffect(() => { init(); }, [init]);
  useEffect(() => {
    document.body.classList.toggle('accent-amber', accent === 'amber');
  }, [accent]);
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
  <main className="flex-1 px-6 py-8 max-w-7xl w-full mx-auto">
  {loading && <Loading label="Initializing" />}
  {!loading && error && <div className="text-sm text-red-400" data-testid="error-state">{error}</div>}
  {!loading && !error && <Outlet />}
      </main>
  <footer className="text-center text-xs text-slate-600 py-6">© {new Date(currentIsoUtc()).getFullYear()} FlowLedger</footer>
    </div>
  );
};
