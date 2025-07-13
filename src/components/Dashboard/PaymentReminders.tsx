import React from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

const PaymentReminders: React.FC = () => {
  const reminders = [
    {
      id: 'INV-089',
      customer: 'PT Maju Sejahtera',
      amount: 4500000,
      dueDate: '2024-01-18',
      daysOverdue: 0,
      status: 'due_soon'
    },
    {
      id: 'INV-087',
      customer: 'CV Berkah Jaya',
      amount: 2300000,
      dueDate: '2024-01-16',
      daysOverdue: 2,
      status: 'overdue'
    },
    {
      id: 'INV-085',
      customer: 'UD Sinar Harapan',
      amount: 1800000,
      dueDate: '2024-01-20',
      daysOverdue: 0,
      status: 'upcoming'
    },
    {
      id: 'INV-082',
      customer: 'Toko Mitra Usaha',
      amount: 950000,
      dueDate: '2024-01-12',
      daysOverdue: 6,
      status: 'overdue'
    }
  ];

  const getStatusInfo = (status: string, daysOverdue: number) => {
    switch (status) {
      case 'overdue':
        return {
          color: 'text-red-600',
          bg: 'bg-red-50',
          icon: AlertCircle,
          label: `${daysOverdue} hari terlambat`
        };
      case 'due_soon':
        return {
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
          icon: Clock,
          label: 'Jatuh tempo hari ini'
        };
      case 'upcoming':
        return {
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          icon: Calendar,
          label: 'Jatuh tempo 2 hari'
        };
      default:
        return {
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          icon: Calendar,
          label: 'Normal'
        };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Reminder Pembayaran</h3>
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          Kirim Reminder
        </button>
      </div>
      
      <div className="space-y-4">
        {reminders.map((reminder) => {
          const statusInfo = getStatusInfo(reminder.status, reminder.daysOverdue);
          const Icon = statusInfo.icon;
          
          return (
            <div key={reminder.id} className={`p-4 rounded-lg border-l-4 ${
              reminder.status === 'overdue' ? 'border-red-500' : 
              reminder.status === 'due_soon' ? 'border-yellow-500' : 'border-blue-500'
            } ${statusInfo.bg}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <Icon className={`h-5 w-5 mt-0.5 ${statusInfo.color}`} />
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">{reminder.id}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{reminder.customer}</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      Rp {reminder.amount.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <button className="text-xs bg-white border border-gray-300 rounded-md px-2 py-1 hover:bg-gray-50 transition-colors">
                    WhatsApp
                  </button>
                  <button className="text-xs bg-white border border-gray-300 rounded-md px-2 py-1 hover:bg-gray-50 transition-colors">
                    Email
                  </button>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-500">
                Jatuh tempo: {new Date(reminder.dueDate).toLocaleDateString('id-ID')}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">
            Total Outstanding: Rp 9,550,000
          </span>
          <button className="text-sm bg-blue-600 text-white rounded-md px-3 py-1 hover:bg-blue-700 transition-colors">
            Kirim Semua Reminder
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentReminders;