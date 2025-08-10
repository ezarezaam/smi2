import React from 'react';
import SalesTransaction from '../components/Sales/SalesTransaction';

const SalesPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Transaksi Penjualan</h1>
      <SalesTransaction />
    </div>
  );
};

export default SalesPage;
