import React from 'react';
import { Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import MeasuresPage from './pageMap';
import PageHeader from '../../../components/PageHeader';
import PageContent from '../../../components/PageContent';
import { ROUTES } from 'shared-config';

const MeasuresIndex = () => {
  const { acctID } = useParams();
  
  const breadcrumbs = [
    { title: 'Dashboard', href: ROUTES.DASHBOARD.path.replace(':acctID', acctID) },
    { title: 'Measure Units', href: ROUTES.MEASURES.path.replace(':acctID', acctID) }
  ];
  
  return (
    <Box>
      <PageHeader 
        title="Measure Units"
        subtitle="Manage your account's measurement units"
        breadcrumbs={breadcrumbs}
      />
      <PageContent>
        <MeasuresPage acctID={acctID} />
      </PageContent>
    </Box>
  );
};

export default MeasuresIndex;
