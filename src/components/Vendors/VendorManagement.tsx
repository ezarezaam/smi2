import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, FileText, X, Save } from '../icons';
import { Contact } from '../../models/Contact';
import { toast } from 'react-hot-toast';
import VendorDetail from './VendorDetail';
import { ContactService } from '../../services/ContactService';

// Component untuk manajemen vendor yang menggunakan model Contact
const VendorManagement: React.FC = () => {
  // State untuk menyimpan data vendor (contacts dengan type vendor atau both)
  const [vendors, setVendors] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showVendorDetail, setShowVendorDetail] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Contact | null>(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Contact | null>(null);
  const [deletingVendor, setDeletingVendor] = useState<Contact | null>(null);
  
  // Form data state
  const [formData, setFormData] = useState<Contact>({
    id: '',
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    category: 'Office Supplies',
    status: 'active',
    type: 2 // 2 = vendor
  });
  
  // Categories untuk dropdown
  const categories = ['Office Supplies', 'Electronics', 'Logistics', 'Supplier', 'Other'];

  // Fungsi untuk mengambil data vendor (contacts dengan type vendor atau both)
  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      // Mengambil semua kontak
      const { data, error } = await ContactService.getAll();
      
      if (error) {
        console.error('Error fetching contacts:', error);
        toast.error('Gagal memuat data vendor: ' + (error as any)?.message || 'Unknown error');
        return;
      }
      
      if (data) {
        // Filter kontak dengan type ID 2 (vendor) atau 3 (both)
        const filteredData = data.filter(contact => 
          contact.type === 2 || contact.type === 3
        );
        
        console.log('All contacts:', data);
        console.log('Filtered vendors (type 2 or 3):', filteredData);
        
        setVendors(filteredData);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Terjadi kesalahan saat memuat data vendor');
    } finally {
      setIsLoading(false);
    }
  };

  // Load vendors saat komponen dimount
  useEffect(() => {
    fetchVendors();
  }, []);

  // Reset form data ke nilai default
  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      category: 'Office Supplies',
      status: 'active',
      type: 2 // 2 = vendor
    });
  };

  // Handle add new vendor
  const handleAdd = async () => {
    try {
      const { id, ...vendorData } = formData;
      const { data, error } = await ContactService.create(vendorData as Contact);
      if (error) {
        toast.error('Gagal menambahkan vendor: ' + (error as any)?.message || 'Unknown error');
        return;
      }
      if (data) {
        toast.success('Vendor berhasil ditambahkan');
        await fetchVendors(); // Reload vendors to get the updated list
        setShowAddModal(false);
        resetForm();
      }
    } catch (err) {
      console.error('Error adding vendor:', err);
      toast.error('Terjadi kesalahan saat menambahkan vendor');
    }
  };

  // Handle view vendor detail
  const handleViewVendor = (vendor: Contact) => {
    setSelectedVendor(vendor);
    setShowVendorDetail(true);
  };
  
  // Handle edit vendor
  const handleEdit = (vendor: Contact) => {
    setEditingVendor(vendor);
    setFormData(vendor);
    setShowEditModal(true);
  };
  
  // Handle update vendor
  const handleUpdate = async () => {
    if (!editingVendor || !editingVendor.id) return;
    try {
      const { data, error } = await ContactService.update(editingVendor.id, formData);
      if (error) {
        toast.error('Gagal mengupdate vendor: ' + (error as any)?.message || 'Unknown error');
        return;
      }
      if (data) {
        toast.success('Vendor berhasil diupdate');
        await fetchVendors(); // Reload vendors to get the updated list
        setShowEditModal(false);
        setEditingVendor(null);
        resetForm();
      }
    } catch (err) {
      console.error('Error updating vendor:', err);
      toast.error('Terjadi kesalahan saat mengupdate vendor');
    }
  };
  
  // Handle delete vendor
  const handleDelete = (vendor: Contact) => {
    setDeletingVendor(vendor);
    setShowDeleteModal(true);
  };
  
  // Confirm delete vendor
  const confirmDelete = async () => {
    if (!deletingVendor || !deletingVendor.id) return;
    try {
      const { error } = await ContactService.delete(deletingVendor.id);
      if (error) {
        toast.error('Gagal menghapus vendor: ' + (error as any)?.message || 'Unknown error');
        return;
      }
      toast.success('Vendor berhasil dihapus');
      await fetchVendors(); // Reload vendors to get the updated list
      setShowDeleteModal(false);
      setDeletingVendor(null);
    } catch (err) {
      console.error('Error deleting vendor:', err);
      toast.error('Terjadi kesalahan saat menghapus vendor');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Vendor</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Vendor</span>
        </button>
      </div>

      {/* Main content - single container for either vendor list or vendor detail */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {!showVendorDetail ? (
          // Vendor list view
          <>
            <div className="p-4 border-b">
              <div className="flex items-center">
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Cari vendor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : vendors.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  Tidak ada data vendor yang tersedia
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 table-fixed">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vendors.map((vendor) => (
                      <tr key={vendor.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium">{vendor.name?.charAt(0)}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                              <div className="text-sm text-gray-500">{vendor.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{vendor.contact_person}</div>
                          <div className="text-sm text-gray-500">{vendor.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {vendor.category || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${vendor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {vendor.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewVendor(vendor)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            <FileText className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleEdit(vendor)}
                            className="text-yellow-600 hover:text-yellow-900 mr-4"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(vendor)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : (
          // Vendor detail view
          selectedVendor && (
            <VendorDetail 
              vendorId={selectedVendor.id || ''} 
              onBack={() => setShowVendorDetail(false)} 
            />
          )
        )}
      </div>

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tambah Vendor Baru</h3>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Vendor</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nama vendor"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kontak Person</label>
                <input
                  type="text"
                  value={formData.contact_person || ''}
                  onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nama kontak person"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nomor telepon"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <textarea
                  value={formData.address || ''}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Alamat vendor"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  value={formData.category || 'Office Supplies'}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: Number(e.target.value)})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={2}>Vendor</option>
                  <option value={3}>Vendor & Customer</option>
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
                disabled={!formData.name || !formData.email || !formData.phone}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vendor Modal */}
      {showEditModal && editingVendor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Vendor</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingVendor(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Vendor</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kontak Person</label>
                <input
                  type="text"
                  value={formData.contact_person || ''}
                  onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <textarea
                  value={formData.address || ''}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  value={formData.category || 'Office Supplies'}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: Number(e.target.value)})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={2}>Vendor</option>
                  <option value={3}>Vendor & Customer</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingVendor(null);
                  resetForm();
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleUpdate}
                disabled={!formData.name || !formData.email || !formData.phone}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Update</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingVendor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Konfirmasi Hapus</h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingVendor(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600">
                Apakah Anda yakin ingin menghapus vendor <strong>{deletingVendor.name}</strong>?
              </p>
              <p className="text-sm text-red-600 mt-2">
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingVendor(null);
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorManagement;
