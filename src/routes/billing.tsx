import React from 'react';
import BillingAdvancedTableProduction from '../components/BillingAdvancedTableProduction.tsx';
import { PageTitleEditorial } from '../components/PageTitles.tsx';

const BillingRoute: React.FC = () => {
  return (
    <>
      <PageTitleEditorial 
        title="Billing & Contracts"
        subtitle="Manage contracts, time tracking, invoicing, and payments"
      />
      <BillingAdvancedTableProduction orgId={1} />
    </>
  );
};

export default BillingRoute;
