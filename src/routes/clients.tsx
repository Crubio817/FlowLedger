import React from 'react';
import { PageTitleEditorial } from '../components/PageTitles.tsx';
import ClientsAdvancedTable from '../components/ClientsAdvancedTable.tsx';

const ClientsRoute: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#101010] text-white">
      <div className="p-6 space-y-6">
        <PageTitleEditorial
          eyebrow="Client Management"
          title="Clients Overview"
          subtitle="Comprehensive view of all client relationships, engagements, and onboarding status"
        />
        
        <ClientsAdvancedTable />
      </div>
    </div>
  );
};

export default ClientsRoute;
