
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color, onClick }) => (
  <div
    onClick={onClick}
    className="flex flex-col items-center justify-center rounded-2xl px-7 py-6 min-w-[200px] cursor-pointer relative transition-all duration-150 hover:-translate-y-1 hover:shadow-[0_0_32px_0_#fff4,0_1px_8px_#fff6_inset]"
    style={{
      background: 'rgba(255,255,255,0.13)',
      boxShadow: '0 8px 32px 0 #0008, 0 1px 12px 0 #fff2 inset',
      backdropFilter: 'blur(18px)',
      border: '2px solid rgba(255,255,255,0.18)',
      color: '#fff',
      overflow: 'hidden',
    }}
  >
    {/* Accent bar */}
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '4px',
        background: 'linear-gradient(90deg, #e0e0e0 0%, #f8f8f8 20%, #bcbcbc 50%, #f8f8f8 80%, #e0e0e0 100%)',
        boxShadow: '0 1px 6px #fff6 inset, 0 1px 8px #aaa6 inset',
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
      }}
    />
    <div className="mb-2 text-4xl font-bold tracking-tight" style={{ letterSpacing: '-1px' }}>{value}</div>
    <div className="text-xs text-gray-300 font-medium uppercase tracking-wide">{label}</div>
  </div>
);

export default StatCard;
