import React from 'react';
import PeopleAdvancedTableProduction from '../components/PeopleAdvancedTableProduction.tsx';
import { PageTitleEditorial } from '../components/PageTitles.tsx';
import StandardHeader from '../components/StandardHeader.tsx';

export default function PeopleRoute() {
  return (
    <div>
      <StandardHeader
        title="People Directory"
        subtitle="Production-ready staffing and resource management with AI recommendations"
        color="emerald"
      />
      <div className="p-6">
        <PeopleAdvancedTableProduction />
      </div>
    </div>
  );
}
