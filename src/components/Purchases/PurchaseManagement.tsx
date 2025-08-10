import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Package, Truck, FileText, CreditCard } from '../icons';
import { PurchaseOrder, PURCHASE_ORDER_STATUS, PAYMENT_STATUS } from '../../models/PurchaseOrder';
import { PurchaseOrderService } from '../../services/PurchaseOrderService';
import { ContactService } from '../../services/ContactService';
import { ProductService } from '../../services/ProductService';
import { UOMService } from '../../services/UOMService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { toast } from 'react-hot-toast';
import PurchaseOrderForm from './PurchaseOrderForm';
import PurchaseOrderDetail from './PurchaseOrderDetail';

const PurchaseManagement: React.FC = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [uoms, setUOMs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'add' | 'edit' | 'detail'>('list');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load purchase orders
      const { data: poData, error: poError } = await PurchaseOrderService.getAll();
      if (poError) throw poError;
      setPurchaseOrders(poData || []);

      // Load vendors (contacts with type 2 or 3)
      const { data: contactData, error: contactError } = await ContactService.getAll();
      if (contactError) throw contactError;
      const vendorData = (contactData || []).filter(c => c.type === 2 || c.type === 3);
      setVendors(vendorData);

      // Load products
      const { data: productData, error: productError } = await ProductService.getAll();
      if (productError) throw productError;
      setProducts(productData || []);

      // Load UOMs
      const { data: uomData, error: uomError } = await UOMService.getAll();
      if (uomError) throw uomError;
      setUOMs(uomData || []);

    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Gagal memuat data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = po.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         po.contact?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAdd = () => {
    setSelectedPO({
      order_number: PurchaseOrderService.generateOrderNumber(),
      contacts_id: '',
      total_amount: 0,
      status: 'draft',
      order_date: new Date().toISOString().split('T')[0],
      payment_status: 'unpaid',
      received_status: 'pending',
      billed_status: 'not_billed',
      paid_status: 'unpaid',
      items: []
    });
    setViewMode('add');
  };

  const handleEdit = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setViewMode('edit');
  };

  const handleView = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setViewMode('detail');
  };

  const handleSubmit = async (poData: PurchaseOrder) => {
    try {
      setIsLoading(true);
      let result;
      
      if (viewMode === 'add') {
        result = await PurchaseOrderService.create(poData);
      } else {
        result = await PurchaseOrderService.update(selectedPO?.id || '', poData);
      }
      
      if (result.error) throw result.error;
      
      toast.success(`Purchase Order berhasil ${viewMode === 'add' ? 'ditambahkan' : 'diperbarui'}`);
      setViewMode('list');
      loadData();
    } catch (error: any) {
      toast.error('Gagal menyimpan PO: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus PO ini?')) return;
    
    try {
      const { error } = await PurchaseOrderService.delete(id);
      if (error) throw error;
      
      toast.success('Purchase Order berhasil dihapus');
      loadData();
    } catch (error: any) {
      toast.error('Gagal menghapus PO: ' + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'ordered': return 'bg-blue-100 text-blue-800';
      case 'received': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWorkflowStatusColor = (status: string) => {
    switch (status) {
      case 'pending': case 'not_billed': case 'unpaid': return 'bg-yellow-100 text-yellow-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      case 'completed': case 'fully_billed': case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (viewMode === 'add' || viewMode === 'edit') {
    return (
      <PurchaseOrderForm
        purchaseOrder={selectedPO!}
        vendors={vendors}
        products={products}
        uoms={uoms}
        isEditing={viewMode === 'edit'}
        onBack={() => setViewMode('list')}
        onSubmit={handleSubmit}
      />
    );
  }

  if (viewMode === 'detail') {
    return (
      <PurchaseOrderDetail
        purchaseOrder={selectedPO!}
        onBack={() => setViewMode('list')}
        onEdit={() => setViewMode('edit')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Purchase Order Management</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          <span>Create PO</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-md">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total POs</p>
              <p className="text-2xl font-bold text-gray-900">{purchaseOrders.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-md">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Received</p>
              <p className="text-2xl font-bold text-gray-900">
                {purchaseOrders.filter(po => po.received_status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-md">
              <Truck className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Receipt</p>
              <p className="text-2xl font-bold text-gray-900">
                {purchaseOrders.filter(po => po.received_status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-md">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(purchaseOrders.reduce((sum, po) => sum + po.total_amount, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search purchase orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            {Object.entries(PURCHASE_ORDER_STATUS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Workflow</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : filteredPOs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  {searchTerm ? 'Tidak ada PO yang sesuai dengan pencarian' : 'Belum ada Purchase Order'}
                </td>
              </tr>
            ) : (
              filteredPOs.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {po.order_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {po.contact?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(po.order_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(po.total_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(po.status || 'draft')}`}>
                      {PURCHASE_ORDER_STATUS[po.status as keyof typeof PURCHASE_ORDER_STATUS] || 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${getWorkflowStatusColor(po.received_status || 'pending')}`}>
                        Receive: {po.received_status || 'pending'}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getWorkflowStatusColor(po.billed_status || 'not_billed')}`}>
                        Bill: {po.billed_status || 'not_billed'}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getWorkflowStatusColor(po.paid_status || 'unpaid')}`}>
                        Pay: {po.paid_status || 'unpaid'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleView(po)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(po)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Edit"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(po.id || '')}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseManagement;