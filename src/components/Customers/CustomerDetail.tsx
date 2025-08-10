import React, { useState, useEffect } from 'react';
import { ArrowLeft } from '../icons';
import { ContactService } from '../../services/ContactService';
import { Contact } from '../../models/Contact';
import { formatDate } from '../../utils/format';

interface CustomerDetailProps {
  customerId: string;
  onBack: () => void;
}

interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'cancelled';
  type: 'purchase' | 'payment' | 'refund';
}

// Tabs component and related subcomponents
interface TabsProps {
  children: React.ReactNode;
  defaultValue: string;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

interface TabsContentProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

// Create a context for tabs
const TabsContext = React.createContext<{
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}>({ activeTab: '', setActiveTab: () => {} });

const Tabs = ({ children, defaultValue, className = '' }: TabsProps) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue);
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={`tabs ${className}`}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ children, className = '' }: TabsListProps) => {
  return (
    <div className={`tabs-list flex border-b ${className}`}>
      {children}
    </div>
  );
};

const TabsTrigger = ({ children, value, className = '' }: TabsTriggerProps) => {
  const { activeTab, setActiveTab } = React.useContext(TabsContext);
  
  return (
    <button
      className={`px-4 py-2 font-medium text-sm ${
        activeTab === value
          ? 'text-blue-600 border-b-2 border-blue-600'
          : 'text-gray-500 hover:text-gray-700'
      } ${className}`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ children, value, className = '', ...props }: TabsContentProps) => {
  const { activeTab } = React.useContext(TabsContext);
  
  if (activeTab !== value) {
    return null;
  }
  
  return (
    <div className={`tabs-content ${className}`} {...props}>
      {children}
    </div>
  );
};

// Main CustomerDetail component
const CustomerDetail: React.FC<CustomerDetailProps> = ({ customerId, onBack }) => {
  const [customer, setCustomer] = useState<Contact | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCustomerData = async () => {
      setIsLoading(true);
      try {
        // Load customer details
        const { data: customerData, error: customerError } = await ContactService.getById(customerId);
        
        if (customerError) {
          setError(`Error loading customer: ${(customerError as any)?.message || 'Unknown error'}`);
          return;
        }
        
        if (customerData) {
          setCustomer(customerData);
        }
        
        // Load customer transactions (dummy data for now)
        // In a real app, you would fetch this from an API
        setTransactions([
          {
            id: '1',
            date: '2025-07-15',
            amount: 1500000,
            description: 'Purchase of office supplies',
            status: 'completed',
            type: 'purchase'
          },
          {
            id: '2',
            date: '2025-07-10',
            amount: 2000000,
            description: 'Monthly payment',
            status: 'completed',
            type: 'payment'
          },
          {
            id: '3',
            date: '2025-06-28',
            amount: 500000,
            description: 'Refund for damaged goods',
            status: 'completed',
            type: 'refund'
          },
          {
            id: '4',
            date: '2025-06-15',
            amount: 1200000,
            description: 'Purchase of electronics',
            status: 'pending',
            type: 'purchase'
          },
          {
            id: '5',
            date: '2025-06-05',
            amount: 800000,
            description: 'Partial payment',
            status: 'completed',
            type: 'payment'
          }
        ]);
      } catch (err) {
        setError(`An unexpected error occurred: ${(err as any)?.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCustomerData();
  }, [customerId]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold">Loading Customer Details...</h1>
        </div>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold">Error</h1>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Customer not found'}
        </div>
        <button
          onClick={onBack}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Get customer type label based on numeric ID
  const getCustomerTypeLabel = (typeId: number) => {
    switch(typeId) {
      case 1: return 'Customer';
      case 2: return 'Vendor';
      case 3: return 'Customer & Vendor';
      default: return 'Unknown';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold">{customer.name}</h1>
        <span className={`ml-4 px-2 py-1 text-xs font-medium rounded-full ${
          customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {customer.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
        </span>
      </div>
      
      <Tabs defaultValue="overview" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Information</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium">{customer.email || '-'}</p>
                  <p className="text-sm text-gray-500 mt-4">Phone</p>
                  <p className="text-sm font-medium">{customer.phone || '-'}</p>
                  <p className="text-sm text-gray-500 mt-4">Contact Person</p>
                  <p className="text-sm font-medium">{customer.contact_person || '-'}</p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Details</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="text-sm font-medium">{customer.category || '-'}</p>
                  <p className="text-sm text-gray-500 mt-4">Type</p>
                  <p className="text-sm font-medium">{getCustomerTypeLabel(customer.type)}</p>
                  <p className="text-sm text-gray-500 mt-4">Address</p>
                  <p className="text-sm font-medium">{customer.address || '-'}</p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Transaction Summary</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Total Transactions</p>
                  <p className="text-sm font-medium">{transactions.length}</p>
                  <p className="text-sm text-gray-500 mt-4">Last Transaction</p>
                  <p className="text-sm font-medium">
                    {transactions.length > 0 ? formatDate(transactions[0].date) : '-'}
                  </p>
                  <p className="text-sm text-gray-500 mt-4">Total Amount</p>
                  <p className="text-sm font-medium">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
                      transactions.reduce((sum, t) => sum + t.amount, 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <div className="p-6">
            {transactions.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No transaction records found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map(transaction => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.type === 'purchase' 
                              ? 'bg-blue-100 text-blue-800' 
                              : transaction.type === 'payment'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : transaction.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Customer Details Tab */}
        <TabsContent value="details">
          <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Customer ID</h4>
                <p className="mt-1 text-sm text-gray-900">{customer.id}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Name</h4>
                <p className="mt-1 text-sm text-gray-900">{customer.name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Contact Person</h4>
                <p className="mt-1 text-sm text-gray-900">{customer.contact_person || '-'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Email</h4>
                <p className="mt-1 text-sm text-gray-900">{customer.email || '-'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                <p className="mt-1 text-sm text-gray-900">{customer.phone || '-'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Address</h4>
                <p className="mt-1 text-sm text-gray-900">{customer.address || '-'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Category</h4>
                <p className="mt-1 text-sm text-gray-900">{customer.category || '-'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Type</h4>
                <p className="mt-1 text-sm text-gray-900">{getCustomerTypeLabel(customer.type)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Created At</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {customer.created_at ? formatDate(customer.created_at) : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDetail;
