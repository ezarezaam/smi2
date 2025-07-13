import React from 'react';
import KPICards from './KPICards';
import SalesChart from './SalesChart';
import RecentTransactions from './RecentTransactions';
import StockAlerts from './StockAlerts';
import PaymentReminders from './PaymentReminders';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Bisnis IT</h1>
        <div className="text-sm text-gray-500">
          Terakhir update: {new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>
      
      <KPICards />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        <StockAlerts />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactions />
        <PaymentReminders />
      </div>
    </div>
  );
};

export default Dashboard;