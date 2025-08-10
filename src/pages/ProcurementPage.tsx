import React from 'react';
import ProcurementManagement from '../components/Procurement/ProcurementManagement';

const ProcurementPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Pengeluaran</h1>
      <ProcurementManagement />
    </div>
  );
};

export default ProcurementPage;
