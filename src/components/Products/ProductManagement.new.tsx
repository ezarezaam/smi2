import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, AlertTriangle, X, Save, Grid, List, DollarSign, ShoppingCart, Info, Package, FileText } from '../icons';
import { ProductService } from '../../services/ProductService';
import { Product, ProductTransaction } from '../../models/Product';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../../utils/formatters';

const ProductManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table'); // Default tampilan tabel
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  // Loading state for API calls
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productTransactions, setProductTransactions] = useState<ProductTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'purchases' | 'sales'>('info');
  const [categories, setCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    stock: 0,
    min_stock: 0,
    purchase_price: 0,
    selling_price: 0,
    category: '',
    supplier: '',
    status: 'active'
  });

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
    // Extract unique categories from products
    const uniqueCategories = Array.from(new Set(products.map(product => product.category)));
    setCategories(uniqueCategories);
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await ProductService.getProducts();
      setProducts(data);
      // Extract unique categories
      const uniqueCategories = Array.from(new Set(data.map(product => product.category)));
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error('Gagal memuat data produk');
    }
  };

  const fetchProductTransactions = async (productId: string) => {
    try {
      const data = await ProductService.getProductTransactions(productId);
      setProductTransactions(data);
    } catch (err) {
      console.error('Error fetching product transactions:', err);
      toast.error('Gagal memuat riwayat transaksi produk');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;
    
    // Convert numeric fields to numbers
    if (['stock', 'min_stock', 'purchase_price', 'selling_price'].includes(name)) {
      parsedValue = value === '' ? 0 : Number(value);
    }
    
    setFormData({
      ...formData,
      [name]: parsedValue
    });
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ProductService.createProduct(formData as Product);
      toast.success('Produk berhasil ditambahkan');
      setShowAddModal(false);
      // Reset form
      setFormData({
        name: '',
        description: '',
        stock: 0,
        min_stock: 0,
        purchase_price: 0,
        selling_price: 0,
        category: '',
        supplier: '',
        status: 'active'
      });
      // Refresh products list
      fetchProducts();
    } catch (err) {
      console.error('Error adding product:', err);
      toast.error('Gagal menambahkan produk');
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    try {
      await ProductService.updateProduct(editingProduct.id, formData as Product);
      toast.success('Produk berhasil diperbarui');
      setShowEditModal(false);
      // Reset form and editing state
      setFormData({
        name: '',
        description: '',
        stock: 0,
        min_stock: 0,
        purchase_price: 0,
        selling_price: 0,
        category: '',
        supplier: '',
        status: 'active'
      });
      setEditingProduct(null);
      // Refresh products list
      fetchProducts();
    } catch (err) {
      console.error('Error updating product:', err);
      toast.error('Gagal memperbarui produk');
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      stock: product.stock,
      min_stock: product.min_stock,
      purchase_price: product.purchase_price,
      selling_price: product.selling_price,
      category: product.category,
      supplier: product.supplier,
      status: product.status
    });
    setShowEditModal(true);
  };

  const openDetailModal = (product: Product) => {
    setViewingProduct(product);
    setShowDetailModal(true);
    fetchProductTransactions(product.id);
    setActiveTab('info');
  };

  const openDeleteModal = (product: Product) => {
    setDeletingProduct(product);
    setShowDeleteModal(true);
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    
    try {
      await ProductService.deleteProduct(deletingProduct.id);
      toast.success('Produk berhasil dihapus');
      setShowDeleteModal(false);
      setDeletingProduct(null);
      // Refresh products list
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Gagal menghapus produk');
    }
  };

  // Filter products based on search term and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Function to handle view product (can be used for future functionality)
  const handleViewProduct = (product: Product) => {
    openDetailModal(product);
  };

  // Function to confirm delete
  const confirmDelete = () => {
    handleDeleteProduct();
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Tambah Produk</span>
        </button>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-md ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
            title="Tampilan Tabel"
          >
            <List className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`p-2 rounded-md ${viewMode === 'card' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
            title="Tampilan Kartu"
          >
            <Grid className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Cari produk..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <select
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">Semua Kategori</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Products Display - Card or Table View */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    product.stock <= product.min_stock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {product.stock <= product.min_stock ? 'Stok Rendah' : 'Stok Cukup'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Kategori:</span>
                    <span className="text-sm font-medium">{product.category}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Stok:</span>
                    <span className={`text-sm font-medium ${product.stock <= product.min_stock ? 'text-red-600' : ''}`}>
                      {product.stock}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Harga Beli:</span>
                    <span className="text-sm font-medium">{formatCurrency(product.purchase_price)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Harga Jual:</span>
                    <span className="text-sm font-medium">{formatCurrency(product.selling_price)}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between">
                <button
                  onClick={() => openDetailModal(product)}
                  className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                >
                  <Info className="h-4 w-4 mr-1" />
                  Detail
                </button>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => openEditModal(product)}
                    className="text-yellow-600 hover:text-yellow-800 flex items-center text-sm"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => openDeleteModal(product)}
                    className="text-red-600 hover:text-red-800 flex items-center text-sm"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Produk</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Beli</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Jual</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">{product.category}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.stock <= product.min_stock 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">{formatCurrency(product.purchase_price)}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{formatCurrency(product.selling_price)}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => openDetailModal(product)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Detail"
                      >
                        <Info className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openEditModal(product)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Edit"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(product)}
                        className="text-red-600 hover:text-red-900"
                        title="Hapus"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* No Products Message */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-10">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada produk</h3>
          <p className="mt-1 text-sm text-gray-500">
            Tidak ada produk yang ditemukan dengan filter yang dipilih.
          </p>
        </div>
      )}
      
      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tambah Produk Baru</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Produk
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori
                  </label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                    Stok
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="min_stock" className="block text-sm font-medium text-gray-700 mb-1">
                    Stok Minimum
                  </label>
                  <input
                    type="number"
                    id="min_stock"
                    name="min_stock"
                    required
                    min="0"
                    value={formData.min_stock}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="purchase_price" className="block text-sm font-medium text-gray-700 mb-1">
                    Harga Beli
                  </label>
                  <input
                    type="number"
                    id="purchase_price"
                    name="purchase_price"
                    required
                    min="0"
                    value={formData.purchase_price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="selling_price" className="block text-sm font-medium text-gray-700 mb-1">
                    Harga Jual
                  </label>
                  <input
                    type="number"
                    id="selling_price"
                    name="selling_price"
                    required
                    min="0"
                    value={formData.selling_price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier
                  </label>
                  <input
                    type="text"
                    id="supplier"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    required
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Tidak Aktif</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Save className="h-5 w-5 mr-1" />
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Produk</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProduct(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleEditProduct} className="space-y-4">
              {/* Form fields similar to Add Product Modal */}
              {/* ... */}
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Save className="h-5 w-5 mr-1" />
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Detail Product Modal */}
      {showDetailModal && viewingProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Detail Produk</h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setViewingProduct(null);
                  setProductTransactions([]);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Info */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-blue-600" />
                  Informasi Produk
                </h4>
                
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">Nama Produk</h5>
                    <p className="text-base font-medium">{viewingProduct.name}</p>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">Deskripsi</h5>
                    <p className="text-sm">{viewingProduct.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Kategori</h5>
                      <p className="text-sm">{viewingProduct.category}</p>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Supplier</h5>
                      <p className="text-sm">{viewingProduct.supplier || '-'}</p>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Stok Saat Ini</h5>
                      <p className={`text-sm font-medium ${viewingProduct.stock <= viewingProduct.min_stock ? 'text-red-600' : 'text-green-600'}`}>
                        {viewingProduct.stock} {viewingProduct.stock <= viewingProduct.min_stock && '(Rendah)'}
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Stok Minimum</h5>
                      <p className="text-sm">{viewingProduct.min_stock}</p>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Harga Beli</h5>
                      <p className="text-sm font-medium">{formatCurrency(viewingProduct.purchase_price)}</p>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Harga Jual</h5>
                      <p className="text-sm font-medium">{formatCurrency(viewingProduct.selling_price)}</p>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Status</h5>
                      <p className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        viewingProduct.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {viewingProduct.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Transaction History */}
              <div className="space-y-4">
                <div className="flex space-x-2 border-b">
                  <button
                    onClick={() => setActiveTab('purchases')}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === 'purchases' 
                        ? 'text-blue-600 border-b-2 border-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4 inline mr-1" />
                    Riwayat Pembelian
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('sales')}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === 'sales' 
                        ? 'text-blue-600 border-b-2 border-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    Riwayat Penjualan
                  </button>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  {activeTab === 'purchases' && (
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3">Riwayat Pembelian</h4>
                      
                      {productTransactions.filter(t => t.type === 'purchase').length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {productTransactions
                                .filter(t => t.type === 'purchase')
                                .map((transaction, index) => (
                                  <tr key={index} className="hover:bg-gray-100">
                                    <td className="px-3 py-2 text-sm text-gray-500">
                                      {new Date(transaction.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-500">{transaction.quantity}</td>
                                    <td className="px-3 py-2 text-sm text-gray-500">{formatCurrency(transaction.price)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-500">{transaction.vendor || '-'}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <FileText className="mx-auto h-8 w-8 text-gray-400" />
                          <p className="mt-1 text-sm text-gray-500">Tidak ada riwayat pembelian</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'sales' && (
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3">Riwayat Penjualan</h4>
                      
                      {productTransactions.filter(t => t.type === 'sale').length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {productTransactions
                                .filter(t => t.type === 'sale')
                                .map((transaction, index) => (
                                  <tr key={index} className="hover:bg-gray-100">
                                    <td className="px-3 py-2 text-sm text-gray-500">
                                      {new Date(transaction.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-500">{transaction.quantity}
                                    <td className="px-3 py-2 text-sm text-gray-500">{transaction.quantity}</td>
                                    <td className="px-3 py-2 text-sm text-gray-500">{formatCurrency(transaction.price)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-500">{transaction.customer_name || '-'}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <FileText className="mx-auto h-8 w-8 text-gray-400" />
                          <p className="mt-1 text-sm text-gray-500">Tidak ada riwayat penjualan</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={closeDetailModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default ProductManagement;