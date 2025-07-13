import React, { useState } from 'react';
import { Plus, Search, Filter, Package, Truck, Calendar } from 'lucide-react';

const ProcurementManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

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

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.items.some(item => item.product.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Pengeluaran & Investasi</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Pengeluaran</span>
        </button>
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
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-md">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Vendor/Partner</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari transaksi, vendor, atau proyek..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Semua Status</option>
              <option value="completed">Selesai</option>
              <option value="received">Diterima</option>
              <option value="in_progress">Dalam Proses</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
        </div>
      </div>

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
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Detail
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

      {/* Vendor Quick Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendor & Partner Terpercaya</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <h4 className="font-medium text-gray-900 mb-1">{vendor.name}</h4>
              <p className="text-xs text-blue-600 mb-2">{vendor.type}</p>
              <div className="space-y-1 text-sm text-gray-600">
                <p>📞 {vendor.contact}</p>
                <p>✉️ {vendor.email}</p>
              </div>
              <button className="mt-3 w-full bg-blue-50 text-blue-600 py-2 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium">
                Buat Transaksi
              </button>
            </div>
          ))}
        </div>
      </div>

      {filteredExpenses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Tidak ada transaksi yang ditemukan</p>
          <p className="text-gray-400 text-sm mt-2">Coba ubah filter atau tambah pengeluaran baru</p>
        </div>
      )}
    </div>
  );
};

export default ProcurementManagement;