import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, AlertTriangle } from '../../components/icons';

const KPICards: React.FC = () => {
  const kpis = [
    {
      title: 'Total Penjualan Bulan Ini',
      value: 'Rp 45,750,000',
      change: '+12.5%',
      changeType: 'increase',
      icon: DollarSign,
      bgColor: 'bg-blue-500'
    },
    {
      title: 'Laba Bersih',
      value: 'Rp 18,300,000',
      change: '+8.2%',
      changeType: 'increase',
      icon: TrendingUp,
      bgColor: 'bg-green-500'
    },
    {
      title: 'Piutang Outstanding',
      value: 'Rp 12,450,000',
      change: '-5.3%',
      changeType: 'decrease',
      icon: Users,
      bgColor: 'bg-amber-500'
    },
    {
      title: 'Stok Menipis',
      value: '8 Produk',
      change: '+2',
      changeType: 'increase',
      icon: AlertTriangle,
      bgColor: 'bg-red-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${kpi.bgColor} rounded-md p-3`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{kpi.value}</p>
                  <p className={`ml-2 flex items-baseline text-sm font-semibold ${
                    kpi.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {kpi.changeType === 'increase' ? (
                      <TrendingUp className="h-4 w-4 flex-shrink-0 self-center mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 flex-shrink-0 self-center mr-1" />
                    )}
                    {kpi.change}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KPICards;