import React, { Suspense, lazy, StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AppLayout } from './app.tsx';
import { Toaster } from 'react-hot-toast';
// ThemeProvider/CssBaseline removed to avoid MUI/MD3 integration

const DashboardRoute = lazy(()=> import('./routes/dashboard.tsx'));
const ClientsRoute = lazy(()=> import('./routes/clients.tsx'));
const SipocRoute = lazy(()=> import('./routes/sipoc.tsx'));
const ClientsEngagementsRoute = lazy(()=> import('./routes/clients-engagements.tsx'));
const ClientsOnboardingRoute = lazy(()=> import('./routes/clients-onboarding.tsx'));
const EngagementDetailRoute = lazy(()=> import('./routes/engagement-detail.tsx'));
const InterviewsRoute = lazy(()=> import('./routes/interviews.tsx'));
const InterviewQARoute = lazy(()=> import('./routes/interview-qa.tsx'));
const ClientProfileRoute = lazy(()=> import('./routes/client-profile.tsx'));
const ClientDocumentsRoute = lazy(()=> import('./routes/client-documents.tsx'));
const ProcessMapsRoute = lazy(()=> import('./routes/process-maps.tsx'));
const FindingsRoute = lazy(()=> import('./routes/findings.tsx'));
const TemplatesListRoute = lazy(()=> import('./routes/templates/index.tsx'));
const TemplateDetailRoute = lazy(()=> import('./routes/templates/detail.tsx'));
const TemplateStepsRoute = lazy(()=> import('./routes/templates/steps.tsx'));
const TemplateUsageRoute = lazy(()=> import('./routes/templates/usage.tsx'));
const AuditDetailRoute = lazy(()=> import('./routes/audit-detail.tsx'));
const AuditsListRoute = lazy(()=> import('./routes/audits/index.tsx'));
const FlowDemoRoute = lazy(()=> import('./routes/flow-demo.tsx'));
const TableDemoRoute = lazy(()=> import('./routes/table-demo.tsx'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><DashboardRoute /></Suspense> },
  { path: 'clients', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><ClientsRoute /></Suspense> },
      { path: 'sipoc', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><SipocRoute /></Suspense> },
      { path: 'clients/engagements', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><ClientsEngagementsRoute /></Suspense> },
      { path: 'clients/onboarding', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><ClientsOnboardingRoute /></Suspense> },
      { path: 'clients/engagements/:engagementId', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><EngagementDetailRoute /></Suspense> },
      { path: 'clients/:clientId', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><ClientProfileRoute /></Suspense> },
      { path: 'clients/:clientId/documents', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><ClientDocumentsRoute /></Suspense> },
      { path: 'interviews', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><InterviewsRoute /></Suspense> },
  { path: 'interview-qa', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><InterviewQARoute /></Suspense> },
  { path: 'process-maps', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><ProcessMapsRoute /></Suspense> },
      { path: 'findings', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><FindingsRoute /></Suspense> },
  { path: 'templates', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><TemplatesListRoute /></Suspense> },
  { path: 'templates/:pathId', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><TemplateDetailRoute /></Suspense> },
  { path: 'templates/:pathId/steps', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><TemplateStepsRoute /></Suspense> },
  { path: 'templates/:pathId/usage', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><TemplateUsageRoute /></Suspense> },
  { path: 'audits', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><AuditsListRoute /></Suspense> },
  { path: 'audits/:auditId', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><AuditDetailRoute /></Suspense> },
  { path: 'flow-demo', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><FlowDemoRoute /></Suspense> },
  { path: 'table-demo', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><TableDemoRoute /></Suspense> },
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
  </StrictMode>
);
