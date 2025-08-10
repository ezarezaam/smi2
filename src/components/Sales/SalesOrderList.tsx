import React from 'react';
import { SalesOrder, ORDER_STATUS, PAYMENT_STATUS } from '../../models/SalesOrder';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Filter, Plus, Eye, Edit, Trash2, Search } from 'lucide-react';

interface SalesOrderListProps {
  salesOrders: SalesOrder[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterPaymentStatus: string;
  setFilterPaymentStatus: (status: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  onAdd: () => void;
  onView: (salesOrder: SalesOrder) => void;
  onEdit: (id: string) => void;
  onDelete: (salesOrder: SalesOrder) => void;
}

const SalesOrderList: React.FC<SalesOrderListProps> = ({
  salesOrders,
  loading,
  error,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterPaymentStatus,
  setFilterPaymentStatus,
  showFilters,
  setShowFilters,
  onAdd,
  onView,
  onEdit,
  onDelete
}) => {
  // Filter sales orders based on search and filters
  const getFilteredSalesOrders = () => {
    return salesOrders.filter(so => {
      // Filter by search term
      const searchMatch = !searchTerm || 
        so.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (so.contact?.name && so.contact.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (so.notes && so.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filter by status
      const statusMatch = !filterStatus || so.status === filterStatus;
      
      // Filter by payment status
      const paymentStatusMatch = !filterPaymentStatus || so.payment_status === filterPaymentStatus;
      
      return searchMatch && statusMatch && paymentStatusMatch;
    });
  };

  // Helper function to get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'draft':
        return 'bg-gray-200 text-gray-800';
      case 'confirmed':
        return 'bg-blue-200 text-blue-800';
      case 'delivered':
        return 'bg-green-200 text-green-800';
      case 'cancelled':
        return 'bg-red-200 text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };
  
  // Helper function to get payment status color
  const getPaymentStatusColor = (status: string): string => {
    switch (status) {
      case 'unpaid':
        return 'bg-red-200 text-red-800';
      case 'partial':
        return 'bg-yellow-200 text-yellow-800';
      case 'paid':
        return 'bg-green-200 text-green-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const renderSalesOrderList = () => {
    const filteredOrders = getFilteredSalesOrders();
    
    if (loading) {
      return <div className="text-center py-4">Loading...</div>;
    }
    
    if (error) {
      return <div className="text-center py-4 text-red-600">{error}</div>;
    }
    
    if (filteredOrders.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">Tidak ada sales order yang ditemukan.</p>
          <button
            onClick={onAdd}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tambah Sales Order Baru
          </button>
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto bg-white rounded-lg shadow w-full">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">No. Order</th>
              <th className="py-2 px-4 border-b text-left">Tanggal</th>
              <th className="py-2 px-4 border-b text-left">Customer</th>
              <th className="py-2 px-4 border-b text-left">Total</th>
              <th className="py-2 px-4 border-b text-left">Status</th>
              <th className="py-2 px-4 border-b text-left">Pembayaran</th>
              <th className="py-2 px-4 border-b text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b text-gray-500">{order.order_number}</td>
                <td className="py-2 px-4 border-b text-gray-500">{formatDate(new Date(order.order_date))}</td>
                <td className="py-2 px-4 border-b text-gray-500">{order.contact?.name || '-'}</td>
                <td className="py-2 px-4 border-b text-gray-500">{formatCurrency(order.total_amount)}</td>
                <td className="py-2 px-4 border-b">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(order.status || 'draft')}`}>
                    {ORDER_STATUS[order.status as keyof typeof ORDER_STATUS] || 'Draft'}
                  </span>
                </td>
                <td className="py-2 px-4 border-b">
                  <span className={`px-2 py-1 rounded text-xs ${getPaymentStatusColor(order.payment_status || 'unpaid')}`}>
                    {PAYMENT_STATUS[order.payment_status as keyof typeof PAYMENT_STATUS] || 'Belum Dibayar'}
                  </span>
                </td>
                <td className="py-2 px-4 border-b text-center">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => onView(order)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Lihat Detail"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => onEdit(order.id || '')}
                      className="p-1 text-green-600 hover:text-green-800"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(order)}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="Hapus"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari sales order..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            {Object.entries(ORDER_STATUS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select
            value={filterPaymentStatus}
            onChange={(e) => setFilterPaymentStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Payment Status</option>
            {Object.entries(PAYMENT_STATUS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Sales Orders</h2>
      </div>
      
      {renderSalesOrderList()}
    </div>
  );
};

export default SalesOrderList;