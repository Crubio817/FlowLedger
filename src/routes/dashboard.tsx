import React from 'react';
import { PageTitleEditorial } from '../components/PageTitles.tsx';

const DashboardRoute: React.FC = () => {
  return (
    <div className="p-4" data-testid="dashboard-page">
      <PageTitleEditorial
        eyebrow="Overview"
        title="Dashboard"
        subtitle="Real-time insights and key metrics for your organization"
      />
      
      <div className="mt-8">
        Dashboard content coming soon...
      </div>
    </div>
  );
};

export default DashboardRoute;
