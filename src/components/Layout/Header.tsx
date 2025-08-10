import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, LogOut } from '../icons';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const currentPath = location.pathname.substring(1) || 'dashboard';
  const getViewTitle = (view: string) => {
    const titles = {
      dashboard: 'Dashboard',
      products: 'Manajemen Produk',
      services: 'Manajemen Layanan',
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
            {getViewTitle(currentPath)}
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
          
          <button 
            onClick={async () => {
              const result = await logout();
              if (result.success) {
                navigate('/login');
              }
            }}
            className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md flex items-center"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
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