import React, { useState, useEffect } from 'react';
import { PurchaseOrder, PurchaseOrderItem, PURCHASE_ORDER_STATUS, PAYMENT_STATUS } from '../../models/PurchaseOrder';
import { UOM } from '../../models/UOM';
import { UOMService } from '../../services/UOMService';
import { Contact } from '../../models/Contact';
import { ProductService } from '../../services/ProductService';
import { Product } from '../../models/Product';
import { PurchaseOrderService } from '../../services/PurchaseOrderService';
import { ContactService } from '../../services/ContactService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, X, Edit, ArrowLeft, Eye, Filter } from 'lucide-react';

const PurchaseManagement: React.FC = () => {
  // State for purchase orders data
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for vendors and products
  const [vendors, setVendors] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // State for selected purchase order
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseOrder | null>(null);
  
  // State for UI modes
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'add' | 'edit'>('list');
  
  // State for modals
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // State for form data
  const [formData, setFormData] = useState<PurchaseOrder>({
    order_number: '',
    contacts_id: '',
    total_amount: 0,
    order_date: new Date().toISOString().split('T')[0],
    status: 'draft',
    payment_status: 'unpaid',
    payment_method: '',
    notes: ''
  });
  
  // State for purchase items in form
  const [purchaseItems, setPurchaseItems] = useState<PurchaseOrderItem[]>([]);
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [itemPrice, setItemPrice] = useState<number>(0);
  const [itemTaxPercent, setItemTaxPercent] = useState<number>(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedUOM, setSelectedUOM] = useState<UOM | null>(null);
  const [showAddProductRow, setShowAddProductRow] = useState<boolean>(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [uoms, setUOMs] = useState<UOM[]>([]);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  // Use services directly as objects
  const purchaseOrderService = PurchaseOrderService;
  const contactService = ContactService;
  const productService = ProductService;
  const uomService = UOMService;

  // Load products, vendors, and UOMs on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: productsData } = await productService.getAll();
        if (productsData) setProducts(productsData);
        
        // Ambil data vendor (kontak dengan type 2 dan 3)
        const { data: contactsData } = await contactService.getAll();
        if (contactsData) {
          // Filter kontak dengan type 2 (vendor) dan 3 (both)
          const vendorContacts = contactsData.filter(contact => contact.type === 2 || contact.type === 3);
          console.log('Loaded Vendors:', vendorContacts);
          setVendors(vendorContacts);
        }
        
        const { data: uomsData } = await uomService.getAll();
        if (uomsData) {
          console.log('Loaded UOMs:', uomsData);
          setUOMs(uomsData);
        }
        
        // Load purchase orders if in list mode
        if (viewMode === 'list') {
          await loadPurchaseOrders();
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
      }
    };
    
    loadData();
  }, [viewMode]);
  
  // Filter purchase orders based on search and filters
  const getFilteredPurchaseOrders = () => {
    return purchaseOrders.filter(po => {
      // Filter by search query
      const matchesSearch = searchTerm === '' || 
        po.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by status
      const matchesStatus = filterStatus === '' || po.status === filterStatus;
      
      // Filter by payment status
      const matchesPaymentStatus = filterPaymentStatus === '' || po.payment_status === filterPaymentStatus;
      
      return matchesSearch && matchesStatus && matchesPaymentStatus;
    });
  };

  // Get filtered purchase orders for rendering
  const filteredOrders = getFilteredPurchaseOrders();

  // Load purchase orders from API
  const loadPurchaseOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await purchaseOrderService.getAll();
      
      if (error) {
        throw new Error(error.message);
      }
      
      setPurchaseOrders(data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error loading purchase orders: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Reset form data
  const resetForm = () => {
    // Generate auto-increment PO number
    const generatedOrderNumber = purchaseOrderService.generateOrderNumber();
    
    setFormData({
      order_number: generatedOrderNumber,
      contacts_id: '',
      total_amount: 0,
      order_date: new Date().toISOString().split('T')[0],
      status: 'draft',
      payment_status: 'unpaid',
      payment_method: '',
      notes: ''
    });
    setPurchaseItems([]);
    setSelectedProduct(null);
    setSelectedUOM(null);
    setItemQuantity(1);
    setItemPrice(0);
    setItemTaxPercent(0);
  };

  // Handle edit purchase order
  const handleEditOrder = async (orderId: string) => {
    try {
      const { data } = await purchaseOrderService.getById(orderId);
      if (!data) {
        toast.error('Purchase order not found');
        return;
      }
      
      // Set form data
      setFormData(data);
      
      // Set purchase items
      setPurchaseItems(data.items || []);
      
      // Set current order ID
      setCurrentOrderId(orderId);
      
      // Switch to form view
      setViewMode('edit');
    } catch (error) {
      console.error('Error loading purchase order:', error);
      toast.error('Failed to load purchase order');
    }
  };

  // Handle view purchase order details
  const handleViewDetail = async (purchase: PurchaseOrder) => {
    try {
      if (purchase && purchase.id) {
        console.log('Fetching purchase order with ID:', purchase.id);
        const { data, error } = await purchaseOrderService.getById(purchase.id);
        
        if (error) {
          console.error('Error from service:', error);
        }
        
        if (data) {
          console.log('Purchase order data:', data);
          console.log('Purchase order items:', data.items);
          
          // Pastikan items adalah array
          if (!data.items) {
            data.items = [];
          }
          
          // Debugging untuk memeriksa struktur data
          console.log('Items count:', data.items.length);
          if (data.items.length > 0) {
            console.log('First item:', data.items[0]);
          }
          
          // Gunakan data yang diambil dari server
          setSelectedPurchase(data);
        } else {
          // Fallback ke data yang diberikan sebagai parameter
          console.log('Using provided purchase data:', purchase);
          // Pastikan purchase memiliki items array
          if (!purchase.items) {
            purchase.items = [];
          }
          setSelectedPurchase({...purchase});
        }
      } else {
        // Jika tidak ada ID, gunakan data yang diberikan
        if (!purchase.items) {
          purchase.items = [];
        }
        setSelectedPurchase({...purchase});
      }
      
      setViewMode('detail');
    } catch (error) {
      console.error('Error viewing purchase order:', error);
      toast.error('Failed to load purchase order details');
      // Fallback ke data yang diberikan sebagai parameter
      if (!purchase.items) {
        purchase.items = [];
      }
      setSelectedPurchase({...purchase});
      setViewMode('detail');
    }
  };

  // Handle delete purchase order
  const handleDelete = (purchase: PurchaseOrder) => {
    setSelectedPurchase(purchase);
    setShowDeleteModal(true);
  };

  // Confirm delete purchase order
  const confirmDelete = async () => {
    if (!selectedPurchase?.id) return;
    
    try {
      const { error } = await purchaseOrderService.delete(selectedPurchase.id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      setPurchaseOrders(purchaseOrders.filter(po => po.id !== selectedPurchase.id));
      toast.success('Purchase order deleted successfully');
    } catch (err: any) {
      toast.error(`Error deleting purchase order: ${err.message}`);
    } finally {
      setShowDeleteModal(false);
      setSelectedPurchase(null);
    }
  };

  // Handle add new purchase order
  const handleAdd = () => {
    resetForm();
    setViewMode('add');
  };

  // Handle back to list
  const handleBackToList = () => {
    setViewMode('list');
    setSelectedPurchase(null);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Prepare purchase order data with proper date handling
      const purchaseOrderData: PurchaseOrder = {
        ...formData,
        order_date: typeof formData.order_date === 'string' ? formData.order_date : formData.order_date.toISOString().split('T')[0],
        expected_delivery_date: formData.expected_delivery_date ? 
          (typeof formData.expected_delivery_date === 'string' ? 
            formData.expected_delivery_date : 
            formData.expected_delivery_date.toISOString().split('T')[0]) : 
          undefined,
        received_date: formData.received_date ? 
          (typeof formData.received_date === 'string' ? 
            formData.received_date : 
            formData.received_date.toISOString().split('T')[0]) : 
          undefined,
        items: purchaseItems,
        total_amount: purchaseItems.reduce((sum, item) => sum + item.total_price, 0)
      };
      
      if (currentOrderId) {
        // Update existing purchase order
        await purchaseOrderService.update(currentOrderId, purchaseOrderData);
        toast.success('Purchase order updated successfully');
      } else {
        // Create new purchase order
        await purchaseOrderService.create(purchaseOrderData);
        toast.success('Purchase order created successfully');
      }
      
      // Reset form and go back to list view
      resetForm();
      setViewMode('list');
      await loadPurchaseOrders();
    } catch (error) {
      console.error('Error saving purchase order:', error);
      toast.error('Failed to save purchase order');
    }
  };

  // Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Calculate tax amount and total price for an item
  const calculateItemTotals = (quantity: number, unitPrice: number, taxPercent: number) => {
    const subtotal = quantity * unitPrice;
    const taxAmount = subtotal * (taxPercent / 100);
    const totalPrice = subtotal + taxAmount;
    return { subtotal, taxAmount, totalPrice };
  };

  // Handle add or update item in purchase order
  const handleAddItem = () => {
    if (!selectedProduct) return;
    
    // Calculate tax amount and total price
    const { taxAmount, totalPrice } = calculateItemTotals(itemQuantity, itemPrice, itemTaxPercent);
    
    // Create new item with UOM
    const newItem: PurchaseOrderItem = {
      product_id: selectedProduct.id,
      product: selectedProduct,
      quantity: itemQuantity,
      uom_id: selectedUOM?.id,  // This will be undefined if selectedUOM is null
      uom: selectedUOM || undefined,
      unit_price: itemPrice,
      tax_percent: itemTaxPercent,
      tax_amount: taxAmount,
      discount: 0,
      total_price: totalPrice
    };
    
    if (editingItemIndex !== null) {
      // Update existing item
      const oldItem = purchaseItems[editingItemIndex];
      const updatedItems = [...purchaseItems];
      updatedItems[editingItemIndex] = newItem;
      setPurchaseItems(updatedItems);
      
      // Update total amount (subtract old price, add new price)
      setFormData(prev => ({
        ...prev,
        total_amount: (prev.total_amount || 0) - oldItem.total_price + newItem.total_price
      }));
      
      // Reset editing state
      setEditingItemIndex(null);
    } else {
      // Add new item
      setPurchaseItems([...purchaseItems, newItem]);
      
      // Update total amount
      setFormData(prev => ({
        ...prev,
        total_amount: (prev.total_amount || 0) + newItem.total_price
      }));
    }
    
    // Reset form
    setSelectedProduct(null);
    setSelectedUOM(null);
    setItemQuantity(1);
    setItemPrice(0);
    setItemTaxPercent(0);
  };

  // Handle remove item from purchase order
  const handleRemoveItem = (index: number) => {
    const removedItem = purchaseItems[index];
    const newItems = [...purchaseItems];
    newItems.splice(index, 1);
    setPurchaseItems(newItems);
    
    // Update total amount
    setFormData(prev => ({
      ...prev,
      total_amount: (prev.total_amount || 0) - removedItem.total_price
    }));
  };

  // Handle edit item in purchase order
  const handleEditItem = (index: number) => {
    const itemToEdit = purchaseItems[index];
    setSelectedProduct(itemToEdit.product || null);
    
    // Handle UOM properly when editing
    if (itemToEdit.uom) {
      // Make sure we have the UOM object with the correct ID type
      const uomObject = uoms.find(u => u.id === itemToEdit.uom_id);
      setSelectedUOM(uomObject || itemToEdit.uom);
    } else {
      setSelectedUOM(null);
    }
    
    setItemQuantity(itemToEdit.quantity);
    setItemPrice(itemToEdit.unit_price);
    setItemTaxPercent(itemToEdit.tax_percent || 0);
    setEditingItemIndex(index);
    setShowAddProductRow(true);
  };

  // Additional filtering logic can be added here if needed

  // Render purchase order list
  const renderPurchaseOrderList = () => (
    <div className="space-y-4">
      {/* Search and filter controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Cari purchase order..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
          
          <button
            onClick={handleAdd}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah PO
          </button>
        </div>
      </div>
      
      {/* Filter options */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Status</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PURCHASE_ORDER_STATUS).map(([key, label]) => (
                  <label key={key} className="inline-flex items-center">
                    <input
                      type="radio"
                      name="filterStatus"
                      value={key}
                      checked={filterStatus === key}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Status Pembayaran</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PAYMENT_STATUS).map(([key, label]) => (
                  <label key={key} className="inline-flex items-center">
                    <input
                      type="radio"
                      name="filterPaymentStatus"
                      value={key}
                      checked={filterPaymentStatus === key}
                      onChange={(e) => setFilterPaymentStatus(e.target.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Purchase orders table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                No. PO
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vendor
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pembayaran
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  {error ? `Error: ${error}` : 'Tidak ada data purchase order yang ditemukan'}
                </td>
              </tr>
            ) : (
              filteredOrders.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {po.order_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {po.contact?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(typeof po.order_date === 'string' ? po.order_date : po.order_date.toString())}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(po.total_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${po.status === 'draft' ? 'bg-gray-100 text-gray-800' : 
                        po.status === 'ordered' ? 'bg-blue-100 text-blue-800' : 
                        po.status === 'received' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {PURCHASE_ORDER_STATUS[po.status || 'draft']}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${po.payment_status === 'unpaid' ? 'bg-red-100 text-red-800' : 
                        po.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'}`}>
                      {PAYMENT_STATUS[po.payment_status || 'unpaid']}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewDetail(po)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Lihat Detail"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEditOrder(po.id || '')}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Edit"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(po)}
                        className="text-red-600 hover:text-red-900"
                        title="Hapus"
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

  // Render purchase order detail
  const renderPurchaseOrderDetail = () => {
    if (!selectedPurchase) return null;
    
    return (
      <div className="p-6">
        <button 
          className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
          onClick={handleBackToList}
        >
          <ArrowLeft className="h-5 w-5 mr-1" /> Kembali ke Daftar Purchase Order
        </button>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Detail Purchase Order: {selectedPurchase.order_number}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-medium text-gray-700">Informasi Umum</h3>
              <div className="mt-2 space-y-2">
                <p><span className="font-medium">Vendor:</span> {selectedPurchase.contact?.name || '-'}</p>
                <p><span className="font-medium">Tanggal Order:</span> {formatDate(selectedPurchase.order_date)}</p>
                <p><span className="font-medium">Status:</span> {PURCHASE_ORDER_STATUS[selectedPurchase.status || 'draft']}</p>
                <p><span className="font-medium">Total:</span> {formatCurrency(selectedPurchase.total_amount)}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700">Informasi Pembayaran</h3>
              <div className="mt-2 space-y-2">
                <p><span className="font-medium">Status Pembayaran:</span> {PAYMENT_STATUS[selectedPurchase.payment_status || 'unpaid']}</p>
                <p><span className="font-medium">Metode Pembayaran:</span> {selectedPurchase.payment_method || '-'}</p>
                <p><span className="font-medium">Tanggal Pengiriman:</span> {formatDate(selectedPurchase.expected_delivery_date)}</p>
                <p><span className="font-medium">Tanggal Diterima:</span> {formatDate(selectedPurchase.received_date)}</p>
              </div>
            </div>
          </div>
          
          <h3 className="font-medium text-gray-700 mb-2">Daftar Barang</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produk
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Satuan
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harga Satuan
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pajak (%)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Rendering items in detail view */}
                {selectedPurchase?.items && Array.isArray(selectedPurchase.items) && selectedPurchase.items.length > 0 ? (
                  selectedPurchase.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.product?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.uom?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.tax_percent ? `${item.tax_percent}%` : '0%'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(item.total_price)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      Tidak ada data item
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {selectedPurchase.notes && (
            <div className="mt-4">
              <h3 className="font-medium text-gray-700 mb-2">Catatan</h3>
              <p className="text-sm text-gray-600">{selectedPurchase.notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render purchase order form
  const renderPurchaseOrderForm = () => {
    return (
      <div className="p-6">
        <button 
          className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
          onClick={handleBackToList}
        >
          <ArrowLeft className="h-5 w-5 mr-1" /> Kembali ke Daftar Purchase Order
        </button>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">
            {viewMode === 'add' ? 'Tambah Purchase Order Baru' : 'Edit Purchase Order'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nomor PO
                  </label>
                  <input
                    type="text"
                    name="order_number"
                    value={formData.order_number || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                    disabled
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Vendor
                  </label>
                  <select
                    name="contacts_id"
                    value={formData.contacts_id || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Pilih Vendor</option>
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tanggal Order
                  </label>
                  <input
                    type="date"
                    name="order_date"
                    value={typeof formData.order_date === 'string' ? formData.order_date.split('T')[0] : formData.order_date instanceof Date ? formData.order_date.toISOString().split('T')[0] : ''}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tanggal Pengiriman (Estimasi)
                  </label>
                  <input
                    type="date"
                    name="expected_delivery_date"
                    value={formData.expected_delivery_date 
                      ? typeof formData.expected_delivery_date === 'string' 
                        ? formData.expected_delivery_date.split('T')[0] 
                        : formData.expected_delivery_date instanceof Date 
                          ? formData.expected_delivery_date.toISOString().split('T')[0]
                          : '' 
                      : ''}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status || 'draft'}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    {Object.entries(PURCHASE_ORDER_STATUS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status Pembayaran
                  </label>
                  <select
                    name="payment_status"
                    value={formData.payment_status || 'unpaid'}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    {Object.entries(PAYMENT_STATUS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Metode Pembayaran
                  </label>
                  <input
                    type="text"
                    name="payment_method"
                    value={formData.payment_method || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Catatan
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900">Daftar Barang</h3>
              
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (editingItemIndex !== null) {
                      // Cancel editing
                      setEditingItemIndex(null);
                      setSelectedProduct(null);
                      setSelectedUOM(null);
                      setItemQuantity(1);
                      setItemPrice(0);
                      setItemTaxPercent(0);
                      setShowAddProductRow(false);
                    } else {
                      // Toggle add product row
                      setShowAddProductRow(!showAddProductRow);
                      setSelectedProduct(null);
                      setSelectedUOM(null);
                      setItemQuantity(1);
                      setItemPrice(0);
                      setItemTaxPercent(0);
                    }
                  }}
                  className="mb-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-5 w-5 mr-2" /> {editingItemIndex !== null ? 'Cancel Edit' : 'Add Product'}
                </button>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Produk
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Jumlah
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Satuan
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Harga Satuan
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pajak (%)
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* Input row for adding new items */}
                      {showAddProductRow && (
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <select
                              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={selectedProduct?.id || ''}
                              onChange={(e) => {
                                const product = products.find(p => p.id === e.target.value) || null;
                                setSelectedProduct(product || null);
                                if (product) {
                                  setItemPrice(product.buy_price || product.price || 0);
                                }
                              }}
                            >
                              <option value="">Pilih Produk</option>
                              {products.map(product => (
                                <option key={product.id || ''} value={product.id || ''}>
                                  {product.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <input
                              type="number"
                              min="1"
                              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={itemQuantity}
                              onChange={(e) => setItemQuantity(parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <select
                              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={selectedUOM?.id?.toString() || ''}
                              onChange={(e) => {
                                if (e.target.value) {
                                  // Find the UOM by ID
                                  const selectedId = parseInt(e.target.value);
                                  const selectedUomObject = uoms.find(u => u.id === selectedId);
                                  if (selectedUomObject) {
                                    setSelectedUOM(selectedUomObject);
                                  } else {
                                    console.error(`UOM with ID ${selectedId} not found`);
                                    setSelectedUOM(null);
                                  }
                                } else {
                                  setSelectedUOM(null);
                                }
                              }}
                            >
                              <option value="">Pilih Satuan</option>
                              {uoms.map(uom => (
                                <option key={uom.id?.toString()} value={uom.id?.toString()}>
                                  {uom.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={itemPrice}
                              onChange={(e) => setItemPrice(parseFloat(e.target.value) || 0)}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-8"
                                value={itemTaxPercent}
                                onChange={(e) => setItemTaxPercent(parseFloat(e.target.value) || 0)}
                              />
                              <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                                %
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(calculateItemTotals(itemQuantity, itemPrice, itemTaxPercent).totalPrice)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={() => {
                                  handleAddItem();
                                  if (selectedProduct) {
                                    setShowAddProductRow(false);
                                  }
                                }}
                                disabled={!selectedProduct}
                                className="inline-flex justify-center py-2 px-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                              >
                                <Plus className="h-5 w-5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowAddProductRow(false);
                                  setEditingItemIndex(null);
                                  setSelectedProduct(null);
                                  setSelectedUOM(null);
                                  setItemQuantity(1);
                                  setItemPrice(0);
                                  setItemTaxPercent(0);
                                }}
                                className="inline-flex justify-center py-2 px-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                      
                      {/* Added items */}
                      {purchaseItems.length > 0 ? (
                        purchaseItems.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.product?.name || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.uom?.name || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(item.unit_price)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.tax_percent}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(item.total_price)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditItem(index)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <Edit className="h-5 w-5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(index)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                            Belum ada barang. Klik tombol Add Product untuk menambahkan.
                          </td>
                        </tr>
                      )}
                  </tbody>
                  <tfoot>
  <tr>
    <td colSpan={7} className="pt-4">
      <div
        className="grid text-sm"
        style={{
          gridTemplateColumns: 'minmax(90px,auto) minmax(90px,auto)',
          justifyContent: 'end',
          marginLeft: 'auto',
          width: 'max-content',
          minWidth: '200px', // lebih kecil agar lebih rapat
        }}
      >
        <div className="flex flex-col items-end text-right pr-1">
          <span className="font-medium text-gray-900">Untaxed Amount:</span>
          <span className="font-medium text-gray-900">Taxes:</span>
          <span className="font-medium text-gray-900 mt-1">Total:</span>
        </div>
        <div className="flex flex-col items-end text-right">
          <span className="text-gray-900">{formatCurrency(purchaseItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0))}</span>
          <span className="text-gray-900">{formatCurrency(purchaseItems.reduce((sum, item) => sum + (item.tax_amount || 0), 0))}</span>
          <span className="text-gray-900 font-bold mt-1">{formatCurrency(purchaseItems.reduce((sum, item) => sum + item.total_price, 0))}</span>
        </div>
      </div>
    </td>
  </tr>
</tfoot>
                </table>
              </div>
            </div>
          </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleBackToList}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {viewMode === 'add' ? 'Simpan' : 'Update'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Delete confirmation modal
  const renderDeleteModal = () => {
    if (!showDeleteModal) return null;
    
    return (
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
          
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Hapus Purchase Order
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Apakah Anda yakin ingin menghapus purchase order ini? Tindakan ini tidak dapat dibatalkan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={confirmDelete}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Hapus
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manajemen Purchase Order</h1>
      
      {viewMode === 'list' && renderPurchaseOrderList()}
      {viewMode === 'detail' && renderPurchaseOrderDetail()}
      {(viewMode === 'add' || viewMode === 'edit') && renderPurchaseOrderForm()}
      
      {renderDeleteModal()}
    </div>
  );
};

export default PurchaseManagement;