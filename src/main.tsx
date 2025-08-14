import React, { Suspense, lazy, StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AppLayout } from './app.tsx';
import { Toaster } from 'react-hot-toast';

const DashboardRoute = lazy(()=> import('./routes/dashboard.tsx'));
const ClientsRoute = lazy(()=> import('./routes/clients.tsx'));
const SipocRoute = lazy(()=> import('./routes/sipoc.tsx'));
const InterviewsRoute = lazy(()=> import('./routes/interviews.tsx'));
const InterviewQARoute = lazy(()=> import('./routes/interview-qa.tsx'));
const ProcessMapsRoute = lazy(()=> import('./routes/process-maps.tsx'));
const FindingsRoute = lazy(()=> import('./routes/findings.tsx'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><DashboardRoute /></Suspense> },
  { path: 'clients', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><ClientsRoute /></Suspense> },
      { path: 'sipoc', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><SipocRoute /></Suspense> },
      { path: 'interviews', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><InterviewsRoute /></Suspense> },
  { path: 'interview-qa', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><InterviewQARoute /></Suspense> },
  { path: 'process-maps', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><ProcessMapsRoute /></Suspense> },
      { path: 'findings', element: <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}><FindingsRoute /></Suspense> },
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
  </StrictMode>
);
