
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import { ToastContainer } from 'react-toastify';
import SettingsPage from './pages/SettingsPage';
import { UOMPage } from './pages/settings';
import MasterOtherExpensePage from './pages/settings/MasterOtherExpensePage';
import COAPage from './pages/settings/COAPage';

// Pages
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import ServicesPage from './pages/ServicesPage';
import InventoryPage from './pages/InventoryPage';
import SalesPage from './pages/SalesPage';
import SalesOrderPage from './pages/SalesOrderPage';
import PurchaseOrderPage from './pages/PurchaseOrderPage';
import ExpensesPage from './pages/ExpensesPage';
import CommercialProposalPage from './pages/CommercialProposalPage';
import PaymentsPage from './pages/PaymentsPage';
import ReportsPage from './pages/ReportsPage';
import ProcurementPage from './pages/ProcurementPage';
import VendorPage from './pages/VendorPage';
import CustomerPage from './pages/CustomerPage';
import EmployeePage from './pages/EmployeePage';
import DivisiPage from './pages/DivisiPage';
import JabatanPage from './pages/JabatanPage';
import BillsPage from './pages/BillsPage';
import RefundsPage from './pages/RefundsPage';
import VendorPaymentPage from './pages/VendorPaymentPage';
import PurchaseReceiptPage from './pages/PurchaseReceiptPage';
import CreditNotePage from './pages/CreditNotePage';
import CustomerInvoicePage from './pages/CustomerInvoicePage';
import CustomerPaymentPage from './pages/CustomerPaymentPage';
import DeliveryOrderPage from './pages/DeliveryOrderPage';
import SalariesPage from './pages/SalariesPage';
import LoanPage from './pages/LoanPage';
import JournalEntriesPage from './pages/JournalEntriesPage';
import JournalItemsPage from './pages/JournalItemsPage';
import GeneralLedgerPage from './pages/GeneralLedgerPage';

// Komponen untuk proteksi rute - DINONAKTIFKAN UNTUK DEVELOPMENT
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Bypass login check completely for development
  // Selalu return children tanpa cek login
  return <>{children}</>;
  
  /* Uncomment untuk mengaktifkan kembali proteksi rute
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
  */
};

function App() {
  return (
    <AuthProvider>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <BrowserRouter>
        <Routes>
          {/* Login page masih ada tapi tidak diakses secara default */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Redirect dari root ke dashboard langsung */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="vendors" element={<VendorPage />} />
            <Route path="customers" element={<CustomerPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="sales" element={<SalesPage />} />
            <Route path="purchase-order" element={<PurchaseOrderPage />} />
            <Route path="purchase-receipt" element={<PurchaseReceiptPage />} />
<Route path="expenses" element={<ExpensesPage />} />
            <Route path="sales-order" element={<SalesOrderPage />} />
            <Route path="proposals" element={<CommercialProposalPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="procurement" element={<ProcurementPage />} />
            <Route path="employees" element={<EmployeePage />} />
            <Route path="divisions" element={<DivisiPage />} />
            <Route path="jabatan" element={<JabatanPage />} />
            
            {/* Vendor Routes */}
            <Route path="bills" element={<BillsPage />} />
            <Route path="refunds" element={<RefundsPage />} />
            <Route path="vendor-payment" element={<VendorPaymentPage />} />
            
            {/* Customer Routes */}
            <Route path="delivery-order" element={<DeliveryOrderPage />} />
            <Route path="credit-note" element={<CreditNotePage />} />
            <Route path="customer-invoice" element={<CustomerInvoicePage />} />
            <Route path="customer-payment" element={<CustomerPaymentPage />} />
            
            {/* Payment Other Routes */}
            <Route path="salaries" element={<SalariesPage />} />
            <Route path="loan" element={<LoanPage />} />
            
            {/* Accounting Routes */}
            <Route path="journal-entries" element={<JournalEntriesPage />} />
            <Route path="journal-items" element={<JournalItemsPage />} />
            <Route path="general-ledger" element={<GeneralLedgerPage />} />
            
            {/* Settings Routes */}
            <Route path="settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/settings/general" replace />} />
              <Route path="general" element={<div>General Settings</div>} />
              <Route path="uom" element={<UOMPage />} />
              <Route path="other-expense" element={<MasterOtherExpensePage />} />
              <Route path="chart-of-accounts" element={<COAPage />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;