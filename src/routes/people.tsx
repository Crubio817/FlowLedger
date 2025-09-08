import React from 'react';
import PeopleAdvancedTableProduction from '../components/PeopleAdvancedTableProduction.tsx';
import { PageTitleEditorial } from '../components/PageTitles.tsx';

export default function PeopleRoute() {
  return (
    <div className="space-y-6">
      <PageTitleEditorial
        title="People Directory"
        subtitle="Production-ready staffing and resource management with AI recommendations"
      />
      <PeopleAdvancedTableProduction />
    </div>
  );
}
