import React, { useState, useEffect } from 'react';
import { SalesOrder, SalesOrderItem, ORDER_STATUS, PAYMENT_STATUS } from '../../models/SalesOrder';
import { Contact } from '../../models/Contact';
import { Product } from '../../models/Product';
import { UOM } from '../../models/UOM';
import { formatCurrency } from '../../utils/formatters';
import { ArrowLeft, Edit, Plus, Trash2, X } from 'lucide-react';

interface SalesOrderFormProps {
  salesOrder: SalesOrder;
  customers: Contact[]; // Menggunakan customers alih-alih contacts untuk kompatibilitas dengan SalesManagementNew
  products: Product[];
  uoms: UOM[];
  isEditing: boolean;
  onBack: () => void;
  onSubmit: (salesOrder: SalesOrder) => void;
}

const SalesOrderForm: React.FC<SalesOrderFormProps> = ({
  salesOrder,
  customers,
  products,
  uoms,
  isEditing,
  onBack,
  onSubmit
}) => {
  // Debug: Log customers data dengan lebih detail
  console.log('SalesOrderForm received customers:', customers);
  console.log('SalesOrderForm customers type:', customers ? typeof customers : 'undefined');
  console.log('SalesOrderForm customers is array:', Array.isArray(customers));
  console.log('SalesOrderForm customers length:', customers?.length);
  const [formData, setFormData] = useState<SalesOrder>(salesOrder);
  const [salesItems, setSalesItems] = useState<SalesOrderItem[]>(salesOrder.items || []);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedUOM, setSelectedUOM] = useState<UOM | null>(null);
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [itemPrice, setItemPrice] = useState<number>(0);
  const [itemTaxPercent, setItemTaxPercent] = useState<number>(0);
  const [showAddProductRow, setShowAddProductRow] = useState<boolean>(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number>(-1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // State tambahan untuk menyimpan nilai yang tidak ada di model SalesOrder
  const [subtotalAmount, setSubtotalAmount] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);

  // Calculate totals whenever items change
  useEffect(() => {
    calculateTotals();
  }, [salesItems]);

  // Calculate subtotal, tax total, and grand total
  const calculateTotals = () => {
    let subtotal = 0;
    let taxTotal = 0;
    
    salesItems.forEach(item => {
      const itemTotal = item.quantity * item.unit_price;
      subtotal += itemTotal;
      
      if (item.tax_amount) {
        taxTotal += item.tax_amount;
      } else if (item.tax_percent) {
        const itemTax = itemTotal * (item.tax_percent / 100);
        taxTotal += itemTax;
      }
    });
    
    // Menggunakan variabel lokal untuk discount
    const grandTotal = subtotal + taxTotal - discount;
    
    setFormData(prev => ({
      ...prev,
      total_amount: grandTotal
    }));
    
    // Menyimpan nilai subtotal dan tax dalam state lokal
    setSubtotalAmount(subtotal);
    setTaxAmount(taxTotal);
  };

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'contacts_id') {
      console.log('Selected contacts_id:', value);
      const selectedContact = customers && Array.isArray(customers) ? customers.find((c: Contact) => c.id === value) : undefined;
      console.log('Selected contact:', selectedContact);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        contact: selectedContact
      }));
    } else if (name === 'discount') {
      const discountValue = parseFloat(value) || 0;
      setDiscount(discountValue);
      calculateTotals();
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error for this field if exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Handle product selection
  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = e.target.value;
    if (!productId) {
      setSelectedProduct(null);
      setItemPrice(0);
      return;
    }
    
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setItemPrice(product.sell_price || product.price || 0);
      
      // If product has a default UOM, select it
      // Note: uom_id might not be in the Product type, but we check it anyway
      const productUomId = (product as any).uom_id;
      if (productUomId) {
        const productUOM = uoms.find(u => u.id && u.id.toString() === productUomId.toString());
        if (productUOM) {
          setSelectedUOM(productUOM);
        }
      }
    }
  };

  // Handle UOM selection
  const handleUOMSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const uomId = e.target.value;
    if (!uomId) {
      setSelectedUOM(null);
      return;
    }
    
    const uom = uoms.find(u => u.id && u.id.toString() === uomId);
    if (uom) {
      setSelectedUOM(uom);
    }
  };

  // Add item to sales order
  const handleAddItem = () => {
    // Validate required fields
    const newErrors: Record<string, string> = {};
    
    if (!selectedProduct) {
      newErrors.product_id = 'Produk harus dipilih';
    }
    
    if (itemQuantity <= 0) {
      newErrors.quantity = 'Jumlah harus lebih dari 0';
    }
    
    if (itemPrice <= 0) {
      newErrors.unit_price = 'Harga harus lebih dari 0';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    if (selectedProduct) {
      const itemTaxAmount = (itemQuantity * itemPrice) * (itemTaxPercent / 100);
      
      // Add the item to the sales order
      const newItem: SalesOrderItem = {
        id: `temp-${Date.now()}`,
        product_id: selectedProduct.id,
        product: selectedProduct,
        quantity: itemQuantity,
        unit_price: itemPrice,
        uom_id: selectedUOM ? (selectedUOM.id as number) : undefined,
        uom: selectedUOM || undefined,
        tax_percent: itemTaxPercent,
        tax_amount: itemTaxAmount,
        total_price: (itemQuantity * itemPrice) + itemTaxAmount
      };
      
      if (editingItemIndex >= 0) {
        // Update existing item
        const updatedItems = [...salesItems];
        updatedItems[editingItemIndex] = newItem;
        setSalesItems(updatedItems);
        setEditingItemIndex(-1);
      } else {
        // Add new item
        setSalesItems([...salesItems, newItem]);
      }
      
      // Reset form fields
      setSelectedProduct(null);
      setSelectedUOM(null);
      setItemQuantity(1);
      setItemPrice(0);
      setItemTaxPercent(0);
      setShowAddProductRow(false);
      setErrors({});
    }
  };

  // Remove item from sales order
  const handleRemoveItem = (index: number) => {
    const updatedItems = salesItems.filter((_, i) => i !== index);
    setSalesItems(updatedItems);
  };

  // Edit item in sales order
  const handleEditItem = (index: number) => {
    const item = salesItems[index];
    setSelectedProduct(item.product || null);
    setSelectedUOM(item.uom || null);
    setItemQuantity(item.quantity);
    setItemPrice(item.unit_price);
    setItemTaxPercent(item.tax_percent || 0);
    setEditingItemIndex(index);
    setShowAddProductRow(true);
    setErrors({});
    
    // Scroll to the add item form
    document.getElementById('add-item-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Cancel adding/editing item
  const handleCancelAddItem = () => {
    setSelectedProduct(null);
    setSelectedUOM(null);
    setItemQuantity(1);
    setItemPrice(0);
    setItemTaxPercent(0);
    setEditingItemIndex(-1);
    setShowAddProductRow(false);
    setErrors({});
  };

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors: Record<string, string> = {};
    
    if (!formData.contacts_id) {
      newErrors.contacts_id = 'Pelanggan harus dipilih';
    }
    
    if (!formData.order_date) {
      newErrors.order_date = 'Tanggal order harus diisi';
    }
    
    if (salesItems.length === 0) {
      newErrors.items = 'Minimal harus ada 1 item';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit the form
    onSubmit({
      ...formData,
      items: salesItems
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-6">
        <button
          type="button"
          onClick={onBack}
          className="mr-4 p-1 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold">
          {isEditing ? 'Edit Sales Order' : 'Buat Sales Order Baru'}
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="font-bold mb-3">Informasi Sales Order</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. Order
              </label>
              <input
                type="text"
                name="order_number"
                value={formData.order_number}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
                readOnly
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Order <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="order_date"
                value={typeof formData.order_date === 'string' ? formData.order_date.split('T')[0] : formData.order_date instanceof Date ? formData.order_date.toISOString().split('T')[0] : ''}
                onChange={handleChange}
                className={`border rounded px-3 py-2 w-full ${errors.order_date ? 'border-red-500' : ''}`}
                required
              />
              {errors.order_date && (
                <p className="text-red-500 text-xs mt-1">{errors.order_date}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Delivery Date
              </label>
              <input
                type="date"
                name="expected_delivery_date"
                value={formData.expected_delivery_date ? (typeof formData.expected_delivery_date === 'string' ? formData.expected_delivery_date.split('T')[0] : formData.expected_delivery_date instanceof Date ? formData.expected_delivery_date.toISOString().split('T')[0] : '') : ''}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status || 'draft'}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
              >
                {Object.entries(ORDER_STATUS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status Pembayaran
              </label>
              <select
                name="payment_status"
                value={formData.payment_status || 'unpaid'}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
              >
                {Object.entries(PAYMENT_STATUS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pelanggan <span className="text-red-500">*</span>
              </label>
              <select
                name="contacts_id"
                value={formData.contacts_id || ''}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
                required
              >
                <option value="">Pilih Pelanggan</option>
                {customers && Array.isArray(customers) && customers.length > 0 ? (
                  customers.map((contact: Contact) => (
                    <option key={contact.id} value={contact.id}>{contact.name}</option>
                  ))
                ) : (
                  <option value="" disabled>Tidak ada data pelanggan</option>
                )}
              </select>
              {errors.contacts_id && (
                <p className="text-red-500 text-xs mt-1">{errors.contacts_id}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catatan
              </label>
              <textarea
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
                rows={3}
              />
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-bold mb-3">Item Sales Order</h3>
          {errors.items && (
            <p className="text-red-500 text-sm mb-2">{errors.items}</p>
          )}
          
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b text-left">Produk</th>
                  <th className="py-2 px-4 border-b text-left">Deskripsi</th>
                  <th className="py-2 px-4 border-b text-right">Jumlah</th>
                  <th className="py-2 px-4 border-b text-left">Satuan</th>
                  <th className="py-2 px-4 border-b text-right">Harga</th>
                  <th className="py-2 px-4 border-b text-right">Pajak (%)</th>
                  <th className="py-2 px-4 border-b text-right">Total</th>
                  <th className="py-2 px-4 border-b text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {!salesItems || salesItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-4 text-center text-gray-500 border">
                      Belum ada item. Silakan tambahkan item.
                    </td>
                  </tr>
                ) : (
                  salesItems && salesItems.map((item, index) => {
                    const itemTotal = item.quantity * item.unit_price;
                    const itemTaxAmount = item.tax_amount || (itemTotal * (item.tax_percent || 0) / 100);
                    const totalWithTax = itemTotal + itemTaxAmount;
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">
                          {item.product?.name || 'N/A'}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {item.product?.description || '-'}
                        </td>
                        <td className="py-2 px-4 border-b text-right">{item.quantity}</td>
                        <td className="py-2 px-4 border-b">{item.uom?.name || '-'}</td>
                        <td className="py-2 px-4 border-b text-right">{formatCurrency(item.unit_price)}</td>
                        <td className="py-2 px-4 border-b text-right">{item.tax_percent || 0}%</td>
                        <td className="py-2 px-4 border-b text-right">{formatCurrency(totalWithTax)}</td>
                        <td className="py-2 px-4 border-b text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleEditItem(index)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
                
                {showAddProductRow && (
                  <tr id="add-item-form" className="bg-blue-50 border-l-4 border-blue-500">
                    <td className="py-2 px-4 border-b">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Product *</label>
                      <select
                        value={selectedProduct?.id || ''}
                        onChange={handleProductSelect}
                        className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${errors.product_id ? 'border-red-500' : ''}`}
                        required
                      >
                        <option value="">Pilih Produk</option>
                        {products && products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} - {formatCurrency(product.price || 0)}
                          </option>
                        ))}
                      </select>
                      {errors.product_id && (
                        <p className="text-red-500 text-xs mt-1">{errors.product_id}</p>
                      )}
                      {selectedProduct && (
                        <p className="text-xs text-gray-500 mt-1">
                          Stock: {selectedProduct.stock || 0} | Category: {selectedProduct.category}
                        </p>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div className="text-xs text-gray-600">
                        {selectedProduct?.description || 'Select product to see description'}
                      </div>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Qty *</label>
                      <input
                        type="number"
                        value={itemQuantity}
                        onChange={(e) => setItemQuantity(parseFloat(e.target.value) || 0)}
                        className={`w-full border border-gray-300 rounded-md px-3 py-2 text-right focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${errors.quantity ? 'border-red-500' : ''}`}
                        min="0.01"
                        step="0.01"
                        required
                      />
                      {errors.quantity && (
                        <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
                      <select
                        value={selectedUOM?.id || ''}
                        onChange={handleUOMSelect}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Pilih Satuan</option>
                        {uoms && uoms.map(uom => (
                          <option key={uom.id} value={uom.id}>
                            {uom.name} ({uom.code})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Price *</label>
                      <input
                        type="number"
                        value={itemPrice}
                        onChange={(e) => setItemPrice(parseFloat(e.target.value) || 0)}
                        className={`w-full border border-gray-300 rounded-md px-3 py-2 text-right focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${errors.unit_price ? 'border-red-500' : ''}`}
                        min="0"
                        step="0.01"
                        required
                      />
                      {errors.unit_price && (
                        <p className="text-red-500 text-xs mt-1">{errors.unit_price}</p>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Tax %</label>
                      <input
                        type="number"
                        value={itemTaxPercent}
                        onChange={(e) => setItemTaxPercent(parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-right focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    </td>
                    <td className="py-2 px-4 border-b text-right">
                      <div className="text-sm font-medium text-green-600">
                        {formatCurrency((itemQuantity * itemPrice) * (1 + itemTaxPercent / 100))}
                      </div>
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          type="button"
                          onClick={handleAddItem}
                          className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                          title={editingItemIndex >= 0 ? "Update" : "Tambah"}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelAddItem}
                          className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                          title="Batal"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {!showAddProductRow && (
            <button
              type="button"
              onClick={() => setShowAddProductRow(true)}
              className="mb-6 flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Plus size={16} />
              <span>Tambah Item</span>
            </button>
          )}
          
          <div className="flex justify-between items-end">
            <div className="w-64">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diskon
              </label>
              <input
                type="number"
                name="discount"
                value={discount}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Subtotal:</span>
                <span>{formatCurrency(subtotalAmount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total Pajak:</span>
                <span>{formatCurrency(taxAmount || 0)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="font-medium">Diskon:</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-bold">Total:</span>
                <span className="font-bold">{formatCurrency(formData.total_amount || 0)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isEditing ? 'Update Sales Order' : 'Simpan Sales Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SalesOrderForm;
