import React, { useState } from 'react';
import { PageTitleEditorial } from '../components/PageTitles.tsx';
import OnboardingTasksAdvancedTable from '../components/OnboardingTasksAdvancedTable.tsx';

export default function OnboardingRoute() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-[#101010] text-white">
      <div className="p-6 space-y-6">
        <PageTitleEditorial
          eyebrow="Onboarding"
          title="Client Onboarding Tasks"
          subtitle="Manage and track client onboarding tasks across all projects"
        />
        
        <OnboardingTasksAdvancedTable 
          key={refreshKey}
          onCreateTask={() => {/* handled by floating action bar */}}
        />
      </div>
    </div>
  );
}