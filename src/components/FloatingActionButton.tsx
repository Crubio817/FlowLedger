import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button.tsx';

interface FloatingActionButtonProps {
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}

export default function FloatingActionButton({ 
  onClick, 
  label, 
  icon = <Plus size={20} /> 
}: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 h-14 px-6 bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-500/25 border border-cyan-500/30 backdrop-blur-sm z-50 transition-all duration-200 hover:scale-105"
      size="lg"
    >
      {icon}
      <span className="ml-2 font-medium">{label}</span>
    </Button>
  );
}
