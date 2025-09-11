import React from 'react';
import StandardHeader from '../components/StandardHeader.tsx';

const CommsRoute: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#101010] text-white">
      <StandardHeader
        title="Communications Hub"
        subtitle="Manage communication threads, templates, and search"
        color="emerald"
        variant="default"
      />
      
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-zinc-900/50 backdrop-blur-sm rounded-lg border border-zinc-800">
            <h3 className="text-lg font-semibold text-white mb-4">Threads</h3>
            <p className="text-zinc-400">Communication threads will be displayed here.</p>
          </div>
          
          <div className="p-6 bg-zinc-900/50 backdrop-blur-sm rounded-lg border border-zinc-800">
            <h3 className="text-lg font-semibold text-white mb-4">Templates</h3>
            <p className="text-zinc-400">Communication templates will be displayed here.</p>
          </div>
          
          <div className="p-6 bg-zinc-900/50 backdrop-blur-sm rounded-lg border border-zinc-800">
            <h3 className="text-lg font-semibold text-white mb-4">Search</h3>
            <p className="text-zinc-400">Search functionality will be displayed here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommsRoute;
