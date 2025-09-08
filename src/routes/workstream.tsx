// Workstream Module v2.1 - Route Definitions
// React Router configuration for workstream module

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TodayPanel from '../components/TodayPanel.tsx';
import SignalsPage from './workstream-signals.tsx';
import CandidatesPage from './workstream-candidates.tsx';
import PursuitsPage from './workstream-pursuits.tsx';

export default function WorkstreamRoutes() {
  return (
    <div className="min-h-screen bg-[#101010] text-white">
      <div className="p-6 space-y-6">
        <Routes>
          {/* Today Panel - Main dashboard */}
          <Route path="/today" element={<TodayPanel />} />
          
          {/* Signals Management */}
          <Route path="/signals" element={<SignalsPage />} />
          <Route path="/signals/:signalId" element={<div>Signal Detail (TODO)</div>} />
          <Route path="/signals/new" element={<div>Create Signal (TODO)</div>} />
          
          {/* Candidates Management */}
          <Route path="/candidates" element={<CandidatesPage />} />
          <Route path="/candidates/:candidateId" element={<div>Candidate Detail (TODO)</div>} />
          <Route path="/candidates/new" element={<div>Create Candidate (TODO)</div>} />
          
          {/* Pursuits Management */}
          <Route path="/pursuits" element={<PursuitsPage />} />
          <Route path="/pursuits/:pursuitId" element={<div>Pursuit Detail (TODO)</div>} />
          <Route path="/pursuits/new" element={<div>Create Pursuit (TODO)</div>} />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/workstream/today" replace />} />
          <Route path="*" element={<Navigate to="/workstream/today" replace />} />
        </Routes>
      </div>
    </div>
  );
}
