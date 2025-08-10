import React, { useState } from 'react';
import * as LucideIcons from '../../components/icons';

const { Plus, Edit, Trash2, Search, Eye, X } = LucideIcons;

// Interface para datos de inventario
interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  supplier: string;
  location: string;
  lastUpdated: string;
}

const InventoryManagement: React.FC = () => {
  // State para almacenar datos
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    {
      id: 'INV-001',
      name: 'Laptop Dell XPS 13',
      category: 'Electronics',
      stock: 15,
      unit: 'unit',
      purchasePrice: 12000000,
      sellingPrice: 15000000,
      supplier: 'PT Dell Indonesia',
      location: 'Warehouse A',
      lastUpdated: '2023-07-15'
    },
    {
      id: 'INV-002',
      name: 'Office Chair',
      category: 'Furniture',
      stock: 30,
      unit: 'unit',
      purchasePrice: 800000,
      sellingPrice: 1200000,
      supplier: 'PT Furniture Jaya',
      location: 'Warehouse B',
      lastUpdated: '2023-08-20'
    },
    {
      id: 'INV-003',
      name: 'Printer HP LaserJet',
      category: 'Electronics',
      stock: 8,
      unit: 'unit',
      purchasePrice: 3500000,
      sellingPrice: 4200000,
      supplier: 'PT HP Indonesia',
      location: 'Warehouse A',
      lastUpdated: '2023-09-05'
    }
  ]);

  // State para modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  
  // State para formulario
  const [formData, setFormData] = useState<{
    id: string;
    name: string;
    category: string;
    stock: number;
    unit: string;
    purchasePrice: number;
    sellingPrice: number;
    supplier: string;
    location: string;
  }>({
    id: '',
    name: '',
    category: '',
    stock: 0,
    unit: '',
    purchasePrice: 0,
    sellingPrice: 0,
    supplier: '',
    location: ''
  });

  // State para filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  // Handler para mostrar modal de edición
  const handleEdit = (item: InventoryItem) => {
    setCurrentItem(item);
    setFormData({
      id: item.id,
      name: item.name,
      category: item.category,
      stock: item.stock,
      unit: item.unit,
      purchasePrice: item.purchasePrice,
      sellingPrice: item.sellingPrice,
      supplier: item.supplier,
      location: item.location
    });
    setShowEditModal(true);
  };

  // Handler para mostrar modal de eliminación
  const handleDelete = (item: InventoryItem) => {
    setCurrentItem(item);
    setShowDeleteModal(true);
  };

  // Handler para mostrar modal de visualización
  const handleView = (item: InventoryItem) => {
    setCurrentItem(item);
    setShowViewModal(true);
  };
  
  // Handler para mostrar modal de adición
  const handleAdd = () => {
    // Generar nuevo ID
    const newId = `INV-${String(inventoryItems.length + 1).padStart(3, '0')}`;
    
    setFormData({
      id: newId,
      name: '',
      category: '',
      stock: 0,
      unit: 'unit',
      purchasePrice: 0,
      sellingPrice: 0,
      supplier: '',
      location: ''
    });
    
    setShowAddModal(true);
  };
  
  // Handler para guardar formulario
  const handleSaveItem = () => {
    // Validar formulario
    if (!formData.name || !formData.category || formData.stock < 0) {
      alert('Por favor complete los campos requeridos');
      return;
    }
    
    const newItem: InventoryItem = {
      id: formData.id,
      name: formData.name,
      category: formData.category,
      stock: formData.stock,
      unit: formData.unit,
      purchasePrice: formData.purchasePrice,
      sellingPrice: formData.sellingPrice,
      supplier: formData.supplier,
      location: formData.location,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    if (showAddModal) {
      // Agregar nuevo item
      setInventoryItems([...inventoryItems, newItem]);
      setShowAddModal(false);
    } else if (showEditModal) {
      // Actualizar item existente
      setInventoryItems(inventoryItems.map(item => 
        item.id === newItem.id ? newItem : item
      ));
      setShowEditModal(false);
    }
    
    // Resetear formulario
    setFormData({
      id: '',
      name: '',
      category: '',
      stock: 0,
      unit: '',
      purchasePrice: 0,
      sellingPrice: 0,
      supplier: '',
      location: ''
    });
  };

  // Handler para confirmar eliminación
  const confirmDelete = () => {
    if (currentItem) {
      setInventoryItems(inventoryItems.filter(item => item.id !== currentItem.id));
      setShowDeleteModal(false);
      setCurrentItem(null);
    }
  };

  // Filtrar items basado en búsqueda y filtros
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesLocation = locationFilter === 'all' || item.location === locationFilter;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  // Obtener categorías únicas para filtro
  const categories = Array.from(new Set(inventoryItems.map(item => item.category)));
  
  // Obtener ubicaciones únicas para filtro
  const locations = Array.from(new Set(inventoryItems.map(item => item.location)));

  // Formatear número como moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manajemen Inventaris</h2>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Item
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cari
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari nama, ID, atau supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <Search className="w-4 h-4" />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lokasi
            </label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Semua Lokasi</option>
              {locations.map((location, index) => (
                <option key={index} value={location}>{location}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Item
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stok
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga Jual
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lokasi
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Update Terakhir
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.stock} {item.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(item.sellingPrice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.lastUpdated}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleView(item)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                {showAddModal ? 'Tambah Item Baru' : 'Edit Item'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    disabled
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Item *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori *
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Satuan
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Harga Beli
                  </label>
                  <input
                    type="number"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({...formData, purchasePrice: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Harga Jual
                  </label>
                  <input
                    type="number"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({...formData, sellingPrice: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier
                  </label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lokasi
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3 px-6 pb-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                onClick={handleSaveItem}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && currentItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                Detail Item
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">ID</p>
                <p className="font-medium">{currentItem.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nama Item</p>
                <p className="font-medium">{currentItem.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Kategori</p>
                <p className="font-medium">{currentItem.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Stok</p>
                <p className="font-medium">{currentItem.stock} {currentItem.unit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Harga Beli</p>
                <p className="font-medium">{formatCurrency(currentItem.purchasePrice)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Harga Jual</p>
                <p className="font-medium">{formatCurrency(currentItem.sellingPrice)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Supplier</p>
                <p className="font-medium">{currentItem.supplier}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Lokasi</p>
                <p className="font-medium">{currentItem.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Update Terakhir</p>
                <p className="font-medium">{currentItem.lastUpdated}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Profit per Unit</p>
                <p className="font-medium">{formatCurrency(currentItem.sellingPrice - currentItem.purchasePrice)}</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end px-6 pb-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && currentItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Konfirmasi Hapus</h3>
              <p className="text-gray-600">
                Apakah Anda yakin ingin menghapus item <span className="font-semibold">{currentItem.name}</span> dengan ID <span className="font-semibold">{currentItem.id}</span>?
              </p>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
