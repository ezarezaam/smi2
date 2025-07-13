import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, AlertTriangle } from 'lucide-react';

const ProductManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const products = [
    {
      id: 'PRD-001',
      name: 'Server Dell PowerEdge R740',
      category: 'Hardware',
      buyPrice: 45000000,
      sellPrice: 65000000,
      stock: 2,
      minStock: 5,
      supplier: 'PT Dell Technologies Indonesia',
      image: 'https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 'PRD-002',
      name: 'Jasa Implementasi Cloud AWS',
      category: 'Jasa IT',
      buyPrice: 0,
      sellPrice: 25000000,
      stock: 999,
      minStock: 1,
      supplier: 'Internal Team',
      image: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 'PRD-003',
      name: 'Lisensi Microsoft Office 365',
      category: 'Software',
      buyPrice: 1200000,
      sellPrice: 1800000,
      stock: 50,
      minStock: 20,
      supplier: 'Microsoft Indonesia',
      image: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 'PRD-004',
      name: 'Cisco Switch 48-Port Gigabit',
      category: 'Networking',
      buyPrice: 8500000,
      sellPrice: 12000000,
      stock: 8,
      minStock: 15,
      supplier: 'PT Cisco Systems Indonesia',
      image: 'https://images.pexels.com/photos/159304/network-cable-ethernet-computer-159304.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 'PRD-005',
      name: 'Maintenance Server Tahunan',
      category: 'Jasa IT',
      buyPrice: 0,
      sellPrice: 15000000,
      stock: 999,
      minStock: 1,
      supplier: 'Internal Team',
      image: 'https://images.pexels.com/photos/2881229/pexels-photo-2881229.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 'PRD-006',
      name: 'SSD Samsung 1TB NVMe',
      category: 'Storage',
      buyPrice: 1500000,
      sellPrice: 2200000,
      stock: 25,
      minStock: 10,
      supplier: 'Samsung Electronics Indonesia',
      image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const categories = ['all', 'Hardware', 'Software', 'Networking', 'Storage', 'Jasa IT'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { status: 'out', color: 'text-red-600', bg: 'bg-red-50' };
    if (stock <= minStock) return { status: 'low', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { status: 'normal', color: 'text-green-600', bg: 'bg-green-50' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Produk</h1>
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

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const stockStatus = getStockStatus(product.stock, product.minStock);
          const profitMargin = ((product.sellPrice - product.buyPrice) / product.buyPrice * 100).toFixed(1);
          
          return (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-w-16 aspect-h-9">
                <img 
                  src={product.image} 
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
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Harga Beli:</span>
                    <span className="font-medium">Rp {product.buyPrice.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Harga Jual:</span>
                    <span className="font-medium text-green-600">Rp {product.sellPrice.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Margin:</span>
                    <span className="font-medium text-green-600">{profitMargin}%</span>
                  </div>
                </div>
                
                <div className={`p-3 rounded-lg ${stockStatus.bg} mb-4`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Stok</span>
                    {product.stock <= product.minStock && (
                      <AlertTriangle className={`h-4 w-4 ${stockStatus.color}`} />
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-lg font-bold ${stockStatus.color}`}>
                      {product.stock}
                    </span>
                    <span className="text-sm text-gray-500">
                      / min {product.minStock}
                    </span>
                  </div>
                  {product.stock <= product.minStock && (
                    <p className={`text-xs mt-1 ${stockStatus.color}`}>
                      {product.stock === 0 ? 'Stok habis!' : 'Stok menipis!'}
                    </p>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  Supplier: {product.supplier}
                </p>
                
                <div className="flex space-x-2">
                  <button className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-md hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1">
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  <button className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-md hover:bg-red-100 transition-colors flex items-center justify-center space-x-1">
                    <Trash2 className="h-4 w-4" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Tidak ada produk yang ditemukan</p>
          <p className="text-gray-400 text-sm mt-2">Coba ubah filter atau tambah produk baru</p>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;