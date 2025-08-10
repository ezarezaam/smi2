import React, { useState } from 'react';
import * as LucideIcons from '../../components/icons';

const { Plus, Package, Truck, Calendar } = LucideIcons;

const ProcurementManagement: React.FC = () => {
  // Removed unused searchQuery state
  const [idFilter, setIdFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [descFilter, setDescFilter] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPaymentStatuses, setSelectedPaymentStatuses] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  // Removed unused legacy filters
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<any>(null);
  const [newExpense, setNewExpense] = useState({
    vendor: '',
    category: 'hardware',
    description: '',
    date: new Date().toISOString().split('T')[0],
    total: 0,
    status: 'in_progress',
    paymentStatus: 'pending'
  });

  const expenses = [
    {
      id: 'PO-001',
      vendor: 'PT Dell Technologies Indonesia',
      date: '2024-01-15',
      total: 135000000,
      status: 'completed',
      paymentStatus: 'paid',
      category: 'hardware',
      items: [
        { product: 'Server Dell PowerEdge R740', qty: 3, price: 45000000 }
      ]
    },
    {
      id: 'INV-002',
      vendor: 'PT Startup Digital Nusantara',
      date: '2024-01-12',
      total: 250000000,
      status: 'received',
      paymentStatus: 'pending',
      category: 'investment',
      items: [
        { product: 'Investasi Startup Fintech "PayEasy"', qty: 1, price: 250000000 }
      ]
    },
    {
      id: 'DEV-003',
      vendor: 'Tim Developer Internal',
      date: '2024-01-10',
      total: 85000000,
      status: 'in_progress',
      paymentStatus: 'pending',
      category: 'development',
      items: [
        { product: 'Pengembangan Aplikasi E-Commerce B2B', qty: 1, price: 85000000 }
      ]
    },
    {
      id: 'MKT-004',
      vendor: 'PT Digital Marketing Pro',
      date: '2024-01-08',
      total: 45000000,
      status: 'completed',
      paymentStatus: 'paid',
      category: 'marketing',
      items: [
        { product: 'Campaign Digital Marketing Q1 2024', qty: 1, price: 45000000 }
      ]
    },
    {
      id: 'RND-005',
      vendor: 'PT Research Innovation Labs',
      date: '2024-01-05',
      total: 120000000,
      status: 'in_progress',
      paymentStatus: 'partial',
      category: 'research',
      items: [
        { product: 'R&D Teknologi AI untuk Otomasi Bisnis', qty: 1, price: 120000000 }
      ]
    }
  ];

  const vendors = [
    { id: 1, name: 'PT Dell Technologies Indonesia', contact: '021-5551234', email: 'sales@dell.co.id', type: 'Hardware Supplier' },
    { id: 2, name: 'PT Startup Digital Nusantara', contact: '021-5555678', email: 'invest@startupdigital.id', type: 'Investment Partner' },
    { id: 3, name: 'Tim Developer Internal', contact: '021-5559012', email: 'dev@seniormilenial.id', type: 'Internal Team' },
    { id: 4, name: 'PT Digital Marketing Pro', contact: '021-5557890', email: 'hello@digitalmarketingpro.id', type: 'Marketing Agency' },
    { id: 5, name: 'PT Research Innovation Labs', contact: '021-5556543', email: 'research@innovationlabs.id', type: 'R&D Partner' }
  ];

  const categories = [
    { id: 'all', name: 'Semua Kategori' },
    { id: 'hardware', name: 'Hardware & Equipment' },
    { id: 'software', name: 'Software & Lisensi' },
    { id: 'investment', name: 'Investasi Startup' },
    { id: 'development', name: 'Pengembangan Aplikasi' },
    { id: 'marketing', name: 'Marketing & Promosi' },
    { id: 'research', name: 'Research & Development' },
    { id: 'operational', name: 'Operasional Bisnis' }
  ];

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Selesai', color: 'text-green-600', bg: 'bg-green-50' };
      case 'received':
        return { label: 'Diterima', color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'in_progress':
        return { label: 'Dalam Proses', color: 'text-yellow-600', bg: 'bg-yellow-50' };
      case 'cancelled':
        return { label: 'Dibatalkan', color: 'text-red-600', bg: 'bg-red-50' };
      default:
        return { label: 'Unknown', color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'hardware':
        return { label: 'Hardware', color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'software':
        return { label: 'Software', color: 'text-purple-600', bg: 'bg-purple-50' };
      case 'investment':
        return { label: 'Investasi', color: 'text-green-600', bg: 'bg-green-50' };
      case 'development':
        return { label: 'Development', color: 'text-orange-600', bg: 'bg-orange-50' };
      case 'marketing':
        return { label: 'Marketing', color: 'text-pink-600', bg: 'bg-pink-50' };
      case 'research':
        return { label: 'R&D', color: 'text-indigo-600', bg: 'bg-indigo-50' };
      case 'operational':
        return { label: 'Operasional', color: 'text-gray-600', bg: 'bg-gray-50' };
      default:
        return { label: 'Lainnya', color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const getPaymentStatusInfo = (status: string) => {
    switch (status) {
      case 'paid':
        return { label: 'Lunas', color: 'text-green-600', bg: 'bg-green-50' };
      case 'pending':
        return { label: 'Belum Bayar', color: 'text-red-600', bg: 'bg-red-50' };
      case 'partial':
        return { label: 'Sebagian', color: 'text-yellow-600', bg: 'bg-yellow-50' };
      default:
        return { label: 'Unknown', color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesId = idFilter === '' || expense.id.toLowerCase().includes(idFilter.toLowerCase());
    const matchesVendor = vendorFilter === '' || expense.vendor.toLowerCase().includes(vendorFilter.toLowerCase());
    const matchesDesc = descFilter === '' || expense.items.some(item => item.product.toLowerCase().includes(descFilter.toLowerCase()));
    
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(expense.category);
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(expense.status);
    const matchesPaymentStatus = selectedPaymentStatuses.length === 0 || selectedPaymentStatuses.includes(expense.paymentStatus);
    
    const expenseDate = new Date(expense.date);
    const matchesDateFrom = dateFrom === '' || new Date(dateFrom) <= expenseDate;
    const matchesDateTo = dateTo === '' || expenseDate <= new Date(dateTo);
    
    // Removed legacy filter checks
    
    return matchesId && matchesVendor && matchesDesc && 
           matchesCategory && matchesStatus && matchesPaymentStatus && 
           matchesDateFrom && matchesDateTo;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari ID, vendor, atau deskripsi..."
              className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => {
                const value = e.target.value.toLowerCase();
                setIdFilter(value);
                setVendorFilter(value);
                setDescFilter(value);
              }}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus className="h-5 w-5 mr-2" />
            <span>Tambah Pengeluaran</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-md">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Transaksi</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-md">
              <Truck className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Pengeluaran</p>
              <p className="text-2xl font-bold text-gray-900">Rp 635jt</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-md">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Investasi Aktif</p>
              <p className="text-2xl font-bold text-gray-900">Rp 370jt</p>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          {showAdvancedFilters ? 'Sembunyikan Filter Lanjutan' : 'Tampilkan Filter Lanjutan'}
          <svg
            className={`ml-1 h-5 w-5 transform ${showAdvancedFilters ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="mt-2 bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Text Search Filters */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Pencarian</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">ID Transaksi</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Cari ID transaksi..."
                    value={idFilter}
                    onChange={(e) => setIdFilter(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Vendor/Partner</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Cari vendor..."
                    value={vendorFilter}
                    onChange={(e) => setVendorFilter(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Deskripsi</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Cari deskripsi..."
                    value={descFilter}
                    onChange={(e) => setDescFilter(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Dropdown Filters */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Filter</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Kategori</label>
                  <div className="flex flex-wrap gap-1">
                    {categories.filter(c => c.id !== 'all').map(category => (
                      <div 
                        key={category.id} 
                        onClick={() => {
                          setSelectedCategories(prev => 
                            prev.includes(category.id) 
                              ? prev.filter(id => id !== category.id)
                              : [...prev, category.id]
                          );
                        }}
                        className={`px-2 py-1 text-xs rounded-full cursor-pointer ${selectedCategories.includes(category.id) 
                          ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                          : 'bg-gray-100 text-gray-700 border border-gray-200'}`}
                      >
                        {category.name}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Status</label>
                  <div className="flex flex-wrap gap-1">
                    <div 
                      onClick={() => setSelectedStatuses(prev => prev.includes('in_progress') ? prev.filter(s => s !== 'in_progress') : [...prev, 'in_progress'])}
                      className={`px-2 py-1 text-xs rounded-full cursor-pointer ${selectedStatuses.includes('in_progress') ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}
                    >
                      Dalam Proses
                    </div>
                    <div 
                      onClick={() => setSelectedStatuses(prev => prev.includes('received') ? prev.filter(s => s !== 'received') : [...prev, 'received'])}
                      className={`px-2 py-1 text-xs rounded-full cursor-pointer ${selectedStatuses.includes('received') ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}
                    >
                      Diterima
                    </div>
                    <div 
                      onClick={() => setSelectedStatuses(prev => prev.includes('completed') ? prev.filter(s => s !== 'completed') : [...prev, 'completed'])}
                      className={`px-2 py-1 text-xs rounded-full cursor-pointer ${selectedStatuses.includes('completed') ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}
                    >
                      Selesai
                    </div>
                    <div 
                      onClick={() => setSelectedStatuses(prev => prev.includes('cancelled') ? prev.filter(s => s !== 'cancelled') : [...prev, 'cancelled'])}
                      className={`px-2 py-1 text-xs rounded-full cursor-pointer ${selectedStatuses.includes('cancelled') ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}
                    >
                      Dibatalkan
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Pembayaran</label>
                  <div className="flex flex-wrap gap-1">
                    <div 
                      onClick={() => setSelectedPaymentStatuses(prev => prev.includes('pending') ? prev.filter(s => s !== 'pending') : [...prev, 'pending'])}
                      className={`px-2 py-1 text-xs rounded-full cursor-pointer ${selectedPaymentStatuses.includes('pending') ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}
                    >
                      Belum Bayar
                    </div>
                    <div 
                      onClick={() => setSelectedPaymentStatuses(prev => prev.includes('partial') ? prev.filter(s => s !== 'partial') : [...prev, 'partial'])}
                      className={`px-2 py-1 text-xs rounded-full cursor-pointer ${selectedPaymentStatuses.includes('partial') ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}
                    >
                      Sebagian
                    </div>
                    <div 
                      onClick={() => setSelectedPaymentStatuses(prev => prev.includes('paid') ? prev.filter(s => s !== 'paid') : [...prev, 'paid'])}
                      className={`px-2 py-1 text-xs rounded-full cursor-pointer ${selectedPaymentStatuses.includes('paid') ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}
                    >
                      Lunas
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Rentang Tanggal</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Dari Tanggal</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Sampai Tanggal</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Reset Filters Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setIdFilter('');
                setVendorFilter('');
                setDescFilter('');
                setSelectedCategories([]);
                setSelectedStatuses([]);
                setSelectedPaymentStatuses([]);
                setDateFrom('');
                setDateTo('');
              }}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-md border border-gray-300"
            >
              Reset Filter
            </button>
          </div>
        </div>
      )}

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Transaksi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor/Partner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deskripsi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pembayaran
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses.map((expense) => {
                const statusInfo = getStatusInfo(expense.status);
                const paymentInfo = getPaymentStatusInfo(expense.paymentStatus);
                const categoryInfo = getCategoryInfo(expense.category);
                
                return (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{expense.id}</div>
                      <div className="text-sm text-gray-500">
                        {expense.items.length} item(s)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{expense.vendor}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryInfo.bg} ${categoryInfo.color}`}>
                        {categoryInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                        {expense.items[0].product}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(expense.date).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Rp {expense.total.toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentInfo.bg} ${paymentInfo.color}`}>
                        {paymentInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => {
                          setCurrentExpense(expense);
                          setShowEditModal(true);
                        }}
                      >
                        Detail
                      </button>
                      <button 
                        className="text-yellow-600 hover:text-yellow-900 mr-3"
                        onClick={() => {
                          setCurrentExpense(expense);
                          setShowEditModal(true);
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900 mr-3"
                        onClick={() => {
                          setCurrentExpense(expense);
                          setShowDeleteModal(true);
                        }}
                      >
                        Hapus
                      </button>
                      {expense.paymentStatus === 'pending' && (
                        <button className="text-green-600 hover:text-green-900 mr-3">
                          Bayar
                        </button>
                      )}
                      {expense.status === 'received' && (
                        <button className="text-purple-600 hover:text-purple-900">
                          Terima
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredExpenses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Tidak ada transaksi yang ditemukan</p>
          <p className="text-gray-400 text-sm mt-2">Coba ubah filter atau tambah pengeluaran baru</p>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Tambah Pengeluaran Baru</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor/Partner</label>
                  <select 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    value={newExpense.vendor}
                    onChange={(e) => setNewExpense({...newExpense, vendor: e.target.value})}
                  >
                    <option value="">Pilih Vendor</option>
                    {vendors.map(vendor => (
                      <option key={vendor.id} value={vendor.name}>{vendor.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                  >
                    {categories.filter(c => c.id !== 'all').map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                    placeholder="Deskripsi pengeluaran"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total (Rp)</label>
                  <input 
                    type="number" 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    value={newExpense.total}
                    onChange={(e) => setNewExpense({...newExpense, total: parseInt(e.target.value)})}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    value={newExpense.status}
                    onChange={(e) => setNewExpense({...newExpense, status: e.target.value})}
                  >
                    <option value="in_progress">Dalam Proses</option>
                    <option value="received">Diterima</option>
                    <option value="completed">Selesai</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status Pembayaran</label>
                  <select 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    value={newExpense.paymentStatus}
                    onChange={(e) => setNewExpense({...newExpense, paymentStatus: e.target.value})}
                  >
                    <option value="pending">Belum Bayar</option>
                    <option value="partial">Sebagian</option>
                    <option value="paid">Lunas</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  // Logic to add new expense
                  const newId = `EXP-${String(expenses.length + 1).padStart(3, '0')}`;
                  const newItem = {
                    id: newId,
                    vendor: newExpense.vendor,
                    date: newExpense.date,
                    total: newExpense.total,
                    status: newExpense.status,
                    paymentStatus: newExpense.paymentStatus,
                    category: newExpense.category,
                    items: [
                      { product: newExpense.description, qty: 1, price: newExpense.total }
                    ]
                  };
                  expenses.push(newItem);
                  setShowAddModal(false);
                  // Reset form
                  setNewExpense({
                    vendor: '',
                    category: 'hardware',
                    description: '',
                    date: new Date().toISOString().split('T')[0],
                    total: 0,
                    status: 'in_progress',
                    paymentStatus: 'pending'
                  });
                }}
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {showEditModal && currentExpense && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Edit Pengeluaran {currentExpense.id}</h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor/Partner</label>
                  <select 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    value={currentExpense.vendor}
                    onChange={(e) => setCurrentExpense({...currentExpense, vendor: e.target.value})}
                  >
                    {vendors.map(vendor => (
                      <option key={vendor.id} value={vendor.name}>{vendor.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    value={currentExpense.category}
                    onChange={(e) => setCurrentExpense({...currentExpense, category: e.target.value})}
                  >
                    {categories.filter(c => c.id !== 'all').map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    value={currentExpense.items[0].product}
                    onChange={(e) => {
                      const updatedItems = [...currentExpense.items];
                      updatedItems[0] = {...updatedItems[0], product: e.target.value};
                      setCurrentExpense({...currentExpense, items: updatedItems});
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    value={currentExpense.date}
                    onChange={(e) => setCurrentExpense({...currentExpense, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total (Rp)</label>
                  <input 
                    type="number" 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    value={currentExpense.total}
                    onChange={(e) => {
                      const total = parseInt(e.target.value);
                      const updatedItems = [...currentExpense.items];
                      updatedItems[0] = {...updatedItems[0], price: total};
                      setCurrentExpense({...currentExpense, total, items: updatedItems});
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    value={currentExpense.status}
                    onChange={(e) => setCurrentExpense({...currentExpense, status: e.target.value})}
                  >
                    <option value="in_progress">Dalam Proses</option>
                    <option value="received">Diterima</option>
                    <option value="completed">Selesai</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status Pembayaran</label>
                  <select 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    value={currentExpense.paymentStatus}
                    onChange={(e) => setCurrentExpense({...currentExpense, paymentStatus: e.target.value})}
                  >
                    <option value="pending">Belum Bayar</option>
                    <option value="partial">Sebagian</option>
                    <option value="paid">Lunas</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  // Logic to update expense
                  const index = expenses.findIndex(e => e.id === currentExpense.id);
                  if (index !== -1) {
                    expenses[index] = currentExpense;
                  }
                  setShowEditModal(false);
                  setCurrentExpense(null);
                }}
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && currentExpense && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Konfirmasi Hapus</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-700">Apakah Anda yakin ingin menghapus pengeluaran <span className="font-semibold">{currentExpense.id}</span>?</p>
              <p className="text-gray-500 text-sm mt-2">Tindakan ini tidak dapat dibatalkan.</p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setCurrentExpense(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  // Logic to delete expense
                  const index = expenses.findIndex(e => e.id === currentExpense.id);
                  if (index !== -1) {
                    expenses.splice(index, 1);
                  }
                  setShowDeleteModal(false);
                  setCurrentExpense(null);
                }}
                className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 focus:outline-none"
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

export default ProcurementManagement;