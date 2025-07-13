import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const RecentTransactions: React.FC = () => {
  const transactions = [
    {
      id: 'INV-001',
      type: 'sale',
      customer: 'PT Maju Bersama',
      amount: 2500000,
      status: 'lunas',
      date: '2024-01-15'
    },
    {
      id: 'INV-002',
      type: 'sale',
      customer: 'Toko Sinar Jaya',
      amount: 1800000,
      status: 'tempo',
      date: '2024-01-14'
    },
    {
      id: 'PO-001',
      type: 'purchase',
      customer: 'CV Supplier Indo',
      amount: 3200000,
      status: 'lunas',
      date: '2024-01-13'
    },
    {
      id: 'INV-003',
      type: 'sale',
      customer: 'UD Berkah Makmur',
      amount: 950000,
      status: 'lunas',
      date: '2024-01-12'
    }
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      lunas: 'bg-green-100 text-green-800',
      tempo: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      lunas: 'Lunas',
      tempo: 'Tempo',
      overdue: 'Jatuh Tempo'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Transaksi Terbaru</h3>
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          Lihat Semua
        </button>
      </div>
      
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${transaction.type === 'sale' ? 'bg-green-100' : 'bg-blue-100'}`}>
                {transaction.type === 'sale' ? (
                  <ArrowUpRight className={`h-4 w-4 ${transaction.type === 'sale' ? 'text-green-600' : 'text-blue-600'}`} />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-blue-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{transaction.id}</p>
                <p className="text-sm text-gray-500">{transaction.customer}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className={`font-semibold ${transaction.type === 'sale' ? 'text-green-600' : 'text-blue-600'}`}>
                {transaction.type === 'sale' ? '+' : '-'}Rp {transaction.amount.toLocaleString('id-ID')}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                {getStatusBadge(transaction.status)}
                <span className="text-xs text-gray-400">{transaction.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactions;