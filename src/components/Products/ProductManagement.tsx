import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Plus, Search, Filter, Edit, Trash2, AlertTriangle, X, Save, Grid, List, DollarSign, ShoppingCart, Info, Package, FileText } from '../icons';
import { ProductService } from '../../services/ProductService';
import { Product, ProductTransaction } from '../../models/Product';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../../utils/formatters';

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productTransactions, setProductTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'transactions' | 'purchases' | 'sales'>('info');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  
  // Dropdown options state
  const [uomOptions, setUomOptions] = useState<{name: string}[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<{name: string}[]>([]);
  const [groupOptions, setGroupOptions] = useState<{name: string}[]>([]);
  const [categories, setCategories] = useState<string[]>(['all']);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  // Helper function to determine stock status with color and background properties
  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= 0) return {
      status: 'out-of-stock',
      color: 'text-red-600',
      bg: 'bg-red-100'
    };
    if (stock <= minStock) return {
      status: 'low',
      color: 'text-yellow-600',
      bg: 'bg-yellow-100'
    };
    return {
      status: 'normal',
      color: 'text-green-600',
      bg: 'bg-green-100'
    };
  };

  // Function to fetch product transactions
  const fetchProductTransactions = async (productId: string) => {
    try {
      // Placeholder for actual transaction fetching logic
      // This would typically be a call to your backend service
      setProductTransactions([]);
    } catch (error) {
      console.error('Error fetching product transactions:', error);
      setProductTransactions([]);
    }
  };

  // Filter products based on search term and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    uom_name: '',
    category: '',
    group: '',
    image_url: '',
    status_aktif: 1 // Default to active
  });
  
  // Fetch products from Supabase
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        // Fetch UOM options
        const { data: uomData, error: uomError } = await supabase
          .from('m_uom')
          .select('name')
          .order('name', { ascending: true });
        
        // Fetch Category options
        const { data: categoryData, error: categoryError } = await supabase
          .from('m_product_category')
          .select('name')
          .order('name', { ascending: true });
        
        // Fetch Group options
        const { data: groupData, error: groupError } = await supabase
          .from('m_product_group')
          .select('name')
          .order('name', { ascending: true });
        
        if (uomError || categoryError || groupError) {
          throw new Error('Gagal memuat data dropdown');
        }
        
        setUomOptions(uomData || []);
        setCategoryOptions(categoryData || []);
        setGroupOptions(groupData || []);
      } catch (err) {
        setError('Gagal memuat data dropdown: ' + (err as Error).message);
      }
    };

    fetchProducts();
    fetchDropdownOptions();
  }, []);
  
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await ProductService.getAll();
      if (error) {
        toast.error('Gagal memuat data produk');
        console.error('Error fetching products:', error);
      } else if (data) {
        setProducts(data);
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(data.map(product => product.category).filter(Boolean)));
        setCategories(['all', ...uniqueCategories as string[]]);
      }
    } catch (err) {
      toast.error('Terjadi kesalahan saat memuat data');
      console.error('Exception when fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      description: '',
      price: 0,
      stock: 0,
      uom_name: '',
      category: '',
      group: '',
      image_url: ''
    });
  };

  const handleAdd = async () => {
    try {
      const { data, error } = await ProductService.create(formData as Product);
      if (error) {
        toast.error('Gagal menambahkan produk');
        console.error('Error adding product:', error);
      } else {
        toast.success('Produk berhasil ditambahkan');
        fetchProducts();
        setShowAddModal(false);
        resetForm();
      }
    } catch (err) {
      toast.error('Terjadi kesalahan saat menambahkan produk');
      console.error('Exception when adding product:', err);
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      id: product.id,
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      price: product.price || 0,
      stock: product.stock || 0,
      uom_name: product.uom_name || '',
      category: product.category || '',
      group: product.group || '',
      image_url: product.image_url || ''
    });
    setShowEditModal(true);
    setEditingProduct(product);
  };

  const handleUpdate = async () => {
    if (!editingProduct || !editingProduct.id) return;
    
    try {
      const { error } = await ProductService.update(editingProduct.id, formData);
      if (error) {
        toast.error('Gagal mengupdate produk');
        console.error('Error updating product:', error);
      } else {
        toast.success('Produk berhasil diupdate');
        fetchProducts();
        setShowEditModal(false);
        setEditingProduct(null);
        resetForm();
      }
    } catch (err) {
      toast.error('Terjadi kesalahan saat mengupdate produk');
      console.error('Exception when updating product:', err);
    }
  };

  const handleDelete = (product: Product) => {
    setDeletingProduct(product);
    setShowDeleteModal(true);
  };
  
  const handleViewProduct = (product: Product) => {
    setViewingProduct(product);
    setActiveTab('info');
    setShowDetailModal(true);
    
    // If the product has an ID, fetch its transaction history
    if (product.id) {
      fetchProductTransactions(product.id);
    }
  };

  const confirmDelete = async () => {
    if (!deletingProduct || !deletingProduct.id) return;
    
    try {
      const { error } = await ProductService.delete(deletingProduct.id);
      if (error) {
        toast.error('Gagal menghapus produk');
        console.error('Error deleting product:', error);
      } else {
        toast.success('Produk berhasil dihapus');
        fetchProducts();
        setShowDeleteModal(false);
        setDeletingProduct(null);
      }
    } catch (err) {
      toast.error('Terjadi kesalahan saat menghapus produk');
      console.error('Exception when deleting product:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Produk</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari produk atau kode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Toggle View Mode */}
            <div className="flex bg-gray-100 rounded-md p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded ${viewMode === 'table' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'} flex items-center space-x-1`}
              >
                <List className="h-4 w-4" />
                <span className="text-sm">List</span>
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`px-3 py-1 rounded ${viewMode === 'card' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'} flex items-center space-x-1`}
              >
                <Grid className="h-4 w-4" />
                <span className="text-sm">Card</span>
              </button>
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'Semua Kategori' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Display - Card or Table View */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const profitMargin = '30.0'; // Fixed margin value since buy_price is removed
            
            return (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-w-16 aspect-h-9">
                  <img 
                    src={product.image_url || 'https://via.placeholder.com/400x200?text=No+Image'} 
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.id}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {product.category}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${product.status_aktif === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.status_aktif === 1 ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Harga:</span>
                      <span className="font-medium text-green-600">{formatCurrency(product.price || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Margin:</span>
                      <span className="font-medium text-green-600">{profitMargin}%</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEdit(product)}
                      className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-md hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(product)}
                      className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-md hover:bg-red-100 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Produk</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                // Stock status removed
                const profitMargin = '30.0'; // Fixed margin value since buy_price is removed
                
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full object-cover" src={product.image_url || 'https://via.placeholder.com/40?text=No+Image'} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{product.uom_name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{product.group}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.status_aktif === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.status_aktif === 1 ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-green-600">{formatCurrency(product.price || 0)}</div>
                      <div className="text-xs text-green-500">Margin: {profitMargin}%</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Tidak ada produk yang ditemukan</p>
          <p className="text-gray-400 text-sm mt-2">Coba ubah filter atau tambah produk baru</p>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tambah Produk Baru</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Produk *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Masukkan nama produk"
                  />
                </div>
                
                <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    UOM *
  </label>
  <select
    value={formData.uom_name}
    onChange={(e) => setFormData({...formData, uom_name: e.target.value})}
    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
    required
  >
    <option value="">Pilih UOM</option>
    {uomOptions.map((uom) => (
      <option key={uom.name} value={uom.name}>{uom.name}</option>
    ))}
  </select>
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Kategori *
  </label>
  <select
    value={formData.category}
    onChange={(e) => setFormData({...formData, category: e.target.value})}
    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
    required
  >
    <option value="">Pilih Kategori</option>
    {categoryOptions.map((category) => (
      <option key={category.name} value={category.name}>{category.name}</option>
    ))}
  </select>
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Group
  </label>
  <select
    value={formData.group}
    onChange={(e) => setFormData({...formData, group: e.target.value})}
    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
  >
    <option value="">Pilih Group (opsional)</option>
    {groupOptions.map((group) => (
      <option key={group.name} value={group.name}>{group.name}</option>
    ))}
  </select>
</div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Harga *
  </label>
  <input
    type="number"
    value={formData.price}
    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
    placeholder="0"
    required
  />
</div>
                
                <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Stok *
  </label>
  <input
    type="number"
    value={formData.stock}
    onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
    placeholder="0"
    required
  />
</div>
              </div>
              
              
              
              <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    URL Gambar
  </label>
  <input
    type="url"
    value={formData.image_url}
    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
    placeholder="https://example.com/image.jpg"
  />
</div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Status *
  </label>
  <select
    value={formData.status_aktif}
    onChange={(e) => setFormData({...formData, status_aktif: Number(e.target.value)})}
    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
    required
  >
    <option value={1}>Aktif</option>
    <option value={0}>Tidak Aktif</option>
  </select>
</div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
  onClick={handleAdd}
  disabled={!formData.name}
  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
>
                <Save className="h-4 w-4" />
                <span>Simpan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Produk</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Produk *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    UOM *
  </label>
  <select
    value={formData.uom_name}
    onChange={(e) => setFormData({...formData, uom_name: e.target.value})}
    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
    required
  >
    <option value="">Pilih UOM</option>
    {uomOptions.map((uom) => (
      <option key={uom.name} value={uom.name}>{uom.name}</option>
    ))}
  </select>
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Kategori *
  </label>
  <select
    value={formData.category}
    onChange={(e) => setFormData({...formData, category: e.target.value})}
    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
    required
  >
    <option value="">Pilih Kategori</option>
    {categoryOptions.map((category) => (
      <option key={category.name} value={category.name}>{category.name}</option>
    ))}
  </select>
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Group
  </label>
  <select
    value={formData.group}
    onChange={(e) => setFormData({...formData, group: e.target.value})}
    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
  >
    <option value="">Pilih Group (opsional)</option>
    {groupOptions.map((group) => (
      <option key={group.name} value={group.name}>{group.name}</option>
    ))}
  </select>
</div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Harga *
  </label>
  <input
    type="number"
    value={formData.price}
    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
    placeholder="0"
    required
  />
</div>

                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stok *
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    required
                  />
                </div>
              </div>
              
              {/* Supplier field removed as requested */}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Gambar
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  value={formData.status_aktif}
                  onChange={(e) => setFormData({...formData, status_aktif: Number(e.target.value)})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value={1}>Aktif</option>
                  <option value={0}>Tidak Aktif</option>
                </select>
              </div>
              

            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleUpdate}
                disabled={!formData.name}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Update</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Product Detail Modal with Transaction History */}
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
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Product Header */}
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 h-20 w-20 mr-4">
                <img 
                  src={viewingProduct.image_url || 'https://via.placeholder.com/200'} 
                  alt={viewingProduct.name}
                  className="h-20 w-20 object-cover rounded-md"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{viewingProduct.name}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    {viewingProduct.category}
                  </span>
                  <span className="text-sm text-gray-500">ID: {viewingProduct.id}</span>
                </div>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-6">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'info' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <div className="flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Informasi Produk
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('purchases')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'purchases' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <div className="flex items-center">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Riwayat Pembelian
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('sales')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'sales' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Riwayat Penjualan
                  </div>
                </button>
              </nav>
            </div>
            
            {/* Tab Content */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Price Information */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Informasi Harga</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Harga Beli Rata-rata:</span>
                        <span className="font-semibold">{formatCurrency(viewingProduct.buy_price || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Harga:</span>
                        <span className="font-semibold text-green-600">{formatCurrency(viewingProduct.sell_price || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Margin:</span>
                        <span className="font-semibold text-green-600">
                          {viewingProduct.buy_price && viewingProduct.sell_price ? 
                            ((viewingProduct.sell_price - viewingProduct.buy_price) / viewingProduct.buy_price * 100).toFixed(1) : '0.0'}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                </div>
                
                {/* Additional Information */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Informasi Tambahan</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">UOM:</span>
                      <span className="font-semibold">{viewingProduct.uom_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Group:</span>
                      <span className="font-semibold">{viewingProduct.group}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kategori:</span>
                      <span className="font-semibold">{viewingProduct.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'purchases' && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">Riwayat Pembelian</h4>
                {productTransactions.filter(t => t.transaction_type === 'purchase').length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Transaksi</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Satuan</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {productTransactions
                          .filter(t => t.transaction_type === 'purchase')
                          .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
                          .map((transaction, index) => (
                            <tr key={transaction.id || index}>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {new Date(transaction.transaction_date).toLocaleDateString('id-ID')}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {transaction.reference_id}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {transaction.reference_name || '-'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {transaction.quantity}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {formatCurrency(transaction.price)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {formatCurrency(transaction.quantity * transaction.price)}
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Package className="h-12 w-12 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Belum ada riwayat pembelian untuk produk ini</p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'sales' && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">Riwayat Penjualan</h4>
                {productTransactions.filter(t => t.transaction_type === 'sale').length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Transaksi</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Satuan</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {productTransactions
                          .filter(t => t.transaction_type === 'sale')
                          .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
                          .map((transaction, index) => (
                            <tr key={transaction.id || index}>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {new Date(transaction.transaction_date).toLocaleDateString('id-ID')}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {transaction.reference_id}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {transaction.reference_name || '-'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {transaction.quantity}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {formatCurrency(transaction.price)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {formatCurrency(transaction.quantity * transaction.price)}
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <FileText className="h-12 w-12 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Belum ada riwayat penjualan untuk produk ini</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setViewingProduct(null);
                  setProductTransactions([]);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
