import React from 'react';

const SimpleClientsTable: React.FC = () => {
  return (
    <div className="p-6 bg-zinc-900/50 backdrop-blur-sm rounded-lg border border-zinc-800">
      <h3 className="text-lg font-semibold text-white mb-4">Clients Table</h3>
      <div className="text-zinc-400">
        <p>Client data will be displayed here.</p>
        <p className="text-sm mt-2">This is a simplified version to avoid React errors.</p>
      </div>
    </div>
  );
};

export default SimpleClientsTable;
