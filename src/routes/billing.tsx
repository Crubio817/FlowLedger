import React from 'react';
import SimpleBillingTable from '../components/SimpleBillingTable.tsx';
import { PageTitleEditorial } from '../components/PageTitles.tsx';
import StandardHeader from '../components/StandardHeader.tsx';

const BillingRoute: React.FC = () => {
  return (
    <>
      <StandardHeader 
        title="Billing & Contracts"
        subtitle="Manage contracts, time tracking, invoicing, and payments"
        color="emerald"
      />
      <SimpleBillingTable orgId={1} />
    </>
  );
};

export default BillingRoute;
