import React from 'react';
import TransparentAuroraHeader from './TransparentAuroraHeader.tsx';
import { useEffect, useState } from 'react';

interface StandardHeaderProps {
  title: string;
  subtitle?: string;
  color?: 'cyan' | 'purple' | 'amber' | 'emerald' | 'pink' | 'blue' | 'teal' | 'indigo' | 'violet' | 'red' | 'lime' | 'orange';
  variant?: 'default' | 'compact' | 'comfortable';
}

export const StandardHeader: React.FC<StandardHeaderProps> = ({
  title,
  subtitle,
  color = 'cyan', // Default to cyan as you requested
  variant = 'default'
}) => {
  // Use brighter ethereal aurora colors for more prominent glow
  const headerColors = {
    cyan: { sweep: 'rgba(6,182,212,0.50)', aurora1: 'rgba(14,165,233,0.30)', aurora2: 'rgba(56,189,248,0.25)' },
    purple: { sweep: 'rgba(147,51,234,0.50)', aurora1: 'rgba(124,58,237,0.30)', aurora2: 'rgba(196,181,253,0.25)' },
    amber: { sweep: 'rgba(245,158,11,0.50)', aurora1: 'rgba(217,119,6,0.30)', aurora2: 'rgba(252,211,77,0.25)' },
    emerald: { sweep: 'rgba(5,150,105,0.50)', aurora1: 'rgba(16,185,129,0.30)', aurora2: 'rgba(110,231,183,0.25)' },
    pink: { sweep: 'rgba(219,39,119,0.50)', aurora1: 'rgba(190,24,93,0.30)', aurora2: 'rgba(251,182,206,0.25)' },
    blue: { sweep: 'rgba(37,99,235,0.50)', aurora1: 'rgba(29,78,216,0.30)', aurora2: 'rgba(147,197,253,0.25)' },
    teal: { sweep: 'rgba(13,148,136,0.50)', aurora1: 'rgba(15,118,110,0.30)', aurora2: 'rgba(153,246,228,0.25)' },
    indigo: { sweep: 'rgba(79,70,229,0.50)', aurora1: 'rgba(67,56,202,0.30)', aurora2: 'rgba(199,210,254,0.25)' },
    violet: { sweep: 'rgba(124,58,237,0.50)', aurora1: 'rgba(109,40,217,0.30)', aurora2: 'rgba(221,214,254,0.25)' },
    red: { sweep: 'rgba(220,38,38,0.50)', aurora1: 'rgba(185,28,28,0.30)', aurora2: 'rgba(252,165,165,0.25)' },
    lime: { sweep: 'rgba(101,163,13,0.50)', aurora1: 'rgba(77,124,15,0.30)', aurora2: 'rgba(217,249,157,0.25)' },
    orange: { sweep: 'rgba(234,88,12,0.50)', aurora1: 'rgba(194,65,12,0.30)', aurora2: 'rgba(253,186,116,0.25)' }
  };

  // Map variants to header density. Previously, 'comfortable' mapped to 'cozy',
  // which limited our ability to raise the header height. Map it directly to
  // 'comfortable' so routes can opt into a taller header for better alignment
  // with the sidebar branding row.
  const densitySettings = {
    default: 'compact' as const,
    compact: 'compact' as const,
    comfortable: 'compact' as const, // Make comfortable use compact for smaller headers
  };

  // Track sidebar (collapsed rail vs expanded) by measuring body width offset from content.
  const [sidebarState, setSidebarState] = useState<'collapsed' | 'expanded'>('collapsed');

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      // Sidebar widths used: collapsed ~80px (w-20), expanded ~256px (w-64)
      const sidebarEl = document.querySelector('#mobile-sidebar');
      if (sidebarEl) {
        const w = (sidebarEl as HTMLElement).offsetWidth;
        setSidebarState(w > 120 ? 'expanded' : 'collapsed');
      }
    });
    const el = document.querySelector('#mobile-sidebar');
    if (el) observer.observe(el as Element);
    return () => observer.disconnect();
  }, []);

  // Dynamic left padding that interpolates between collapsed and expanded.
  const baseClasses = 'px-3 sm:px-4 pr-4 md:pr-8 flex items-center justify-start text-left';
  // Adjusted further left per request
  const collapsedPad = 'md:pl-6 lg:pl-8 xl:pl-40 xl:-ml-4';
  const expandedPad = 'md:pl-16 lg:pl-24 xl:pl-[18rem] xl:-ml-1';

  const contentClassName = `${baseClasses} ${sidebarState === 'expanded' ? expandedPad : collapsedPad} transition-[padding,margin] duration-300 ease-out`;

  return (
    <TransparentAuroraHeader
      title={title}
      subtitle={subtitle || ''}
      density={densitySettings[variant]}
      fullBleed
      bleedTop={true}
      fadeBottom={true}
      maxWidthClass="max-w-none"
      contentClassName={contentClassName}
      titleClassName="aurora-title text-2xl md:text-3xl font-bold tracking-tight text-white mb-1"
      subtitleClassName="text-sm md:text-base leading-relaxed text-white/60 max-w-2xl"
      fadeHeight={40}
      auroraOffset="-50%"
      colors={headerColors[color]}
    />
  );
};

export default StandardHeader;
