import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Search, Plus, Edit, Trash2, Eye, CreditCard, Check } from 'lucide-react';
import { ExpenseService } from '../../services/ExpenseService';
import { MasterOtherExpenseService } from '../../services/MasterOtherExpenseService';
import { Expense, EXPENSE_STATUS, PAYMENT_STATUS, generateTransactionId } from '../../models/Expense';
import { MasterOtherExpense } from '../../models/MasterOtherExpense';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const ExpenseManagement: React.FC = () => {
  // State untuk data
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [otherExpenses, setOtherExpenses] = useState<MasterOtherExpense[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<any[]>([]);
  const [filteredOtherExpenses, setFilteredOtherExpenses] = useState<MasterOtherExpense[]>([]);
  const [selectedDescriptionId, setSelectedDescriptionId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  
  // State untuk form
  const [formData, setFormData] = useState<Expense>({
    transaction_id: '',
    transaction_date: format(new Date(), 'yyyy-MM-dd'),
    category: '',
    category_id: '',
    description: '',
    amount: 0,
    status: 'draft',
    payment_status: 'unpaid',
    expense_code: ''
  });

  // Mengambil data expenses dan kategori saat komponen dimuat
  useEffect(() => {
    fetchExpenses();
    fetchExpenseCategories();
    fetchOtherExpenses();
  }, []);

  // Fungsi untuk mengambil data expenses
  const fetchExpenses = async () => {
    try {
      const { data, error } = await ExpenseService.getAll();
      if (error) {
        toast.error('Gagal memuat data pengeluaran: ' + error.message);
        return;
      }
      if (data) {
        setExpenses(data);
      }
    } catch (err: any) {
      toast.error('Terjadi kesalahan saat memuat data pengeluaran');
    }
  };

  // Fungsi untuk mengambil data kategori pengeluaran dari m_expenses_category
  const fetchExpenseCategories = async () => {
    try {
      const { data, error } = await MasterOtherExpenseService.getAllExpenseCategories();
      if (error) {
        toast.error('Gagal memuat data kategori pengeluaran: ' + error.message);
        return;
      }
      if (data) {
        setExpenseCategories(data);
      }
    } catch (err: any) {
      toast.error('Terjadi kesalahan saat memuat data kategori pengeluaran');
    }
  };
  
  // Fungsi untuk mengambil data deskripsi pengeluaran dari m_other_expenses
  const fetchOtherExpenses = async () => {
    try {
      const { data, error } = await MasterOtherExpenseService.getAll();
      if (error) {
        toast.error('Gagal memuat data deskripsi pengeluaran: ' + error.message);
        return;
      }
      if (data) {
        setOtherExpenses(data);
      }
    } catch (err: any) {
      toast.error('Terjadi kesalahan saat memuat data deskripsi pengeluaran');
    }
  };

  // Fungsi untuk menangani perubahan input form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Jika yang berubah adalah kategori, filter deskripsi dan update form
    if (name === 'category_id') {
      // Cari kategori yang dipilih dari m_expenses_category
      const selectedCategory = expenseCategories.find(cat => cat.id?.toString() === value);
      
      if (selectedCategory) {
        // Filter deskripsi dari m_other_expenses berdasarkan kategori yang dipilih
        const filtered = otherExpenses.filter(item => 
          item.category_id?.toString() === value || 
          item.category === selectedCategory.name
        );
        
        setFilteredOtherExpenses(filtered);
        
        // Generate transaction ID berdasarkan kode kategori
        const transactionId = generateTransactionId(selectedCategory.code);
        
        // Update form dengan kategori yang dipilih, tapi belum set deskripsi
        setFormData(prev => ({
          ...prev,
          category_id: value,
          category: selectedCategory.name,
          transaction_id: transactionId,
          expense_code: selectedCategory.code,
          description: '', // Reset deskripsi agar user pilih dari dropdown
          coa_code: '' // Reset coa_code, akan diisi saat deskripsi dipilih
        }));
      }
    } 
    // Jika yang berubah adalah deskripsi
    else if (name === 'description') {
      // Jika deskripsi dipilih dari dropdown (berupa ID dari m_other_expenses)
      if (value && value !== '') {
        // Cari deskripsi dari filteredOtherExpenses, bukan dari otherExpenses
        const selectedDesc = filteredOtherExpenses.find(item => item.id?.toString() === value);
        if (selectedDesc) {
          console.log('Deskripsi dipilih:', selectedDesc);
          // Simpan ID deskripsi yang dipilih
          setSelectedDescriptionId(value);
          setFormData(prev => ({
            ...prev,
            description: selectedDesc.name,
            coa_code: selectedDesc.coa_code || ''
          }));
        } else {
          console.log('Deskripsi tidak ditemukan untuk ID:', value);
        }
      } else {
        setSelectedDescriptionId('');
        setFormData(prev => ({
          ...prev,
          description: ''
        }));
      }
    } 
    // Untuk input lainnya
    else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'amount' ? parseFloat(value) : value
      }));
    }
  };

  // Fungsi untuk menangani submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && formData.id) {
        // Update expense yang sudah ada
        const { error } = await ExpenseService.update(formData.id.toString(), formData);
        if (error) {
          toast.error('Gagal mengupdate pengeluaran: ' + error.message);
          return;
        }
        toast.success('Pengeluaran berhasil diupdate');
      } else {
        // Tambah expense baru
        const { error } = await ExpenseService.create(formData);
        if (error) {
          toast.error('Gagal menambahkan pengeluaran: ' + error.message);
          return;
        }
        toast.success('Pengeluaran berhasil ditambahkan');
      }
      
      // Reset form dan refresh data
      resetForm();
      setShowForm(false);
      fetchExpenses();
    } catch (err: any) {
      toast.error('Terjadi kesalahan saat menyimpan data');
    }
  };

  // Fungsi untuk menangani klik tombol tambah baru
  const handleAddNew = () => {
    resetForm();
    setIsEditing(false);
    setShowForm(true);
  };

  // Fungsi untuk menangani klik tombol edit
  const handleEdit = async (id: string) => {
    try {
      const { data, error } = await ExpenseService.getById(id);
      if (error) {
        toast.error('Gagal memuat data: ' + error.message);
        return;
      }
      if (data) {
        // Cari kategori yang sesuai
        const selectedCategory = expenseCategories.find(cat => cat.id?.toString() === data.category_id);
        
        if (selectedCategory) {
          // Filter deskripsi berdasarkan kategori
          const filtered = otherExpenses.filter(item => 
            item.category_id?.toString() === data.category_id || 
            item.category === selectedCategory.name
          );
          
          setFilteredOtherExpenses(filtered);
          
          // Cari ID deskripsi berdasarkan nama deskripsi
          const descItem = filtered.find(item => item.name === data.description);
          if (descItem && descItem.id) {
            setSelectedDescriptionId(descItem.id.toString());
          } else {
            setSelectedDescriptionId('');
          }
          
          // Log untuk debugging
          console.log('Edit - Kategori dipilih:', selectedCategory);
          console.log('Edit - Deskripsi difilter:', filtered);
          console.log('Edit - Data expense:', data);
          console.log('Edit - Selected description ID:', descItem?.id);
        }
        
        // Format tanggal dengan benar
        const formattedDate = data.transaction_date ? 
          format(new Date(data.transaction_date), 'yyyy-MM-dd') : 
          format(new Date(), 'yyyy-MM-dd');
        
        setFormData({
          ...data,
          transaction_date: formattedDate
        });
        setIsEditing(true);
        setShowForm(true);
      }
    } catch (err: any) {
      toast.error('Terjadi kesalahan saat memuat data');
      console.error('Error saat edit:', err);
    }
  };

  // Fungsi untuk menangani klik tombol detail
  const handleViewDetail = async (id: string) => {
    try {
      const { data, error } = await ExpenseService.getById(id);
      if (error) {
        toast.error('Gagal memuat detail: ' + error.message);
        return;
      }
      if (data) {
        setSelectedExpense(data);
        setShowDetail(true);
      }
    } catch (err: any) {
      toast.error('Terjadi kesalahan saat memuat detail');
    }
  };

  // Fungsi untuk menangani klik tombol hapus
  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengeluaran ini?')) {
      try {
        const { error } = await ExpenseService.delete(id);
        if (error) {
          toast.error('Gagal menghapus pengeluaran: ' + error.message);
          return;
        }
        toast.success('Pengeluaran berhasil dihapus');
        fetchExpenses();
      } catch (err: any) {
        toast.error('Terjadi kesalahan saat menghapus data');
      }
    }
  };

  // Fungsi untuk menangani klik tombol bayar
  const handlePay = async (id: string) => {
    try {
      const { error } = await ExpenseService.updatePaymentStatus(id, 'paid');
      if (error) {
        toast.error('Gagal mengubah status pembayaran: ' + error.message);
        return;
      }
      toast.success('Status pembayaran berhasil diubah menjadi Lunas');
      fetchExpenses();
    } catch (err: any) {
      toast.error('Terjadi kesalahan saat mengubah status pembayaran');
    }
  };

  // Fungsi untuk menangani klik tombol terima
  const handleApprove = async (id: string) => {
    try {
      const { error } = await ExpenseService.updateStatus(id, 'completed');
      if (error) {
        toast.error('Gagal mengubah status: ' + error.message);
        return;
      }
      toast.success('Status berhasil diubah menjadi Selesai');
      fetchExpenses();
    } catch (err: any) {
      toast.error('Terjadi kesalahan saat mengubah status');
    }
  };

  // Fungsi untuk reset form
  const resetForm = () => {
    setFormData({
      transaction_id: '',
      transaction_date: format(new Date(), 'yyyy-MM-dd'),
      category: '',
      category_id: '',
      description: '',
      amount: 0,
      status: 'draft',
      payment_status: 'unpaid',
      expense_code: '',
      coa_code: ''
    });
    setFilteredOtherExpenses([]);
    setSelectedDescriptionId('');
    setIsEditing(false);
  };

  // Filter expenses berdasarkan search term
  const filteredExpenses = expenses.filter(expense => 
    expense.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format angka ke format rupiah
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format tanggal
  const formatDate = (dateString: string | Date) => {
    if (typeof dateString === 'string') {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: id });
    }
    return format(dateString, 'dd MMMM yyyy', { locale: id });
  };

  // Mendapatkan label status
  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, { label: string, color: string }> = {
      draft: { label: 'Draft', color: 'bg-gray-200 text-gray-800' },
      in_process: { label: 'Dalam Proses', color: 'bg-blue-200 text-blue-800' },
      approved: { label: 'Diterima', color: 'bg-yellow-200 text-yellow-800' },
      completed: { label: 'Selesai', color: 'bg-green-200 text-green-800' },
      cancelled: { label: 'Dibatalkan', color: 'bg-red-200 text-red-800' }
    };
    
    return statusMap[status] || { label: status, color: 'bg-gray-200 text-gray-800' };
  };

  // Mendapatkan label status pembayaran
  const getPaymentStatusLabel = (paymentStatus: string) => {
    const statusMap: Record<string, { label: string, color: string }> = {
      unpaid: { label: 'Belum Bayar', color: 'bg-red-200 text-red-800' },
      partial: { label: 'Sebagian', color: 'bg-yellow-200 text-yellow-800' },
      paid: { label: 'Lunas', color: 'bg-green-200 text-green-800' }
    };
    
    return statusMap[paymentStatus] || { label: paymentStatus, color: 'bg-gray-200 text-gray-800' };
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pengelolaan Pengeluaran</h1>
      
      {/* Search and Add Button */}
      <div className="flex justify-between mb-4">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Cari..."
            className="w-full pl-10 pr-4 py-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="h-5 w-5 mr-1" />
          Tambah Baru
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Transaksi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kategori
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deskripsi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kode COA
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total (Rp)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status Pembayaran
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((expense) => {
                const statusInfo = getStatusLabel(expense.status);
                const paymentStatusInfo = getPaymentStatusLabel(expense.payment_status);
                
                return (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {expense.transaction_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(expense.transaction_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {expense.category}
                    </td>
                    <td
  className="px-6 py-4 text-sm text-gray-500 max-w-xs break-words whitespace-pre-line max-h-12 overflow-y-auto"
  style={{ maxWidth: 180 }}
  title={expense.description}
>
  {expense.description}
</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {expense.coa_code || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatRupiah(expense.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${paymentStatusInfo.color}`}>
                        {paymentStatusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetail(expense.id!.toString())}
                          className="text-blue-600 hover:text-blue-900"
                          title="Detail"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(expense.id!.toString())}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id!.toString())}
                          className="text-red-600 hover:text-red-900"
                          title="Hapus"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                        
                        {/* Tombol Bayar hanya muncul jika status pembayaran belum bayar */}
                        {expense.payment_status === 'unpaid' && (
                          <button
                            onClick={() => handlePay(expense.id!.toString())}
                            className="text-green-600 hover:text-green-900"
                            title="Bayar"
                          >
                            <CreditCard className="h-5 w-5" />
                          </button>
                        )}
                        
                        {/* Tombol Terima hanya muncul jika status diterima */}
                        {expense.status === 'approved' && (
                          <button
                            onClick={() => handleApprove(expense.id!.toString())}
                            className="text-green-600 hover:text-green-900"
                            title="Terima"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                  {searchTerm ? 'Tidak ada data yang sesuai dengan pencarian' : 'Belum ada data pengeluaran'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {isEditing ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kolom 1 */}
                <div className="flex flex-col gap-4">
                  <div>
                    <label htmlFor="transaction_id" className="block text-sm font-medium text-gray-700 mb-1">
                      ID Transaksi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="transaction_id"
                      name="transaction_id"
                      value={formData.transaction_id}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                      disabled
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">ID Transaksi akan otomatis terisi berdasarkan kategori</p>
                  </div>
                  <div>
                    <label htmlFor="transaction_date" className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="transaction_date"
                      name="transaction_date"
                      value={typeof formData.transaction_date === 'string' ? formData.transaction_date : format(formData.transaction_date, 'yyyy-MM-dd')}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Total (Rp) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="1000"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {Object.entries(EXPENSE_STATUS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="payment_status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status Pembayaran <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="payment_status"
                      name="payment_status"
                      value={formData.payment_status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {Object.entries(PAYMENT_STATUS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Kolom 2 */}
                <div className="flex flex-col gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-md font-medium text-gray-700 mb-3">Informasi Kategori</h3>
                    <div className="mb-4">
                      <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                        Kategori <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="category_id"
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Pilih Kategori</option>
                        {expenseCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name} ({category.code})
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Pilihan kategori akan otomatis mengisi kode dan deskripsi</p>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Deskripsi <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="description"
                        name="description"
                        value={selectedDescriptionId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={!formData.category_id}
                      >
                        <option value="">Pilih Deskripsi</option>
                        {filteredOtherExpenses.map((item) => (
  <option key={item.id} value={item.id?.toString()} title={item.name}>
    {item.name}
  </option>
))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Pilih deskripsi sesuai dengan kategori yang dipilih</p>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="coa_code" className="block text-sm font-medium text-gray-700 mb-1">
                        Kode COA <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="coa_code"
                        name="coa_code"
                        value={formData.coa_code || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                        disabled
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Kode COA akan otomatis terisi berdasarkan kategori</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Detail Pengeluaran</h2>
              <button onClick={() => setShowDetail(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">ID Transaksi</p>
                <p className="text-lg">{selectedExpense.transaction_id}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Tanggal</p>
                <p className="text-lg">{formatDate(selectedExpense.transaction_date)}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Kategori</p>
                <p className="text-lg">{selectedExpense.category}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Deskripsi</p>
                <p className="text-lg">{selectedExpense.description}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Kode COA</p>
                <p className="text-lg">{selectedExpense.coa_code || '-'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-lg font-semibold">{formatRupiah(selectedExpense.amount)}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="text-lg">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusLabel(selectedExpense.status).color}`}>
                    {getStatusLabel(selectedExpense.status).label}
                  </span>
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Status Pembayaran</p>
                <p className="text-lg">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusLabel(selectedExpense.payment_status).color}`}>
                    {getPaymentStatusLabel(selectedExpense.payment_status).label}
                  </span>
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Dibuat pada</p>
                <p className="text-lg">{selectedExpense.created_at ? formatDate(selectedExpense.created_at) : '-'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Diperbarui pada</p>
                <p className="text-lg">{selectedExpense.updated_at ? formatDate(selectedExpense.updated_at) : '-'}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                onClick={() => setShowDetail(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
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

export default ExpenseManagement;
