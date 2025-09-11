import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
// Use the custom matte sidebar (more consistent with our theme)
import CollapsibleSidebar from './components/collapsible-sidebar.tsx';
import { GlobalModuleLauncher } from './components/GlobalModuleLauncher.tsx';
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
  const location = useLocation();

  // Workstream pages should have a perfectly flush header (no workspace top padding)
  const flushHeader = location.pathname.startsWith('/workstream');
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
      <CollapsibleSidebar />
      <GlobalModuleLauncher />
      <div
        className="workspace"
        style={{
          backgroundColor: '#101010',
        }}
      >
  <main className={`workspace-main ${flushHeader ? 'flush-header' : ''}`}>
          {loading && <Loading label="Initializing" />}
          {!loading && error && <div className="text-sm text-red-400" data-testid="error-state">{error}</div>}
          {!loading && !error && <Outlet />}
        </main>
  {/* Footer removed per request */}
      </div>
    </div>
  );
};
