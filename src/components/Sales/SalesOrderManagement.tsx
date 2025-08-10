import React, { useState } from 'react';
import * as LucideIcons from '../../components/icons';

const { Plus, Edit, Trash2, Search, Eye, X } = LucideIcons;

// Interface untuk data Sales Order
interface SalesOrderItem {
  id: string;
  product: string;
  quantity: number;
  price: number;
  total: number;
}

interface SalesOrder {
  id: string;
  date: string;
  customer: string;
  items: SalesOrderItem[];
  status: 'draft' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  total: number;
}

const SalesOrderManagement: React.FC = () => {
  // State untuk menyimpan data sales order
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([
    {
      id: 'SO-001',
      date: '2025-08-01',
      customer: 'PT Maju Bersama',
      items: [
        { id: 'ITEM-001', product: 'Server Dell PowerEdge R740', quantity: 2, price: 65000000, total: 130000000 },
        { id: 'ITEM-002', product: 'Lisensi Microsoft Office 365', quantity: 10, price: 1800000, total: 18000000 }
      ],
      status: 'confirmed',
      paymentStatus: 'partial',
      total: 148000000
    },
    {
      id: 'SO-002',
      date: '2025-08-03',
      customer: 'CV Teknologi Andalan',
      items: [
        { id: 'ITEM-003', product: 'Cisco Switch 48-Port', quantity: 3, price: 12000000, total: 36000000 }
      ],
      status: 'processing',
      paymentStatus: 'unpaid',
      total: 36000000
    },
    {
      id: 'SO-003',
      date: '2025-08-05',
      customer: 'PT Solusi Digital',
      items: [
        { id: 'ITEM-004', product: 'Jasa Implementasi Cloud AWS', quantity: 1, price: 25000000, total: 25000000 }
      ],
      status: 'draft',
      paymentStatus: 'unpaid',
      total: 25000000
    }
  ]);

  // State untuk modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<SalesOrder | null>(null);
  
  // State untuk form
  const [formData, setFormData] = useState<{
    id: string;
    date: string;
    customer: string;
    status: string;
    paymentStatus: string;
    items: {
      id: string;
      product: string;
      quantity: number;
      price: number;
      total: number;
    }[];
  }>({
    id: '',
    date: new Date().toISOString().split('T')[0],
    customer: '',
    status: 'draft',
    paymentStatus: 'unpaid',
    items: []
  });

  // State untuk filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  // Handler untuk menampilkan modal edit
  const handleEdit = (order: SalesOrder) => {
    setCurrentOrder(order);
    setFormData({
      id: order.id,
      date: order.date,
      customer: order.customer,
      status: order.status,
      paymentStatus: order.paymentStatus,
      items: [...order.items]
    });
    setShowEditModal(true);
  };

  // Handler untuk menampilkan modal delete
  const handleDelete = (order: SalesOrder) => {
    setCurrentOrder(order);
    setShowDeleteModal(true);
  };

  // Handler untuk menampilkan modal view
  const handleView = (order: SalesOrder) => {
    setCurrentOrder(order);
    setShowViewModal(true);
  };
  
  // Handler untuk menampilkan modal add
  const handleAdd = () => {
    // Generate new ID
    const newId = `SO-${String(salesOrders.length + 1).padStart(3, '0')}`;
    
    setFormData({
      id: newId,
      date: new Date().toISOString().split('T')[0],
      customer: '',
      status: 'draft',
      paymentStatus: 'unpaid',
      items: []
    });
    
    setShowAddModal(true);
  };
  
  // Handler untuk menambah item
  const addItem = () => {
    const newItemId = `ITEM-${String(formData.items.length + 1).padStart(3, '0')}`;
    
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          id: newItemId,
          product: '',
          quantity: 1,
          price: 0,
          total: 0
        }
      ]
    });
  };
  
  // Handler untuk menghapus item
  const removeItem = (itemId: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.id !== itemId)
    });
  };
  
  // Handler untuk update item
  const updateItem = (itemId: string, field: string, value: string | number) => {
    setFormData({
      ...formData,
      items: formData.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalculate total if quantity or price changes
          if (field === 'quantity' || field === 'price') {
            updatedItem.total = updatedItem.quantity * updatedItem.price;
          }
          
          return updatedItem;
        }
        return item;
      })
    });
  };
  
  // Calculate total order amount
  const calculateOrderTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.total, 0);
  };
  
  // Handler untuk save form
  const handleSaveOrder = () => {
    const total = calculateOrderTotal();
    
    const newOrder: SalesOrder = {
      id: formData.id,
      date: formData.date,
      customer: formData.customer,
      status: formData.status as any,
      paymentStatus: formData.paymentStatus as any,
      items: formData.items,
      total: total
    };
    
    if (showAddModal) {
      // Add new order
      setSalesOrders([...salesOrders, newOrder]);
      setShowAddModal(false);
    } else if (showEditModal) {
      // Update existing order
      setSalesOrders(salesOrders.map(order => 
        order.id === newOrder.id ? newOrder : order
      ));
      setShowEditModal(false);
    }
    
    // Reset form
    setFormData({
      id: '',
      date: new Date().toISOString().split('T')[0],
      customer: '',
      status: 'draft',
      paymentStatus: 'unpaid',
      items: []
    });
  };

  // Handler untuk konfirmasi delete
  const confirmDelete = () => {
    if (currentOrder) {
      setSalesOrders(salesOrders.filter(order => order.id !== currentOrder.id));
      setShowDeleteModal(false);
      setCurrentOrder(null);
    }
  };

  // Filter sales orders berdasarkan pencarian dan filter
  const filteredOrders = salesOrders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Render status badge dengan warna yang sesuai
  const renderStatusBadge = (status: string) => {
    let bgColor = '';
    let textColor = '';
    
    switch(status) {
      case 'draft':
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        break;
      case 'confirmed':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      case 'processing':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      case 'shipped':
        bgColor = 'bg-purple-100';
        textColor = 'text-purple-800';
        break;
      case 'delivered':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'cancelled':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Render payment status badge dengan warna yang sesuai
  const renderPaymentBadge = (paymentStatus: string) => {
    let bgColor = '';
    let textColor = '';
    
    switch(paymentStatus) {
      case 'unpaid':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      case 'partial':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      case 'paid':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header dan Tombol Tambah */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari ID atau customer..."
              className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus className="h-5 w-5 mr-2" />
            <span>Tambah Sales Order</span>
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-4 bg-gray-50 p-4 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      {/* Tabel Sales Order */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.date).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderPaymentBadge(order.paymentStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Rp {order.total.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleView(order)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(order)}
                      className="text-yellow-600 hover:text-yellow-900 mr-3"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(order)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Konfirmasi Hapus</h3>
            <p className="text-gray-500 mb-6">
              Apakah Anda yakin ingin menghapus sales order {currentOrder?.id}? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full my-8 mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {showAddModal ? 'Tambah Sales Order' : 'Edit Sales Order'}
            </h3>
            
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Sales Order
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    readOnly
                    className="w-full border border-gray-300 bg-gray-100 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer *
                  </label>
                  <input
                    type="text"
                    value={formData.customer}
                    onChange={(e) => setFormData({...formData, customer: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({...formData, paymentStatus: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>
              
              {/* Items */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-md font-medium text-gray-900">Items</h4>
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Tambah Item
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-3 py-4 text-center text-sm text-gray-500">
                            Belum ada item. Klik "Tambah Item" untuk menambahkan.
                          </td>
                        </tr>
                      ) : (
                        formData.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={item.product}
                                onChange={(e) => updateItem(item.id, 'product', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Nama produk"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                min="1"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={item.price}
                                onChange={(e) => updateItem(item.id, 'price', parseInt(e.target.value) || 0)}
                                className="w-32 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                min="0"
                              />
                            </td>
                            <td className="px-3 py-2 text-sm">
                              Rp {item.total.toLocaleString('id-ID')}
                            </td>
                            <td className="px-3 py-2">
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="px-3 py-3 text-right font-medium">Total:</td>
                        <td colSpan={2} className="px-3 py-3 font-bold text-blue-600">
                          Rp {calculateOrderTotal().toLocaleString('id-ID')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                onClick={handleSaveOrder}
                disabled={!formData.customer || formData.items.length === 0}
                className={`px-4 py-2 rounded-md ${!formData.customer || formData.items.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* View Modal */}
      {showViewModal && currentOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full my-8 mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Detail Sales Order</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">ID Sales Order</p>
                <p className="font-medium">{currentOrder.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tanggal</p>
                <p className="font-medium">{new Date(currentOrder.date).toLocaleDateString('id-ID')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium">{currentOrder.customer}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <div>{renderStatusBadge(currentOrder.status)}</div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <div>{renderPaymentBadge(currentOrder.paymentStatus)}</div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="font-medium text-blue-600">Rp {currentOrder.total.toLocaleString('id-ID')}</p>
              </div>
            </div>
            
            <h4 className="text-md font-medium text-gray-900 mb-2">Items</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentOrder.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2 text-sm">{item.product}</td>
                      <td className="px-3 py-2 text-sm">{item.quantity}</td>
                      <td className="px-3 py-2 text-sm">Rp {item.price.toLocaleString('id-ID')}</td>
                      <td className="px-3 py-2 text-sm">Rp {item.total.toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesOrderManagement;
