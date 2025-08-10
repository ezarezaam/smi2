import React from 'react';
import SalesManagementNew from '../components/Sales/SalesManagementNew';

const SalesOrderPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Sales Order</h1>
      <SalesManagementNew />
    </div>
  );
};

export default SalesOrderPage;
