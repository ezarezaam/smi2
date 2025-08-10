import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Package, CheckCircle } from '../icons';
import { PurchaseReceipt, RECEIPT_STATUS, CONDITION_STATUS } from '../../models/PurchaseReceipt';
import { PurchaseReceiptService } from '../../services/PurchaseReceiptService';
import { PurchaseOrderService } from '../../services/PurchaseOrderService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { toast } from 'react-hot-toast';

const PurchaseReceiptManagement: React.FC = () => {
  const [receipts, setReceipts] = useState<PurchaseReceipt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PurchaseReceipt | null>(null);
  const [availablePOs, setAvailablePOs] = useState<any[]>([]);
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<PurchaseReceipt>({
    receipt_number: '',
    purchase_order_id: '',
    vendor_id: '',
    receipt_date: new Date().toISOString().split('T')[0],
    total_received_amount: 0,
    status: 'draft',
    notes: '',
    received_by: '',
    items: []
  });

  useEffect(() => {
    fetchReceipts();
    fetchAvailablePOs();
  }, []);

  const fetchReceipts = async () => {
    try {
      const { data, error } = await PurchaseReceiptService.getAll();
      if (error) {
        toast.error('Gagal memuat data penerimaan: ' + error.message);
        return;
      }
      setReceipts(data || []);
    } catch (err) {
      toast.error('Terjadi kesalahan saat memuat data penerimaan');
    }
  };

  const fetchAvailablePOs = async () => {
    try {
      const { data, error } = await PurchaseOrderService.getAll();
      if (error) {
        toast.error('Gagal memuat data PO: ' + error.message);
        return;
      }
      // Filter PO yang sudah ordered dan belum fully received
      const availablePOs = (data || []).filter(po => 
        po.status === 'ordered' && po.received_status !== 'completed'
      );
      setAvailablePOs(availablePOs);
    } catch (err) {
      toast.error('Terjadi kesalahan saat memuat data PO');
    }
  };

  const handlePOSelect = async (poId: string) => {
    if (!poId) {
      setSelectedPO(null);
      setFormData(prev => ({ ...prev, purchase_order_id: '', vendor_id: '', items: [] }));
      return;
    }

    try {
      const { data, error } = await PurchaseOrderService.getById(poId);
      if (error) {
        toast.error('Gagal memuat detail PO: ' + error.message);
        return;
      }
      
      if (data) {
        setSelectedPO(data);
        setFormData(prev => ({
          ...prev,
          purchase_order_id: poId,
          vendor_id: data.contacts_id || '',
          items: (data.items || []).map(item => ({
            purchase_order_item_id: item.id || '',
            product_id: item.product_id || '',
            product: item.product,
            ordered_quantity: item.quantity,
            received_quantity: 0,
            unit_price: item.unit_price,
            total_amount: 0,
            condition_status: 'good' as const,
            notes: ''
          }))
        }));
      }
    } catch (err) {
      toast.error('Terjadi kesalahan saat memuat detail PO');
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...(formData.items || [])];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    
    // Recalculate total amount for the item
    if (field === 'received_quantity') {
      updatedItems[index].total_amount = value * updatedItems[index].unit_price;
    }
    
    // Calculate total received amount
    const totalReceived = updatedItems.reduce((sum, item) => sum + item.total_amount, 0);
    
    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      total_received_amount: totalReceived
    }));
  };

  const handleAdd = () => {
    setFormData({
      receipt_number: PurchaseReceiptService.generateReceiptNumber(),
      purchase_order_id: '',
      vendor_id: '',
      receipt_date: new Date().toISOString().split('T')[0],
      total_received_amount: 0,
      status: 'draft',
      notes: '',
      received_by: '',
      items: []
    });
    setSelectedPO(null);
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await PurchaseReceiptService.create(formData);
      if (error) {
        toast.error('Gagal menyimpan penerimaan: ' + error.message);
        return;
      }
      
      toast.success('Penerimaan berhasil disimpan');
      setShowAddModal(false);
      fetchReceipts();
      fetchAvailablePOs(); // Refresh available POs
    } catch (err) {
      toast.error('Terjadi kesalahan saat menyimpan penerimaan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (receipt: PurchaseReceipt) => {
    setSelectedReceipt(receipt);
    setShowDetailModal(true);
  };

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = receipt.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.vendor?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || receipt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Purchase Receipt Management</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          <span>Receive Items</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-md">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Receipts</p>
              <p className="text-2xl font-bold text-gray-900">{receipts.length}</p>
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
                {receipts.filter(r => r.status === 'confirmed').length}
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
                {formatCurrency(receipts.reduce((sum, r) => sum + r.total_received_amount, 0))}
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
                placeholder="Search receipts..."
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
            {Object.entries(RECEIPT_STATUS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredReceipts.map((receipt) => (
              <tr key={receipt.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {receipt.receipt_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {receipt.purchase_order?.order_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {receipt.vendor?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(receipt.receipt_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(receipt.total_received_amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(receipt.status)}`}>
                    {RECEIPT_STATUS[receipt.status as keyof typeof RECEIPT_STATUS]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleView(receipt)}
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

      {/* Add Receipt Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Receive Purchase Order Items</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Receipt Number
                  </label>
                  <input
                    type="text"
                    value={formData.receipt_number}
                    onChange={(e) => setFormData({...formData, receipt_number: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purchase Order
                  </label>
                  <select
                    value={formData.purchase_order_id}
                    onChange={(e) => handlePOSelect(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Select Purchase Order</option>
                    {availablePOs.map(po => (
                      <option key={po.id} value={po.id}>
                        {po.order_number} - {po.contact?.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Receipt Date
                  </label>
                  <input
                    type="date"
                    value={typeof formData.receipt_date === 'string' ? formData.receipt_date.split('T')[0] : ''}
                    onChange={(e) => setFormData({...formData, receipt_date: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Received By
                  </label>
                  <input
                    type="text"
                    value={formData.received_by}
                    onChange={(e) => setFormData({...formData, received_by: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              {/* Items Table */}
              {selectedPO && formData.items && formData.items.length > 0 && (
                <div>
                  <h4 className="text-md font-medium mb-2">Items to Receive</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Ordered</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Received</th>
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
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                value={item.received_quantity}
                                onChange={(e) => handleItemChange(index, 'received_quantity', Number(e.target.value))}
                                className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-right"
                                min="0"
                                max={item.ordered_quantity}
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
                          <td colSpan={5} className="px-4 py-2 text-right font-medium">Total Received:</td>
                          <td className="px-4 py-2 text-right font-medium">{formatCurrency(formData.total_received_amount)}</td>
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
                  disabled={isLoading || !formData.purchase_order_id}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedReceipt && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Receipt Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Receipt Number</p>
                <p className="font-medium">{selectedReceipt.receipt_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">PO Number</p>
                <p className="font-medium">{selectedReceipt.purchase_order?.order_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Vendor</p>
                <p className="font-medium">{selectedReceipt.vendor?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Receipt Date</p>
                <p className="font-medium">{formatDate(selectedReceipt.receipt_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="font-medium">{formatCurrency(selectedReceipt.total_received_amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Received By</p>
                <p className="font-medium">{selectedReceipt.received_by || '-'}</p>
              </div>
            </div>

            {selectedReceipt.items && selectedReceipt.items.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Received Items</h4>
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Ordered</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Received</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Condition</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReceipt.items.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2 text-sm">{item.product?.name}</td>
                        <td className="px-4 py-2 text-sm text-right">{item.ordered_quantity}</td>
                        <td className="px-4 py-2 text-sm text-right">{item.received_quantity}</td>
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

            {selectedReceipt.notes && (
              <div className="mt-4">
                <p className="text-sm text-gray-500">Notes</p>
                <p className="font-medium">{selectedReceipt.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseReceiptManagement;