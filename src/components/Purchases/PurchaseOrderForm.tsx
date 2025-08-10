import React, { useState, useEffect } from 'react';
import { PurchaseOrder, PurchaseOrderItem, PURCHASE_ORDER_STATUS, PAYMENT_STATUS } from '../../models/PurchaseOrder';
import { Contact } from '../../models/Contact';
import { Product } from '../../models/Product';
import { UOM } from '../../models/UOM';
import { formatCurrency } from '../../utils/formatters';
import { ArrowLeft, Plus, Trash2, X } from 'lucide-react';

interface PurchaseOrderFormProps {
  purchaseOrder: PurchaseOrder;
  vendors: Contact[];
  products: Product[];
  uoms: UOM[];
  isEditing: boolean;
  onBack: () => void;
  onSubmit: (purchaseOrder: PurchaseOrder) => void;
}

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  purchaseOrder,
  vendors,
  products,
  uoms,
  isEditing,
  onBack,
  onSubmit
}) => {
  const [formData, setFormData] = useState<PurchaseOrder>(purchaseOrder);
  const [items, setItems] = useState<PurchaseOrderItem[]>(purchaseOrder.items || []);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState<PurchaseOrderItem>({
    product_id: '',
    quantity: 1,
    unit_price: 0,
    tax_percent: 0,
    tax_amount: 0,
    discount: 0,
    total_price: 0
  });

  // Calculate totals when items change
  useEffect(() => {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    setFormData(prev => ({ ...prev, total_amount: subtotal, items }));
  }, [items]);

  // Calculate item total when item details change
  useEffect(() => {
    const itemTotal = newItem.quantity * newItem.unit_price;
    const taxAmount = itemTotal * (newItem.tax_percent / 100);
    const totalWithTax = itemTotal + taxAmount - (newItem.discount || 0);
    
    setNewItem(prev => ({
      ...prev,
      tax_amount: taxAmount,
      total_price: totalWithTax
    }));
  }, [newItem.quantity, newItem.unit_price, newItem.tax_percent, newItem.discount]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setNewItem(prev => ({
        ...prev,
        product_id: productId,
        unit_price: product.price || 0
      }));
    }
  };

  const addItem = () => {
    if (!newItem.product_id || newItem.quantity <= 0 || newItem.unit_price <= 0) {
      alert('Please fill all required fields');
      return;
    }

    const product = products.find(p => p.id === newItem.product_id);
    const uom = uoms.find(u => u.id === newItem.uom_id);

    setItems(prev => [...prev, {
      ...newItem,
      id: `temp-${Date.now()}`,
      product,
      uom
    }]);

    setNewItem({
      product_id: '',
      quantity: 1,
      unit_price: 0,
      tax_percent: 0,
      tax_amount: 0,
      discount: 0,
      total_price: 0
    });
    setShowAddItem(false);
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.contacts_id) {
      alert('Please select a vendor');
      return;
    }
    
    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    onSubmit({ ...formData, items });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="mr-4 text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold">
          {isEditing ? 'Edit Purchase Order' : 'Create Purchase Order'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PO Number
            </label>
            <input
              type="text"
              name="order_number"
              value={formData.order_number}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor *
            </label>
            <select
              name="contacts_id"
              value={formData.contacts_id}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            >
              <option value="">Select Vendor</option>
              {vendors.map(vendor => (
                <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Date *
            </label>
            <input
              type="date"
              name="order_date"
              value={typeof formData.order_date === 'string' ? formData.order_date.split('T')[0] : ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Delivery
            </label>
            <input
              type="date"
              name="expected_delivery_date"
              value={formData.expected_delivery_date ? (typeof formData.expected_delivery_date === 'string' ? formData.expected_delivery_date.split('T')[0] : '') : ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              {Object.entries(PURCHASE_ORDER_STATUS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <select
              name="payment_status"
              value={formData.payment_status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              {Object.entries(PAYMENT_STATUS).map(([key, label]) => (
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
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            rows={3}
          />
        </div>

        {/* Items Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Items</h3>
            <button
              type="button"
              onClick={() => setShowAddItem(true)}
              className="bg-green-600 text-white px-3 py-1 rounded-md text-sm flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Add Item</span>
            </button>
          </div>

          {/* Add Item Form */}
          {showAddItem && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-6 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Product</label>
                  <select
                    value={newItem.product_id}
                    onChange={(e) => handleProductSelect(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value="">Select Product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    min="0.01"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">UOM</label>
                  <select
                    value={newItem.uom_id || ''}
                    onChange={(e) => setNewItem(prev => ({ ...prev, uom_id: Number(e.target.value) }))}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value="">Select UOM</option>
                    {uoms.map(uom => (
                      <option key={uom.id} value={uom.id}>{uom.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Unit Price</label>
                  <input
                    type="number"
                    value={newItem.unit_price}
                    onChange={(e) => setNewItem(prev => ({ ...prev, unit_price: Number(e.target.value) }))}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tax %</label>
                  <input
                    type="number"
                    value={newItem.tax_percent}
                    onChange={(e) => setNewItem(prev => ({ ...prev, tax_percent: Number(e.target.value) }))}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
                <div className="flex items-end space-x-1">
                  <button
                    type="button"
                    onClick={addItem}
                    className="bg-green-600 text-white px-2 py-1 rounded text-sm"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddItem(false)}
                    className="bg-gray-600 text-white px-2 py-1 rounded text-sm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">UOM</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Tax</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No items added. Click "Add Item" to add products.
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2 text-sm">{item.product?.name}</td>
                      <td className="px-4 py-2 text-sm text-right">{item.quantity}</td>
                      <td className="px-4 py-2 text-sm">{item.uom?.name || '-'}</td>
                      <td className="px-4 py-2 text-sm text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="px-4 py-2 text-sm text-right">{item.tax_percent}%</td>
                      <td className="px-4 py-2 text-sm text-right">{formatCurrency(item.total_price)}</td>
                      <td className="px-4 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={5} className="px-4 py-2 text-right font-medium">Total:</td>
                  <td className="px-4 py-2 text-right font-bold">{formatCurrency(formData.total_amount)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {isEditing ? 'Update PO' : 'Create PO'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PurchaseOrderForm;