import React from 'react';
import { PageHeader } from '../components/PageHeader.tsx';

const ProcessMapRoute: React.FC = () => {
  return (
    <div>
      <PageHeader title="Process Map" subtitle="Upload or draw process flows and BPMN diagrams." />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-brand-blue-800 rounded-2xl p-4 min-h-[240px]">Upload (mock placeholder)</div>
        <div className="bg-brand-blue-800 rounded-2xl p-4 min-h-[240px]">Draw Canvas (lazy load later)</div>
      </div>
    </div>
  );
};
export default ProcessMapRoute;
