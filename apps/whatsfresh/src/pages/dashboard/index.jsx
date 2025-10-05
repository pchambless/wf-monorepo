import React from 'react';
import DashboardView from './View';
import useDashboardPresenter from './Presenter';

const Dashboard = ({ onAccountDataReady }) => {
  const dashboardData = useDashboardPresenter();
  
  // Pass account data to parent if callback provided
  React.useEffect(() => {
    if (onAccountDataReady && dashboardData.currentAcctID) {
      onAccountDataReady({
        currentAcctID: dashboardData.currentAcctID,
        userAcctList: dashboardData.userAcctList,
        handleAccountChange: dashboardData.handleAccountChange,
        loading: dashboardData.accountsLoading
      });
    }
  }, [dashboardData.currentAcctID, dashboardData.userAcctList, dashboardData.handleAccountChange, dashboardData.accountsLoading, onAccountDataReady]);
  
  return <DashboardView {...dashboardData} />;
};

export default Dashboard;
