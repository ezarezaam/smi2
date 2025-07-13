import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setSidebarOpen }) => {
  const getViewTitle = (view: string) => {
    const titles = {
      dashboard: 'Dashboard',
      products: 'Manajemen Produk',
      sales: 'Transaksi Penjualan',
      payments: 'Tracking Pembayaran',
      reports: 'Laporan Keuangan',
      procurement: 'Manajemen Pembelian'
    };
    return titles[view as keyof typeof titles] || 'Dashboard';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <h2 className="ml-2 lg:ml-0 text-lg font-semibold text-gray-900">
            {getViewTitle(currentView)}
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden sm:block relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <button className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md">
            <Bell className="h-6 w-6" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">PT Senior Milenial Indonesia</p>
            <p className="text-xs text-gray-500">ID: SMI001</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;