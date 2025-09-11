import React from 'react';
import { PageTitleEditorial } from '../components/PageTitles.tsx';
import StandardHeader from '../components/StandardHeader.tsx';
import SimpleClientsTable from '../components/SimpleClientsTable.tsx';

const ClientsRoute: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#101010] text-white">
      {/* Standardized Header */}
      <StandardHeader
        title="Clients Overview"
        subtitle="Comprehensive view of all client relationships, engagements, and onboarding status"
        color="emerald"
        variant="comfortable"
      />
      
      <div className="p-6 space-y-6">
        <SimpleClientsTable />
      </div>
    </div>
  );
};

export default ClientsRoute;
