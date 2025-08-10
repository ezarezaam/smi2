import React from 'react';
import FinancialReports from '../components/Reports/FinancialReports';

const ReportsPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Laporan Keuangan</h1>
      <FinancialReports />
    </div>
  );
};

export default ReportsPage;
