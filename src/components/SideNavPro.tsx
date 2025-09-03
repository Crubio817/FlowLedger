import React from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users2, Workflow, StickyNote, BookMarked } from 'lucide-react';
import logoPng from '../assets/logo.png';

export const SideNavPro: React.FC = () => {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = React.useState(true);
  const item = (to: string, label: string, icon: React.ReactNode) => (
    <MenuItem icon={icon} active={pathname === to}>
      <NavLink to={to}>{label}</NavLink>
    </MenuItem>
  );
  return (
    <div style={{height:'100vh', background:'#0b0b0c', color:'#f5f6f7', borderRight:'1px solid rgba(255,255,255,0.08)'}}>
      <div style={{ padding: '12px 12px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <img src={logoPng} alt="FlowLedger" style={{ width: 28, height: 28, borderRadius: 6 }} />
          {!collapsed && <span style={{ fontWeight: 600 }}>FlowLedger</span>}
        </div>
        {!collapsed && (
          <button className="collapse-btn" onClick={()=>setCollapsed(true)} aria-label="Collapse" style={{ marginLeft: 'auto' }}>❮</button>
        )}
        {collapsed && (
          <button className="collapse-btn" onClick={()=>setCollapsed(false)} aria-label="Expand">❯</button>
        )}
      </div>
      <div>
        <Sidebar collapsed={collapsed} rootStyles={{
          height: 'calc(100vh - 64px)',
          borderRight: 'none',
          background: '#0b0b0c',
        }}>
        <Menu>
          {item('/dashboard', 'Dashboard', <LayoutDashboard size={18} />)}
          {item('/clients', 'Clients', <Users2 size={18} />)}
          {item('/clients/engagements', 'Projects', <Workflow size={18} />)}
          {item('/clients/onboarding', 'Onboarding', <BookMarked size={18} />)}
          {item('/sipoc', 'SIPOC', <BookMarked size={18} />)}
          {item('/process-maps', 'Process Maps', <Workflow size={18} />)}
          {item('/findings', 'Findings', <StickyNote size={18} />)}
        </Menu>
        </Sidebar>
      </div>
      <div style={{ textAlign: 'center', padding: 8, fontSize: 12, opacity: .7 }}>v1.0</div>
    </div>
  );
};
