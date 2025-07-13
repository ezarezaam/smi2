import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SalesChart: React.FC = () => {
  const data = [
    { name: 'Jan', penjualan: 35000000, profit: 14000000 },
    { name: 'Feb', penjualan: 42000000, profit: 16800000 },
    { name: 'Mar', penjualan: 38000000, profit: 15200000 },
    { name: 'Apr', penjualan: 45000000, profit: 18000000 },
    { name: 'Mei', penjualan: 48000000, profit: 19200000 },
    { name: 'Jun', penjualan: 45750000, profit: 18300000 },
  ];

  const formatCurrency = (value: number) => {
    return `Rp ${(value / 1000000).toFixed(0)}jt`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Tren Penjualan & Profit</h3>
        <select className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500">
          <option>6 Bulan Terakhir</option>
          <option>12 Bulan Terakhir</option>
          <option>Tahun Ini</option>
        </select>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Bar dataKey="penjualan" fill="#3B82F6" name="Penjualan" />
            <Bar dataKey="profit" fill="#10B981" name="Profit" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex items-center justify-center space-x-6 mt-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600">Penjualan</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600">Profit</span>
        </div>
      </div>
    </div>
  );
};

export default SalesChart;