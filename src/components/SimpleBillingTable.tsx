import React from 'react';

const SimpleBillingTable: React.FC<{ orgId: number }> = ({ orgId }) => {
  return (
    <div className="p-6 bg-zinc-900/50 backdrop-blur-sm rounded-lg border border-zinc-800">
      <h3 className="text-lg font-semibold text-white mb-4">Billing & Contracts (Org: {orgId})</h3>
      <div className="text-zinc-400">
        <p>Billing data will be displayed here.</p>
        <p className="text-sm mt-2">This is a simplified version to avoid React errors.</p>
      </div>
    </div>
  );
};

export default SimpleBillingTable;
