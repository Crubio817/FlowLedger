import React from 'react';
import { PageTitleEditorial } from '../components/PageTitles.tsx';
import ClientsAdvancedTable from '../components/ClientsAdvancedTable.tsx';

const ClientsRoute: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <PageTitleEditorial
        eyebrow="Client Management"
        title="Clients Overview"
        subtitle="Comprehensive view of all client relationships, engagements, and onboarding status"
      />
      
      <ClientsAdvancedTable />
    </div>
  );
};

export default ClientsRoute;
