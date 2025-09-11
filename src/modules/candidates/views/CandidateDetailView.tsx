/**
 * Example: Candidate Detail View with Memory Integration
 * Shows how to integrate the Memory Module into existing FlowLedger modules
 */

import React from 'react';
import { MemoryCard } from '../../memory/index.ts';
// This would be the existing candidate components
// import { CandidateForm, CandidateStatus } from '../components';

interface CandidateDetailViewProps {
  candidateId: number;
}

const CandidateDetailView: React.FC<CandidateDetailViewProps> = ({ candidateId }) => {
  // Existing candidate logic would go here
  // const { data: candidate } = useCandidateDetail(candidateId);
  
  return (
    <div className="candidate-detail-layout">
      {/* Main content area */}
      <main className="candidate-main-content flex-1 p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Candidate Details</h1>
        
        {/* Existing candidate form and details would go here */}
        <div className="space-y-6">
          <div className="panel bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Candidate Information</h2>
            {/* Candidate form fields */}
            <p className="text-zinc-400">Candidate form would go here...</p>
          </div>
          
          <div className="panel bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Status & Progress</h2>
            {/* Status tracking */}
            <p className="text-zinc-400">Status tracking would go here...</p>
          </div>
        </div>
      </main>
      
      {/* Memory sidebar - this is the new integration! */}
      <aside className="candidate-sidebar w-80 p-6 border-l border-zinc-800">
        <MemoryCard 
          entityType="candidate"
          entityId={candidateId}
          orgId={1}
          expandable={true}
          onAddNote={(content: string) => {
            // Could add custom logic here if needed
            console.log('Note added:', content);
          }}
        />
      </aside>
    </div>
  );
};

export default CandidateDetailView;
