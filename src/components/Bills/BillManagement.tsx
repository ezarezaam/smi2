import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Calendar, DollarSign } from '../icons';
import { Bill, BILL_STATUS, PAYMENT_STATUS } from '../../models/Bill';
import { BillService } from '../../services/BillService';
import { PurchaseOrderService } from '../../services/PurchaseOrderService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

const BillManagement: React.FC = () => {
  const location = useLocation();
  const purchaseOrderId = location.state?.purchaseOrderId;
  
  const [bills, setBills] = useState<Bill[]>([]);
  const [availablePOs, setAvailablePOs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<Bill>({
    bill_number: BillService.generateBillNumber(),
    purchase_order_id: purchaseOrderId || '',
    vendor_id: '',
    bill_date: new Date().toISOString().split('T')[0],
    due_date: '',
    subtotal_amount: 0,
    tax_amount: 0,
    discount_amount: 0,
    total_amount: 0,
    paid_amount: 0,
    status: 'draft',
    payment_status: 'unpaid',
    notes: ''
  });

  useEffect(() => {
    loadBills();
    loadAvailablePOs();
    
    // If coming from PO detail, auto-select the PO
    if (purchaseOrderId) {
      handleCreateFromPO(purchaseOrderId);
    }
  }, []);

  const loadBills = async () => {
    try {
      const { data, error } = await BillService.getAll();
      if (error) throw error;
      setBills(data || []);
    } catch (error: any) {
      toast.error('Gagal memuat data bill: ' + error.message);
    }
  };

  const loadAvailablePOs = async () => {
    try {
      const { data, error } = await PurchaseOrderService.getAll();
      if (error) throw error;
      // Filter PO yang sudah received dan belum fully billed
      const available = (data || []).filter(po => 
        po.received_status !== 'pending' && po.billed_status !== 'fully_billed'
      );
      setAvailablePOs(available);
    } catch (error: any) {
      toast.error('Gagal memuat data PO: ' + error.message);
    }
  };

  const handleCreateFromPO = async (poId: string) => {
    try {
      const { data, error } = await PurchaseOrderService.getById(poId);
      if (error) throw error;
      
      if (data) {
        // Calculate total from received items
        const receivedItems = (data.items || []).filter(item => (item.received_quantity || 0) > 0);
        const subtotal = receivedItems.reduce((sum, item) => 
          sum + ((item.received_quantity || 0) * item.unit_price), 0
        );
        
        setFormData(prev => ({
          ...prev,
          purchase_order_id: poId,
          vendor_id: data.contacts_id || '',
          subtotal_amount: subtotal,
          total_amount: subtotal
        }));
      }
    } catch (error: any) {
      toast.error('Gagal memuat data PO: ' + error.message);
    }
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.bill_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.vendor?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAdd = () => {
    setFormData({
      bill_number: BillService.generateBillNumber(),
      purchase_order_id: '',
      vendor_id: '',
      bill_date: new Date().toISOString().split('T')[0],
      due_date: '',
      subtotal_amount: 0,
      tax_amount: 0,
      discount_amount: 0,
      total_amount: 0,
      paid_amount: 0,
      status: 'draft',
      payment_status: 'unpaid',
      notes: ''
    });
    setShowAddModal(true);
  };

  const handleEdit = (bill: Bill) => {
    setSelectedBill(bill);
    setFormData(bill);
    setShowEditModal(true);
  };

  const handleView = (bill: Bill) => {
    setSelectedBill(bill);
    setShowDetailModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitBill = async () => {
      try {
        setIsLoading(true);
        
        if (selectedBill?.id) {
          const { error } = await BillService.update(selectedBill.id, formData);
          if (error) throw error;
          toast.success('Bill berhasil diperbarui');
        } else {
          const { error } = await BillService.createFromPurchaseOrder(
            formData.purchase_order_id || '', 
            formData
          );
          if (error) throw error;
          toast.success('Bill berhasil ditambahkan');
        }
        
        setShowAddModal(false);
        setShowEditModal(false);
        setSelectedBill(null);
        loadBills();
      } catch (error: any) {
        toast.error('Gagal menyimpan bill: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    submitBill();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bills Management</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          <span>Add Bill</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-md">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Bills</p>
              <p className="text-2xl font-bold text-gray-900">{bills.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-md">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(bills.reduce((sum, b) => sum + b.total_amount, 0))}
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
              <p className="text-sm font-medium text-gray-500">Outstanding</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(bills.reduce((sum, b) => sum + (b.total_amount - b.paid_amount), 0))}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-md">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Paid Bills</p>
              <p className="text-2xl font-bold text-gray-900">
                {bills.filter(b => b.payment_status === 'paid').length}
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
                placeholder="Search bills..."
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
            {Object.entries(BILL_STATUS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredBills.map((bill) => (
              <tr key={bill.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {bill.bill_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {bill.purchase_order?.order_number || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {bill.vendor?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(bill.bill_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>
                    <p>{formatCurrency(bill.total_amount)}</p>
                    <p className="text-xs text-gray-400">
                      Paid: {formatCurrency(bill.paid_amount)}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(bill.status)}`}>
                    {BILL_STATUS[bill.status as keyof typeof BILL_STATUS]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleView(bill)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(bill)}
                      className="text-yellow-600 hover:text-yellow-900"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">
              {showAddModal ? 'Add New Bill' : 'Edit Bill'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bill Number
                  </label>
                  <input
                    type="text"
                    value={formData.bill_number}
                    onChange={(e) => setFormData({...formData, bill_number: e.target.value})}
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
                    onChange={(e) => {
                      setFormData({...formData, purchase_order_id: e.target.value});
                      if (e.target.value) {
                        handleCreateFromPO(e.target.value);
                      }
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
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
                    Bill Date
                  </label>
                  <input
                    type="date"
                    value={typeof formData.bill_date === 'string' ? formData.bill_date.split('T')[0] : ''}
                    onChange={(e) => setFormData({...formData, bill_date: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={typeof formData.due_date === 'string' ? formData.due_date.split('T')[0] : ''}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Amount
                  </label>
                  <input
                    type="number"
                    value={formData.total_amount}
                    onChange={(e) => setFormData({...formData, total_amount: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    readOnly={!!formData.purchase_order_id}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    {Object.entries(BILL_STATUS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
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
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedBill && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Bill Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Bill Number</p>
                  <p className="font-medium">{selectedBill.bill_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vendor</p>
                  <p className="font-medium">{selectedBill.vendor?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bill Date</p>
                  <p className="font-medium">{formatDate(selectedBill.bill_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className="font-medium">{formatDate(selectedBill.due_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium">{formatCurrency(selectedBill.total_amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Paid Amount</p>
                  <p className="font-medium">{formatCurrency(selectedBill.paid_amount)}</p>
                </div>
              </div>
              {selectedBill.notes && (
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="font-medium">{selectedBill.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillManagement;