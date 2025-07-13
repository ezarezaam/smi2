import React from 'react';
import { AlertTriangle, Package } from 'lucide-react';

const StockAlerts: React.FC = () => {
  const alerts = [
    {
      id: 1,
      product: 'Server Dell PowerEdge R740',
      currentStock: 2,
      minStock: 5,
      category: 'Hardware',
      priority: 'high'
    },
    {
      id: 2,
      product: 'Lisensi Windows Server 2022',
      currentStock: 3,
      minStock: 10,
      category: 'Software',
      priority: 'medium'
    },
    {
      id: 3,
      product: 'Cisco Switch 48-Port',
      currentStock: 12,
      minStock: 20,
      category: 'Networking',
      priority: 'medium'
    },
    {
      id: 4,
      product: 'SSD Samsung 1TB NVMe',
      currentStock: 2,
      minStock: 25,
      category: 'Storage',
      priority: 'high'
    }
  ];

  const getPriorityColor = (priority: string) => {
    return priority === 'high' ? 'text-red-600' : 'text-yellow-600';
  };

  const getPriorityBg = (priority: string) => {
    return priority === 'high' ? 'bg-red-50' : 'bg-yellow-50';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Alert Stok Menipis</h3>
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          Kelola Stok
        </button>
      </div>
      
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
            alert.priority === 'high' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <AlertTriangle className={`h-5 w-5 mt-0.5 ${getPriorityColor(alert.priority)}`} />
                <div>
                  <p className="font-medium text-gray-900">{alert.product}</p>
                  <p className="text-sm text-gray-500">{alert.category}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm">
                      <span className={`font-semibold ${getPriorityColor(alert.priority)}`}>
                        Stok: {alert.currentStock}
                      </span>
                    </span>
                    <span className="text-sm text-gray-500">
                      Min: {alert.minStock}
                    </span>
                  </div>
                </div>
              </div>
              
              <button className="text-sm bg-white border border-gray-300 rounded-md px-3 py-1 hover:bg-gray-50 transition-colors">
                Restock
              </button>
            </div>
            
            <div className="mt-3">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    alert.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${Math.min((alert.currentStock / alert.minStock) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center">
          <Package className="h-5 w-5 text-blue-600 mr-2" />
          <span className="text-sm font-medium text-blue-900">
            8 produk membutuhkan restocking segera
          </span>
        </div>
      </div>
    </div>
  );
};

export default StockAlerts;