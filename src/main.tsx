import React, { Suspense, lazy, StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AppLayout } from './app.tsx';
import { Toaster } from 'react-hot-toast';
// ThemeProvider/CssBaseline removed to avoid MUI/MD3 integration

const DashboardRoute = lazy(()=> import('./routes/dashboard.tsx'));
const ClientsRoute = lazy(()=> import('./routes/clients.tsx'));
const ClientFinderRoute = lazy(()=> import('./routes/client-finder.tsx'));
const ModuleSelectorRoute = lazy(()=> import('./routes/module-selector.tsx'));
const ModuleRoute = lazy(()=> import('./routes/module-route.tsx'));
const SipocRoute = lazy(()=> import('./routes/sipoc.tsx'));
const ClientsEngagementsRoute = lazy(()=> import('./routes/clients-engagements.tsx'));
const ClientsOnboardingRoute = lazy(()=> import('./routes/clients-onboarding.tsx'));
const OnboardingRoute = lazy(()=> import('./routes/onboarding.tsx'));
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
const SettingsRoute = lazy(()=> import('./routes/settings.tsx'));
const WorkstreamRoute = lazy(()=> import('./routes/workstream.tsx'));
const CommsThreadsRoute = lazy(()=> import('./routes/comms-threads.tsx'));
const CommsThreadDetailRoute = lazy(()=> import('./routes/comms-thread-detail.tsx'));
const CommsSearchRoute = lazy(()=> import('./routes/comms-search.tsx'));
const CommsTemplatesRoute = lazy(()=> import('./routes/comms-templates.tsx'));
const SettingsPrincipalsRoute = lazy(()=> import('./routes/settings-principals.tsx'));
const PeopleRoute = lazy(()=> import('./routes/people.tsx'));
const EngagementsRoute = lazy(()=> import('./routes/engagements.tsx'));
const BillingRoute = lazy(()=> import('./routes/billing.tsx'));
const AutomationRoute = lazy(()=> import('./routes/automation.tsx'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><DashboardRoute /></Suspense> },
  { path: 'clients', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><ClientsRoute /></Suspense> },
      { path: 'client-finder', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><ClientFinderRoute /></Suspense> },
      { path: 'modules', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><ModuleSelectorRoute /></Suspense> },
      { path: 'modules/:moduleKey', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><ModuleRoute /></Suspense> },
      { path: 'sipoc', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><SipocRoute /></Suspense> },
      { path: 'clients/engagements', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><ClientsEngagementsRoute /></Suspense> },
      { path: 'clients/onboarding', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><ClientsOnboardingRoute /></Suspense> },
      { path: 'onboarding', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><OnboardingRoute /></Suspense> },
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
  { path: 'settings', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><SettingsRoute /></Suspense> },
  { path: 'settings/principals', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><SettingsPrincipalsRoute /></Suspense> },
  { path: 'comms/threads', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><CommsThreadsRoute /></Suspense> },
  { path: 'comms/threads/:threadId', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><CommsThreadDetailRoute /></Suspense> },
  { path: 'comms/search', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><CommsSearchRoute /></Suspense> },
  { path: 'comms/templates', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><CommsTemplatesRoute /></Suspense> },
  { path: 'people', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><PeopleRoute /></Suspense> },
  { path: 'engagements', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><EngagementsRoute /></Suspense> },
  { path: 'billing', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><BillingRoute /></Suspense> },
  { path: 'automation', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><AutomationRoute /></Suspense> },
  { path: 'flow-demo', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><FlowDemoRoute /></Suspense> },
  { path: 'table-demo', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><TableDemoRoute /></Suspense> },
  { path: 'workstream/*', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><WorkstreamRoute /></Suspense> },
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
  </StrictMode>
);
