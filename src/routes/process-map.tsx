import React from 'react';
import { PageTitleEditorial } from '../components/PageTitles.tsx';

const ProcessMapRoute: React.FC = () => {
  return (
    <div>
      <PageTitleEditorial 
        eyebrow="Process Documentation"
        title="Process Map" 
        subtitle="Upload or draw process flows and BPMN diagrams for visual workflow analysis" 
      />
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="card rounded-2xl p-4 min-h-[240px]">Upload (mock placeholder)</div>
        <div className="card rounded-2xl p-4 min-h-[240px]">Draw Canvas (lazy load later)</div>
      </div>
    </div>
  );
};
export default ProcessMapRoute;
