import React, { useState } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import ProductManagement from './components/Products/ProductManagement';
import ServiceManagement from './components/Services/ServiceManagement';
import SalesTransaction from './components/Sales/SalesTransaction';
import PaymentTracking from './components/Payments/PaymentTracking';
import FinancialReports from './components/Reports/FinancialReports';
import ProcurementManagement from './components/Procurement/ProcurementManagement';

type View = 'dashboard' | 'products' | 'services' | 'sales' | 'payments' | 'reports' | 'procurement';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <ProductManagement />;
      case 'services':
        return <ServiceManagement />;
      case 'sales':
        return <SalesTransaction />;
      case 'payments':
        return <PaymentTracking />;
      case 'reports':
        return <FinancialReports />;
      case 'procurement':
        return <ProcurementManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          currentView={currentView}
          setSidebarOpen={setSidebarOpen}
        />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          <div className="max-w-7xl mx-auto">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;