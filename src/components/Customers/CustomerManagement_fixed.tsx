import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, Save, FileText } from '../icons';
import { Contact } from '../../models/Contact';
import { toast } from 'react-hot-toast';
import CustomerDetail from './CustomerDetail';
import { ContactService } from '../../services/ContactService';

// Component untuk manajemen customer yang menggunakan model Contact
const CustomerManagement: React.FC = () => {
  // State untuk menyimpan data customer (contacts dengan type customer atau both)
  const [customers, setCustomers] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Contact | null>(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Contact | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Contact | null>(null);
  
  // Form data state
  const [formData, setFormData] = useState<Contact>({
    id: '',
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    category: 'Individual',
    status: 'active',
    type: 1 // 1 = customer
  });
  
  // Categories untuk dropdown
  const categories = ['all', 'Individual', 'Corporate', 'Reseller'];
  const statuses = ['all', 'active', 'inactive'];

  // Fungsi untuk mengambil data customer (contacts dengan type customer atau both)
  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      // Mengambil semua kontak
      const { data, error } = await ContactService.getAll();
      
      if (error) {
        console.error('Error fetching contacts:', error);
        toast.error('Gagal memuat data customer: ' + (error as any)?.message || 'Unknown error');
        return;
      }
      
      if (data) {
        // Filter kontak dengan type ID 1 (customer) atau 3 (both)
        const filteredData = data.filter(contact => 
          contact.type === 1 || contact.type === 3
        );
        
        console.log('All contacts:', data);
        console.log('Filtered customers (type 1 or 3):', filteredData);
        
        setCustomers(filteredData);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Terjadi kesalahan saat memuat data customer');
    } finally {
      setIsLoading(false);
    }
  };

  // Load customers saat komponen dimount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter customers berdasarkan pencarian dan filter
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      (customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (customer.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (customer.id?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesCategory = categoryFilter === 'all' || customer.category === categoryFilter;
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Reset form data ke nilai default
  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      category: 'Individual',
      status: 'active',
      type: 1 // 1 = customer
    });
  };

  // Handle add new customer
  const handleAdd = async () => {
    try {
      const { id, ...customerData } = formData;
      const { data, error } = await ContactService.create(customerData as Contact);
      if (error) {
        toast.error('Gagal menambahkan customer: ' + (error as any)?.message || 'Unknown error');
        return;
      }
      if (data) {
        toast.success('Customer berhasil ditambahkan');
        await fetchCustomers(); // Reload customers to get the updated list
        setShowAddModal(false);
        resetForm();
      }
    } catch (err) {
      console.error('Error adding customer:', err);
      toast.error('Terjadi kesalahan saat menambahkan customer');
    }
  };

  // Handle view customer detail
  const handleViewCustomer = (customer: Contact) => {
    setSelectedCustomer(customer);
    setShowCustomerDetail(true);
  };
  
  // Handle edit customer
  const handleEdit = (customer: Contact) => {
    setEditingCustomer(customer);
    setFormData(customer);
    setShowEditModal(true);
  };
  
  // Handle update customer
  const handleUpdate = async () => {
    if (!editingCustomer || !editingCustomer.id) return;
    try {
      const { data, error } = await ContactService.update(editingCustomer.id, formData);
      if (error) {
        toast.error('Gagal mengupdate customer: ' + (error as any)?.message || 'Unknown error');
        return;
      }
      if (data) {
        toast.success('Customer berhasil diupdate');
        await fetchCustomers(); // Reload customers to get the updated list
        setShowEditModal(false);
        setEditingCustomer(null);
        resetForm();
      }
    } catch (err) {
      console.error('Error updating customer:', err);
      toast.error('Terjadi kesalahan saat mengupdate customer');
    }
  };
  
  // Handle delete customer
  const handleDelete = (customer: Contact) => {
    setDeletingCustomer(customer);
    setShowDeleteModal(true);
  };
  
  // Confirm delete customer
  const confirmDelete = async () => {
    if (!deletingCustomer || !deletingCustomer.id) return;
    try {
      const { error } = await ContactService.delete(deletingCustomer.id);
      if (error) {
        toast.error('Gagal menghapus customer: ' + (error as any)?.message || 'Unknown error');
        return;
      }
      toast.success('Customer berhasil dihapus');
      await fetchCustomers(); // Reload customers to get the updated list
      setShowDeleteModal(false);
      setDeletingCustomer(null);
    } catch (err) {
      console.error('Error deleting customer:', err);
      toast.error('Terjadi kesalahan saat menghapus customer');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Customer</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Customer</span>
        </button>
      </div>

      {/* Filter dan pencarian */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Cari customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">Semua Kategori</option>
              {categories.filter(c => c !== 'all').map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main content - single container for either customer list or customer detail */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {!showCustomerDetail ? (
          // Customer list view
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                Tidak ada data customer yang tersedia
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
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
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">{customer.name?.charAt(0)}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500">{customer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.contact_person}</div>
                        <div className="text-sm text-gray-500">{customer.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {customer.category || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {customer.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewCustomer(customer)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <FileText className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleEdit(customer)}
                          className="text-yellow-600 hover:text-yellow-900 mr-4"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(customer)}
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
        ) : (
          // Customer detail view
          selectedCustomer && (
            <CustomerDetail 
              customerId={selectedCustomer.id || ''} 
              onBack={() => setShowCustomerDetail(false)} 
            />
          )
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tambah Customer Baru</h3>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Customer</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nama customer"
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
                  placeholder="Alamat customer"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  value={formData.category || 'Individual'}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.filter(t => t !== 'all').map(category => (
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
                  <option value={1}>Customer</option>
                  <option value={3}>Customer & Vendor</option>
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

      {/* Edit Customer Modal */}
      {showEditModal && editingCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Customer</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCustomer(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Customer</label>
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
                  value={formData.category || 'Individual'}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.filter(t => t !== 'all').map(category => (
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
                  <option value={1}>Customer</option>
                  <option value={3}>Customer & Vendor</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCustomer(null);
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
      {showDeleteModal && deletingCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Konfirmasi Hapus</h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingCustomer(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600">
                Apakah Anda yakin ingin menghapus customer <strong>{deletingCustomer.name}</strong>?
              </p>
              <p className="text-sm text-red-600 mt-2">
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingCustomer(null);
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

export default CustomerManagement;
