import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { SideNav } from './components/SideNav.tsx';
import { useAppStore } from './store/useAppStore.ts';
import './styles/theme.css';
import { Loading } from './components/Loading.tsx';
import { currentIsoUtc } from './utils/date.ts';

export const AppLayout: React.FC = () => {
  const init = useAppStore(s => s.init);
  const loading = useAppStore(s => s.loading);
  const error = useAppStore(s => s.error);
  const accent = useAppStore(s => s.accent);
  const theme = useAppStore(s => s.theme);
  useEffect(() => { init(); }, [init]);
  useEffect(() => {
    document.body.classList.toggle('accent-amber', accent === 'amber');
  }, [accent]);
  useEffect(() => {
    document.body.classList.toggle('theme-dark', theme === 'dark');
    document.body.classList.toggle('theme-light', theme === 'light');
  }, [theme]);
  return (
    <div className="app-shell">
      <SideNav />
      <div className="workspace">
        <main className="workspace-main pt-8">
          {loading && <Loading label="Initializing" />}
          {!loading && error && <div className="text-sm text-red-400" data-testid="error-state">{error}</div>}
          {!loading && !error && <Outlet />}
        </main>
        <footer className="px-6 py-6 text-xs text-[var(--text-2)]">© {new Date(currentIsoUtc()).getFullYear()} FlowLedger</footer>
      </div>
    </div>
  );
};
