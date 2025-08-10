import React from 'react';
import { SalesOrder, SalesOrderItem, ORDER_STATUS, PAYMENT_STATUS } from '../../models/SalesOrder';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ArrowLeft, Edit, Package, FileText, CreditCard, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SalesOrderDetailProps {
  salesOrder: SalesOrder;
  onBack: () => void;
  onEdit: (id: string) => void;
}

const SalesOrderDetail: React.FC<SalesOrderDetailProps> = ({
  salesOrder,
  onBack,
  onEdit
}) => {
  const navigate = useNavigate();
  
  // Calculate subtotal, tax total, and grand total
  const calculateTotals = () => {
    let subtotal = 0;
    let taxTotal = 0;
    
    if (salesOrder.items && salesOrder.items.length > 0) {
      salesOrder.items.forEach(item => {
        const itemTotal = item.quantity * item.unit_price;
        subtotal += itemTotal;
        
        if (item.tax_amount) {
          taxTotal += item.tax_amount;
        } else if (item.tax_percent) {
          const itemTax = itemTotal * (item.tax_percent / 100);
          taxTotal += itemTax;
        }
      });
    }
    
    const grandTotal = subtotal + taxTotal - (salesOrder.discount_amount || 0);
    
    return {
      subtotal,
      taxTotal,
      grandTotal
    };
  };
  
  const { subtotal, taxTotal, grandTotal } = calculateTotals();
  
  // Helper functions for workflow status colors
  const getWorkflowStatusColor = (status: string) => {
    switch (status) {
      case 'pending': case 'not_invoiced': case 'unpaid': return 'bg-yellow-100 text-yellow-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      case 'completed': case 'fully_invoiced': case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Check what workflow actions are available
  const canDeliver = salesOrder.status === 'confirmed' && salesOrder.delivery_status !== 'completed';
  const canCreateInvoice = salesOrder.delivery_status !== 'pending' && salesOrder.invoice_status !== 'fully_invoiced';
  const canReceivePayment = salesOrder.invoice_status !== 'not_invoiced' && salesOrder.payment_status !== 'paid';
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={18} className="mr-1" />
          <span>Kembali</span>
        </button>
        <button
          onClick={() => onEdit(salesOrder.id || '')}
          className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Edit size={16} />
          <span>Edit</span>
        </button>
      </div>
      
      {/* Workflow Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">SO Status</p>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(salesOrder.status || 'draft')}`}>
                {ORDER_STATUS[salesOrder.status as keyof typeof ORDER_STATUS] || 'Draft'}
              </span>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Delivery Status</p>
              <span className={`px-2 py-1 text-xs rounded-full ${getWorkflowStatusColor(salesOrder.delivery_status || 'pending')}`}>
                {salesOrder.delivery_status || 'pending'}
              </span>
            </div>
            <Truck className="h-8 w-8 text-green-500" />
          </div>
          {canDeliver && (
            <button
              onClick={() => navigate('/delivery-order', { state: { salesOrderId: salesOrder.id } })}
              className="mt-2 w-full bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
            >
              Create Delivery
            </button>
          )}
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Invoice Status</p>
              <span className={`px-2 py-1 text-xs rounded-full ${getWorkflowStatusColor(salesOrder.invoice_status || 'not_invoiced')}`}>
                {salesOrder.invoice_status || 'not_invoiced'}
              </span>
            </div>
            <FileText className="h-8 w-8 text-purple-500" />
          </div>
          {canCreateInvoice && (
            <button
              onClick={() => navigate('/customer-invoice', { state: { salesOrderId: salesOrder.id } })}
              className="mt-2 w-full bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700"
            >
              Create Invoice
            </button>
          )}
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Payment Status</p>
              <span className={`px-2 py-1 text-xs rounded-full ${getWorkflowStatusColor(salesOrder.payment_status || 'unpaid')}`}>
                {PAYMENT_STATUS[salesOrder.payment_status as keyof typeof PAYMENT_STATUS] || 'Belum Dibayar'}
              </span>
            </div>
            <CreditCard className="h-8 w-8 text-orange-500" />
          </div>
          {canReceivePayment && (
            <button
              onClick={() => navigate('/customer-payment', { state: { salesOrderId: salesOrder.id } })}
              className="mt-2 w-full bg-orange-600 text-white px-2 py-1 rounded text-xs hover:bg-orange-700"
            >
              Record Payment
            </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="text-xl font-bold mb-4">Detail Sales Order</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">No. Order:</span>
              <span>{salesOrder.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Tanggal:</span>
              <span>{formatDate(new Date(salesOrder.order_date))}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <span className={`px-2 py-1 rounded text-xs ${getStatusColor(salesOrder.status || 'draft')}`}>
                {ORDER_STATUS[salesOrder.status as keyof typeof ORDER_STATUS] || 'Draft'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status Pembayaran:</span>
              <span className={`px-2 py-1 rounded text-xs ${getPaymentStatusColor(salesOrder.payment_status || 'unpaid')}`}>
                {PAYMENT_STATUS[salesOrder.payment_status as keyof typeof PAYMENT_STATUS] || 'Belum Dibayar'}
              </span>
            </div>
            {salesOrder.due_date && (
              <div className="flex justify-between">
                <span className="font-medium">Jatuh Tempo:</span>
                <span>{formatDate(new Date(salesOrder.due_date))}</span>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-4">Customer</h2>
          {salesOrder.contact ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Nama:</span>
                <span>{salesOrder.contact.name}</span>
              </div>
              {salesOrder.contact.contact_person && (
                <div className="flex justify-between">
                  <span className="font-medium">Contact Person:</span>
                  <span>{salesOrder.contact.contact_person}</span>
                </div>
              )}
              {salesOrder.contact.email && (
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span>{salesOrder.contact.email}</span>
                </div>
              )}
              {salesOrder.contact.phone && (
                <div className="flex justify-between">
                  <span className="font-medium">Telepon:</span>
                  <span>{salesOrder.contact.phone}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Data customer tidak tersedia</p>
          )}
        </div>
      </div>
      
      <h2 className="text-xl font-bold mb-4">Item Sales Order</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">No</th>
              <th className="py-2 px-4 border-b text-left">Produk/Layanan</th>
              <th className="py-2 px-4 border-b text-left">Deskripsi</th>
              <th className="py-2 px-4 border-b text-right">Qty</th>
              <th className="py-2 px-4 border-b text-right">Delivered</th>
              <th className="py-2 px-4 border-b text-right">Invoiced</th>
              <th className="py-2 px-4 border-b text-left">Satuan</th>
              <th className="py-2 px-4 border-b text-right">Harga</th>
              <th className="py-2 px-4 border-b text-right">Pajak (%)</th>
              <th className="py-2 px-4 border-b text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {salesOrder.items && salesOrder.items.map((item, index) => {
              const itemTotal = item.quantity * item.unit_price;
              const itemTaxAmount = item.tax_amount || (itemTotal * (item.tax_percent || 0) / 100);
              const totalWithTax = itemTotal + itemTaxAmount;
              
              return (
                <tr key={item.id || index} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{index + 1}</td>
                  <td className="py-2 px-4 border-b">
                    {item.product?.name || item.service?.name || '-'}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {item.description || item.product?.description || item.service?.description || '-'}
                  </td>
                  <td className="py-2 px-4 border-b text-right">{item.quantity}</td>
                  <td className="py-2 px-4 border-b text-right">
                    <span className={`px-2 py-1 text-xs rounded ${
                      (item.delivered_quantity || 0) >= item.quantity 
                        ? 'bg-green-100 text-green-800' 
                        : (item.delivered_quantity || 0) > 0 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.delivered_quantity || 0}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b text-right">
                    <span className={`px-2 py-1 text-xs rounded ${
                      (item.invoiced_quantity || 0) >= (item.delivered_quantity || 0) 
                        ? 'bg-green-100 text-green-800' 
                        : (item.invoiced_quantity || 0) > 0 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.invoiced_quantity || 0}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b">{item.uom?.name || '-'}</td>
                  <td className="py-2 px-4 border-b text-right">{formatCurrency(item.unit_price)}</td>
                  <td className="py-2 px-4 border-b text-right">{item.tax_percent || 0}%</td>
                  <td className="py-2 px-4 border-b text-right">{formatCurrency(totalWithTax)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Total Pajak:</span>
            <span>{formatCurrency(taxTotal)}</span>
          </div>
          {salesOrder.discount_amount && salesOrder.discount_amount > 0 && (
            <div className="flex justify-between">
              <span className="font-medium">Diskon:</span>
              <span>-{formatCurrency(salesOrder.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-gray-200">
            <span className="font-bold">Total:</span>
            <span className="font-bold">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>
      
      {salesOrder.notes && (
        <div className="mt-6">
          <h3 className="font-bold mb-2">Catatan:</h3>
          <p className="bg-gray-50 p-3 rounded">{salesOrder.notes}</p>
        </div>
      )}
    </div>
  );
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

export default SalesOrderDetail;
