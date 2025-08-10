import React, { useState, useEffect } from 'react';
import { SalesOrder } from '../../models/SalesOrder';
import { UOM } from '../../models/UOM';
import { UOMService } from '../../services/UOMService';
import { Customer } from '../../models/Customer';
import { ProductService } from '../../services/ProductService';
import { Product } from '../../models/Product';
import { SalesOrderService } from '../../services/SalesOrderService';
import { CustomerService } from '../../services/CustomerService';
import { toast } from 'react-hot-toast';

// Import the components we created
import SalesOrderList from './SalesOrderList';
import SalesOrderDetail from './SalesOrderDetail';
import SalesOrderForm from './SalesOrderForm';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const SalesManagementNew: React.FC = () => {
  // State for sales orders data
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for customers, products, and UOMs
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [uoms, setUOMs] = useState<UOM[]>([]);
  
  // State for selected sales order
  const [selectedSalesOrder, setSelectedSalesOrder] = useState<SalesOrder | null>(null);
  const [salesOrderToDelete, setSalesOrderToDelete] = useState<SalesOrder | null>(null);
  
  // State for UI modes
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'add' | 'edit'>('list');
  
  // State for modals
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);
  
  // Load data based on view mode
  useEffect(() => {
    if (viewMode === 'list') {
      loadSalesOrders();
    }
  }, [viewMode]);
  
  // Load all necessary data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load customers
      const { data: customersData, error: customersError } = await CustomerService.getAll();
      if (customersError) throw new Error('Failed to load customers');
      setCustomers(customersData || []);
      
      // Load products
      const { data: productsData, error: productsError } = await ProductService.getAll();
      if (productsError) throw new Error('Failed to load products');
      setProducts(productsData || []);
      
      // Load UOMs
      const { data: uomsData, error: uomsError } = await UOMService.getAll();
      if (uomsError) throw new Error('Failed to load units of measure');
      setUOMs(uomsData || []);
      
      // Load sales orders
      await loadSalesOrders();
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
      toast.error('Gagal memuat data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Load sales orders
  const loadSalesOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await SalesOrderService.getAll();
      if (error) throw new Error('Failed to load sales orders');
      setSalesOrders(data || []);
    } catch (err: any) {
      console.error('Error loading sales orders:', err);
      setError(err.message || 'Failed to load sales orders');
      toast.error('Gagal memuat sales order: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Reset form data with default values
  const resetFormData = async () => {
    // Generate a new sales order number
    const orderNumber = SalesOrderService.generateOrderNumber();
    
    return {
      order_number: orderNumber,
      customer_id: '',
      order_date: new Date().toISOString().split('T')[0],
      due_date: '',
      status: 'draft' as 'draft' | 'confirmed' | 'delivered' | 'cancelled',
      payment_status: 'unpaid' as 'unpaid' | 'partial' | 'paid',
      subtotal_amount: 0,
      tax_amount: 0,
      discount_amount: 0,
      total_amount: 0,
      notes: '',
      items: []
    };
  };
  
  // Handle add new sales order
  const handleAdd = async () => {
    const newFormData = await resetFormData();
    setSelectedSalesOrder(newFormData);
    setViewMode('add');
  };
  
  // Handle edit sales order
  const handleEditOrder = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await SalesOrderService.getById(id);
      if (error) throw new Error('Failed to load sales order details');
      if (!data) throw new Error('Sales order not found');
      
      setSelectedSalesOrder(data);
      setViewMode('edit');
    } catch (err: any) {
      console.error('Error loading sales order details:', err);
      setError(err.message || 'Failed to load sales order details');
      toast.error('Gagal memuat detail sales order: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle view sales order detail
  const handleViewDetail = async (salesOrder: SalesOrder) => {
    try {
      // Ambil data lengkap sales order termasuk items
      const { data, error } = await SalesOrderService.getById(salesOrder.id || '');
      
      if (error) {
        toast.error('Gagal memuat detail sales order: ' + error.message);
        return;
      }
      
      if (data) {
        console.log('Loaded sales order detail:', data);
        setSelectedSalesOrder(data);
        setViewMode('detail');
      } else {
        toast.error('Data sales order tidak ditemukan');
      }
    } catch (err: any) {
      console.error('Error loading sales order detail:', err);
      toast.error('Gagal memuat detail sales order');
    }
  };
  
  // Handle delete sales order
  const handleDelete = (salesOrder: SalesOrder) => {
    setSalesOrderToDelete(salesOrder);
    setShowDeleteModal(true);
  };
  
  // Confirm delete sales order
  const confirmDelete = async () => {
    if (!salesOrderToDelete || !salesOrderToDelete.id) return;
    
    setLoading(true);
    
    try {
      const { error } = await SalesOrderService.delete(salesOrderToDelete.id);
      if (error) throw new Error('Failed to delete sales order');
      
      // Refresh sales orders list
      await loadSalesOrders();
      
      toast.success('Sales order berhasil dihapus');
      setShowDeleteModal(false);
      setSalesOrderToDelete(null);
    } catch (err: any) {
      console.error('Error deleting sales order:', err);
      toast.error('Gagal menghapus sales order: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle back to list
  const handleBackToList = () => {
    setViewMode('list');
    setSelectedSalesOrder(null);
  };
  
  // Handle form submission
  const handleSubmit = async (salesOrder: SalesOrder) => {
    setLoading(true);
    
    try {
      let result;
      
      if (viewMode === 'add') {
        result = await SalesOrderService.create(salesOrder);
      } else {
        result = await SalesOrderService.update(salesOrder.id || '', salesOrder);
      }
      
      if (result.error) throw new Error(result.error.message || 'Failed to save sales order');
      
      toast.success(`Sales order berhasil ${viewMode === 'add' ? 'ditambahkan' : 'diperbarui'}`);
      
      // Refresh sales orders list and go back to list view
      await loadSalesOrders();
      handleBackToList();
    } catch (err: any) {
      console.error('Error saving sales order:', err);
      toast.error(`Gagal ${viewMode === 'add' ? 'menambahkan' : 'memperbarui'} sales order: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sales Order Management</h1>
        {viewMode === 'list' && (
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            <span>Create Sales Order</span>
          </button>
        )}
      </div>

      {/* Summary Cards - Only show in list view */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-md">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Sales Orders</p>
                <p className="text-2xl font-bold text-gray-900">{salesOrders.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-md">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Confirmed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {salesOrders.filter(so => so.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-md">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Delivery</p>
                <p className="text-2xl font-bold text-gray-900">
                  {salesOrders.filter(so => so.delivery_status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-md">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(salesOrders.reduce((sum, so) => sum + so.total_amount, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {viewMode === 'list' && (
        <SalesOrderList
          salesOrders={salesOrders}
          loading={loading}
          error={error}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterPaymentStatus={filterPaymentStatus}
          setFilterPaymentStatus={setFilterPaymentStatus}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          onAdd={handleAdd}
          onView={handleViewDetail}
          onEdit={handleEditOrder}
          onDelete={handleDelete}
        />
      )}
      
      {viewMode === 'detail' && selectedSalesOrder && (
        <SalesOrderDetail
          salesOrder={selectedSalesOrder}
          onBack={handleBackToList}
          onEdit={(id) => handleEditOrder(id)}
        />
      )}
      
      {(viewMode === 'add' || viewMode === 'edit') && selectedSalesOrder && (
        <SalesOrderForm
          salesOrder={selectedSalesOrder}
          customers={customers}
          products={products}
          uoms={uoms as any}
          isEditing={viewMode === 'edit'}
          onBack={handleBackToList}
          onSubmit={handleSubmit}
        />
      )}
      
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        title="Hapus Sales Order"
        message={`Apakah Anda yakin ingin menghapus sales order ${salesOrderToDelete?.order_number || ''}? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setSalesOrderToDelete(null);
        }}
      />
    </div>
  );
};

export default SalesManagementNew;
