import React from 'react';
import KPICards from '../components/Dashboard/KPICards';
import RecentTransactions from '../components/Dashboard/RecentTransactions';
import StockAlerts from '../components/Dashboard/StockAlerts';
import PaymentReminders from '../components/Dashboard/PaymentReminders';

const DashboardPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h1>
      
      <KPICards />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <RecentTransactions />
        <div className="space-y-6">
          <StockAlerts />
          <PaymentReminders />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
