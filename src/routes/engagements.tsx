import React from 'react';
import { PageTitleEditorial } from '../components/PageTitles.tsx';
import EngagementsAdvancedTableProduction from '../components/EngagementsAdvancedTableProduction.tsx';

export default function EngagementsRoute() {
  return (
    <div className="space-y-6">
      <PageTitleEditorial
        title="Engagements"
        subtitle="Production-ready project management system for tracking projects, audits, and jobs"
      />
      <EngagementsAdvancedTableProduction />
    </div>
  );
}
