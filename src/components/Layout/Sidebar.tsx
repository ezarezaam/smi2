import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  CreditCard, 
  Settings,
  X,
  Users,
  Building,
  ChevronDown,
  ChevronRight,
  Calculator,
  Boxes
} from '../icons';

interface SubMenuItem {
  id: string;
  path: string;
  label: string;
  icon?: React.ElementType;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path?: string;
  submenu?: SubMenuItem[];
  isOpen?: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const [menuState, setMenuState] = useState<{[key: string]: boolean}>({});
  
  const toggleSubmenu = (id: string) => {
    setMenuState(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const menuItems: MenuItem[] = [
    { id: 'dashboard', path: '/', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'vendor',
      label: 'Vendor',
      icon: Building,
      submenu: [
        { id: 'daftar-vendor', path: '/vendors', label: 'Daftar vendor' },
        { id: 'purchase-order', path: '/purchase-order', label: 'Purchase order' },
        { id: 'bills', path: '/bills', label: 'Bills' },
        { id: 'refunds', path: '/refunds', label: 'Refunds' },
        { id: 'vendor-payment', path: '/vendor-invoice', label: 'Payment' },
      ]
    },
    {
      id: 'customer',
      label: 'Customer',
      icon: Users,
      submenu: [
        { id: 'daftar-customer', path: '/customers', label: 'Daftar Customers' },
        { id: 'sales-order', path: '/sales-order', label: 'Sales Order' },
        { id: 'credit-note', path: '/credit-note', label: 'Credit note' },
        { id: 'invoice', path: '/customer-invoice', label: 'Invoice' },
        { id: 'customer-payment', path: '/customer-payment', label: 'Payment' },
      ]
    },
    {
      id: 'product-service',
      label: 'Product & service',
      icon: Package,
      submenu: [
        { id: 'product', path: '/products', label: 'Product' },
        { id: 'service', path: '/services', label: 'Service' },
      ]
    },
    {
      id: 'payment-other',
      label: 'Payment other',
      icon: CreditCard,
      submenu: [
        { id: 'expenses', path: '/expenses', label: 'Expenses' },
        { id: 'salaries', path: '/salaries', label: 'Salaries' },
        { id: 'loan', path: '/loan', label: 'Loan' },
      ]
    },
    {
      id: 'accounting',
      label: 'Accounting',
      icon: Calculator,
      submenu: [
        { id: 'journal-entries', path: '/journal-entries', label: 'Journal Entries' },
        { id: 'journal-items', path: '/journal-items', label: 'Journal items' },
        { id: 'general-ledger', path: '/general-ledger', label: 'General Ledger' },
        { id: 'reporting', path: '/reports', label: 'Reporting' },
      ]
    },
    {
      id: 'setting',
      label: 'Setting',
      icon: Settings,
      submenu: [
        { id: 'settings-uom', path: '/settings/uom', label: 'Unit of Measurement' },
        { id: 'settings-other-expense', path: '/settings/other-expense', label: 'Pengeluaran Lain' },
        { id: 'settings-coa', path: '/settings/chart-of-accounts', label: 'Chart of Accounts' },
        { id: 'divisions', path: '/divisions', label: 'Divisi' },
        { id: 'jabatan', path: '/jabatan', label: 'Jabatan' },
      ]
    },
    {
      id: 'user',
      label: 'User',
      icon: Users,
      submenu: [
        { id: 'employee', path: '/employee', label: 'Employee' },
      ]
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Senior Milenial Ind</h1>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isSubmenuOpen = menuState[item.id] || false;
              
              // Check if current path matches this menu item or any of its submenu items
              const isActive = item.path === location.pathname || 
                (item.path === '/' && location.pathname === '/') ||
                (hasSubmenu && item.submenu?.some(subItem => subItem.path === location.pathname));
              
              return (
                <div key={item.id}>
                  {hasSubmenu ? (
                    <div 
                      onClick={() => toggleSubmenu(item.id)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors
                        ${isActive 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <div className="flex items-center">
                        <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                        {item.label}
                      </div>
                      {isSubmenuOpen ? 
                        <ChevronDown className="h-4 w-4 text-gray-400" /> : 
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      }
                    </div>
                  ) : (
                    <Link
                      to={item.path || '/'}
                      onClick={() => setIsOpen(false)}
                      className={`
                        w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                        ${isActive 
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                      {item.label}
                    </Link>
                  )}
                  
                  {/* Submenu */}
                  {hasSubmenu && isSubmenuOpen && (
                    <div className="pl-10 mt-1 space-y-1">
                      {item.submenu?.map(subItem => {
                        const isSubActive = location.pathname === subItem.path;
                        return (
                          <Link
                            key={subItem.id}
                            to={subItem.path}
                            onClick={() => setIsOpen(false)}
                            className={`
                              w-full flex items-center px-3 py-2 text-xs font-medium rounded-md transition-colors
                              ${isSubActive 
                                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }
                            `}
                          >
                            {subItem.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
        
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">admin@umkm.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;