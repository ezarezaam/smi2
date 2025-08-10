import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Truck, Package } from '../icons';
import { DeliveryOrder, DELIVERY_STATUS, CONDITION_STATUS } from '../../models/DeliveryOrder';
import { DeliveryOrderService } from '../../services/DeliveryOrderService';
import { SalesOrderService } from '../../services/SalesOrderService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

const DeliveryOrderManagement: React.FC = () => {
  const location = useLocation();
  const salesOrderId = location.state?.salesOrderId;
  
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>([]);
  const [availableSOs, setAvailableSOs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOrder | null>(null);
  const [selectedSO, setSelectedSO] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<DeliveryOrder>({
    delivery_number: '',
    sales_order_id: '',
    customer_id: '',
    delivery_date: new Date().toISOString().split('T')[0],
    delivery_address: '',
    driver_name: '',
    vehicle_number: '',
    total_delivered_amount: 0,
    status: 'draft',
    notes: '',
    delivered_by: '',
    items: []
  });

  useEffect(() => {
    fetchDeliveryOrders();
    fetchAvailableSOs();
    
    // If coming from SO detail, auto-select the SO
    if (salesOrderId) {
      handleCreateFromSO(salesOrderId);
    }
  }, []);

  const fetchDeliveryOrders = async () => {
    try {
      const { data, error } = await DeliveryOrderService.getAll();
      if (error) {
        toast.error('Gagal memuat data delivery order: ' + error.message);
        return;
      }
      setDeliveryOrders(data || []);
    } catch (err) {
      toast.error('Terjadi kesalahan saat memuat data delivery order');
    }
  };

  const fetchAvailableSOs = async () => {
    try {
      const { data, error } = await SalesOrderService.getAll();
      if (error) {
        toast.error('Gagal memuat data SO: ' + error.message);
        return;
      }
      // Filter SO yang sudah confirmed dan belum fully delivered
      const availableSOs = (data || []).filter(so => 
        so.status === 'confirmed' && so.delivery_status !== 'completed'
      );
      setAvailableSOs(availableSOs);
    } catch (err) {
      toast.error('Terjadi kesalahan saat memuat data SO');
    }
  };

  const handleSOSelect = async (soId: string) => {
    if (!soId) {
      setSelectedSO(null);
      setFormData(prev => ({ ...prev, sales_order_id: '', customer_id: '', items: [] }));
      return;
    }

    try {
      const { data, error } = await SalesOrderService.getById(soId);
      if (error) {
        toast.error('Gagal memuat detail SO: ' + error.message);
        return;
      }
      
      if (data) {
        setSelectedSO(data);
        setFormData(prev => ({
          ...prev,
          sales_order_id: soId,
          customer_id: data.contacts_id || '',
          delivery_address: data.contact?.address || '',
          items: (data.items || []).map(item => ({
            sales_order_item_id: item.id || '',
            product_id: item.product_id || '',
            product: item.product,
            ordered_quantity: item.quantity,
            delivered_quantity: 0,
            unit_price: item.unit_price,
            total_amount: 0,
            condition_status: 'good' as const,
            notes: ''
          }))
        }));
      }
    } catch (err) {
      toast.error('Terjadi kesalahan saat memuat detail SO');
    }
  };

  const handleCreateFromSO = async (soId: string) => {
    await handleSOSelect(soId);
    setShowAddModal(true);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...(formData.items || [])];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    
    // Recalculate total amount for the item
    if (field === 'delivered_quantity') {
      updatedItems[index].total_amount = value * updatedItems[index].unit_price;
    }
    
    // Calculate total delivered amount
    const totalDelivered = updatedItems.reduce((sum, item) => sum + item.total_amount, 0);
    
    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      total_delivered_amount: totalDelivered
    }));
  };

  const handleAdd = () => {
    setFormData({
      delivery_number: DeliveryOrderService.generateDeliveryNumber(),
      sales_order_id: '',
      customer_id: '',
      delivery_date: new Date().toISOString().split('T')[0],
      delivery_address: '',
      driver_name: '',
      vehicle_number: '',
      total_delivered_amount: 0,
      status: 'draft',
      notes: '',
      delivered_by: '',
      items: []
    });
    setSelectedSO(null);
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await DeliveryOrderService.createFromSalesOrder(
        formData.sales_order_id,
        formData
      );
      if (error) {
        toast.error('Gagal menyimpan delivery order: ' + error.message);
        return;
      }
      
      toast.success('Delivery order berhasil disimpan');
      setShowAddModal(false);
      fetchDeliveryOrders();
      fetchAvailableSOs(); // Refresh available SOs
    } catch (err) {
      toast.error('Terjadi kesalahan saat menyimpan delivery order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (delivery: DeliveryOrder) => {
    setSelectedDelivery(delivery);
    setShowDetailModal(true);
  };

  const filteredDeliveries = deliveryOrders.filter(delivery => {
    const matchesSearch = delivery.delivery_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Delivery Order Management</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          <span>Create Delivery</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-md">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Deliveries</p>
              <p className="text-2xl font-bold text-gray-900">{deliveryOrders.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-md">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">
                {deliveryOrders.filter(d => d.status === 'delivered').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-md">
              <Eye className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(deliveryOrders.reduce((sum, d) => sum + d.total_delivered_amount, 0))}
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
                placeholder="Search delivery orders..."
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
            {Object.entries(DELIVERY_STATUS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Delivery Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SO Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredDeliveries.map((delivery) => (
              <tr key={delivery.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {delivery.delivery_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {delivery.sales_order?.order_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {delivery.customer?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(delivery.delivery_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(delivery.total_delivered_amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(delivery.status)}`}>
                    {DELIVERY_STATUS[delivery.status as keyof typeof DELIVERY_STATUS]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleView(delivery)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Delivery Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create Delivery Order</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Number
                  </label>
                  <input
                    type="text"
                    value={formData.delivery_number}
                    onChange={(e) => setFormData({...formData, delivery_number: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sales Order
                  </label>
                  <select
                    value={formData.sales_order_id}
                    onChange={(e) => handleSOSelect(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Select Sales Order</option>
                    {availableSOs.map(so => (
                      <option key={so.id} value={so.id}>
                        {so.order_number} - {so.contact?.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Date
                  </label>
                  <input
                    type="date"
                    value={typeof formData.delivery_date === 'string' ? formData.delivery_date.split('T')[0] : ''}
                    onChange={(e) => setFormData({...formData, delivery_date: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Driver Name
                  </label>
                  <input
                    type="text"
                    value={formData.driver_name}
                    onChange={(e) => setFormData({...formData, driver_name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Number
                  </label>
                  <input
                    type="text"
                    value={formData.vehicle_number}
                    onChange={(e) => setFormData({...formData, vehicle_number: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivered By
                  </label>
                  <input
                    type="text"
                    value={formData.delivered_by}
                    onChange={(e) => setFormData({...formData, delivered_by: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address
                </label>
                <textarea
                  value={formData.delivery_address}
                  onChange={(e) => setFormData({...formData, delivery_address: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={2}
                />
              </div>

              {/* Items Table */}
              {selectedSO && formData.items && formData.items.length > 0 && (
                <div>
                  <h4 className="text-md font-medium mb-2">Items to Deliver</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Ordered</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Stock</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Deliver</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.items.map((item, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2 text-sm">{item.product?.name}</td>
                            <td className="px-4 py-2 text-sm text-right">{item.ordered_quantity}</td>
                            <td className="px-4 py-2 text-sm text-right">
                              <span className={`px-2 py-1 text-xs rounded ${
                                (item.product?.stock || 0) >= item.ordered_quantity
                                  ? 'bg-green-100 text-green-800'
                                  : (item.product?.stock || 0) > 0
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}>
                                {item.product?.stock || 0}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                value={item.delivered_quantity}
                                onChange={(e) => handleItemChange(index, 'delivered_quantity', Number(e.target.value))}
                                className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-right"
                                min="0"
                                max={Math.min(item.ordered_quantity, item.product?.stock || 0)}
                                step="0.01"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <select
                                value={item.condition_status}
                                onChange={(e) => handleItemChange(index, 'condition_status', e.target.value)}
                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                              >
                                {Object.entries(CONDITION_STATUS).map(([key, label]) => (
                                  <option key={key} value={key}>{label}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-2 text-sm text-right">{formatCurrency(item.unit_price)}</td>
                            <td className="px-4 py-2 text-sm text-right">{formatCurrency(item.total_amount)}</td>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                value={item.notes || ''}
                                onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                                className="w-32 border border-gray-300 rounded px-2 py-1 text-sm"
                                placeholder="Notes"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={6} className="px-4 py-2 text-right font-medium">Total Delivered:</td>
                          <td className="px-4 py-2 text-right font-medium">{formatCurrency(formData.total_delivered_amount)}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !formData.sales_order_id}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Delivery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedDelivery && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Delivery Order Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Delivery Number</p>
                <p className="font-medium">{selectedDelivery.delivery_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">SO Number</p>
                <p className="font-medium">{selectedDelivery.sales_order?.order_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium">{selectedDelivery.customer?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Delivery Date</p>
                <p className="font-medium">{formatDate(selectedDelivery.delivery_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Driver</p>
                <p className="font-medium">{selectedDelivery.driver_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Vehicle</p>
                <p className="font-medium">{selectedDelivery.vehicle_number || '-'}</p>
              </div>
            </div>

            {selectedDelivery.items && selectedDelivery.items.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Delivered Items</h4>
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Ordered</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Delivered</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Condition</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDelivery.items.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2 text-sm">{item.product?.name}</td>
                        <td className="px-4 py-2 text-sm text-right">{item.ordered_quantity}</td>
                        <td className="px-4 py-2 text-sm text-right">{item.delivered_quantity}</td>
                        <td className="px-4 py-2 text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            item.condition_status === 'good' ? 'bg-green-100 text-green-800' :
                            item.condition_status === 'damaged' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {CONDITION_STATUS[item.condition_status as keyof typeof CONDITION_STATUS]}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-right">{formatCurrency(item.total_amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryOrderManagement;