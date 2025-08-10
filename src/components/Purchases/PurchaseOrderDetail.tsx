import React from 'react';
import { PurchaseOrder } from '../../models/PurchaseOrder';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ArrowLeft, Edit, Package, FileText, CreditCard, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PurchaseOrderDetailProps {
  purchaseOrder: PurchaseOrder;
  onBack: () => void;
  onEdit: () => void;
}

const PurchaseOrderDetail: React.FC<PurchaseOrderDetailProps> = ({
  purchaseOrder,
  onBack,
  onEdit
}) => {
  const navigate = useNavigate();

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

  const canReceive = purchaseOrder.status === 'ordered' && purchaseOrder.received_status !== 'completed';
  const canCreateBill = purchaseOrder.received_status !== 'pending' && purchaseOrder.billed_status !== 'fully_billed';
  const canMakePayment = purchaseOrder.billed_status !== 'not_billed' && purchaseOrder.paid_status !== 'paid';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-4 text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold">{purchaseOrder.order_number}</h2>
            <p className="text-gray-500">Purchase Order Details</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="bg-yellow-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-yellow-700"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* Workflow Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">PO Status</p>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(purchaseOrder.status || 'draft')}`}>
                {purchaseOrder.status || 'draft'}
              </span>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Receive Status</p>
              <span className={`px-2 py-1 text-xs rounded-full ${getWorkflowStatusColor(purchaseOrder.received_status || 'pending')}`}>
                {purchaseOrder.received_status || 'pending'}
              </span>
            </div>
            <Package className="h-8 w-8 text-green-500" />
          </div>
          {canReceive && (
            <button
              onClick={() => navigate('/purchase-receipt', { state: { purchaseOrderId: purchaseOrder.id } })}
              className="mt-2 w-full bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
            >
              Receive Items
            </button>
          )}
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Bill Status</p>
              <span className={`px-2 py-1 text-xs rounded-full ${getWorkflowStatusColor(purchaseOrder.billed_status || 'not_billed')}`}>
                {purchaseOrder.billed_status || 'not_billed'}
              </span>
            </div>
            <FileText className="h-8 w-8 text-purple-500" />
          </div>
          {canCreateBill && (
            <button
              onClick={() => navigate('/bills', { state: { purchaseOrderId: purchaseOrder.id } })}
              className="mt-2 w-full bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700"
            >
              Create Bill
            </button>
          )}
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Payment Status</p>
              <span className={`px-2 py-1 text-xs rounded-full ${getWorkflowStatusColor(purchaseOrder.paid_status || 'unpaid')}`}>
                {purchaseOrder.paid_status || 'unpaid'}
              </span>
            </div>
            <CreditCard className="h-8 w-8 text-orange-500" />
          </div>
          {canMakePayment && (
            <button
              onClick={() => navigate('/vendor-payment', { state: { purchaseOrderId: purchaseOrder.id } })}
              className="mt-2 w-full bg-orange-600 text-white px-2 py-1 rounded text-xs hover:bg-orange-700"
            >
              Make Payment
            </button>
          )}
        </div>
      </div>

      {/* PO Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Purchase Order Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">PO Number:</span>
              <span className="font-medium">{purchaseOrder.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Order Date:</span>
              <span className="font-medium">{formatDate(purchaseOrder.order_date)}</span>
            </div>
            {purchaseOrder.expected_delivery_date && (
              <div className="flex justify-between">
                <span className="text-gray-500">Expected Delivery:</span>
                <span className="font-medium">{formatDate(purchaseOrder.expected_delivery_date)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Total Amount:</span>
              <span className="font-bold text-green-600">{formatCurrency(purchaseOrder.total_amount)}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Vendor Information</h3>
          {purchaseOrder.contact ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Name:</span>
                <span className="font-medium">{purchaseOrder.contact.name}</span>
              </div>
              {purchaseOrder.contact.contact_person && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Contact Person:</span>
                  <span className="font-medium">{purchaseOrder.contact.contact_person}</span>
                </div>
              )}
              {purchaseOrder.contact.email && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium">{purchaseOrder.contact.email}</span>
                </div>
              )}
              {purchaseOrder.contact.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-medium">{purchaseOrder.contact.phone}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Vendor information not available</p>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div>
        <h3 className="text-lg font-medium mb-4">Items</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Ordered</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Received</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Billed</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">UOM</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrder.items?.map((item, index) => (
                <tr key={index} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm">{item.product?.name}</td>
                  <td className="px-4 py-2 text-sm text-right">{item.quantity}</td>
                  <td className="px-4 py-2 text-sm text-right">
                    <span className={`px-2 py-1 text-xs rounded ${
                      (item.received_quantity || 0) >= item.quantity 
                        ? 'bg-green-100 text-green-800' 
                        : (item.received_quantity || 0) > 0 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.received_quantity || 0}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-right">
                    <span className={`px-2 py-1 text-xs rounded ${
                      (item.billed_quantity || 0) >= (item.received_quantity || 0) 
                        ? 'bg-green-100 text-green-800' 
                        : (item.billed_quantity || 0) > 0 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.billed_quantity || 0}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">{item.uom?.name || '-'}</td>
                  <td className="px-4 py-2 text-sm text-right">{formatCurrency(item.unit_price)}</td>
                  <td className="px-4 py-2 text-sm text-right">{formatCurrency(item.total_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {purchaseOrder.notes && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Notes</h3>
          <p className="bg-gray-50 p-3 rounded-md">{purchaseOrder.notes}</p>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderDetail;