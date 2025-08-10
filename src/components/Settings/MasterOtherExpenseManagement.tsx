import React, { useState, useEffect } from 'react';
import { MasterOtherExpense, EXPENSE_STATUS } from '../../models/MasterOtherExpense';
import MasterOtherExpenseService from '../../services/MasterOtherExpenseService';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';

const MasterOtherExpenseManagement: React.FC = () => {
  const [otherExpenses, setOtherExpenses] = useState<MasterOtherExpense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [coaList, setCoaList] = useState<{code: string, name: string}[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<{id: number, code: string, name: string}[]>([]);
  
  const [formData, setFormData] = useState<MasterOtherExpense>({
    code: '',
    category: '',
    name: '',
    status: 1,
    coa_code: ''
  });

  useEffect(() => {
    fetchOtherExpenses();
    fetchCoaList();
    fetchExpenseCategories();
  }, []);

  const fetchOtherExpenses = async () => {
    setLoading(true);
    try {
      const { data, error } = await MasterOtherExpenseService.getAll();
      if (error) {
        toast.error('Gagal memuat data pengeluaran lain: ' + error.message);
      } else if (data) {
        setOtherExpenses(data);
      }
    } catch (err) {
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCoaList = async () => {
    try {
      const { data, error } = await MasterOtherExpenseService.getAllCoa();
      if (error) {
        toast.error('Gagal memuat data COA: ' + error.message);
      } else if (data) {
        setCoaList(data);
      }
    } catch (err) {
      toast.error('Terjadi kesalahan saat memuat data COA');
    }
  };
  
  const fetchExpenseCategories = async () => {
    try {
      const { data, error } = await MasterOtherExpenseService.getAllExpenseCategories();
      if (error) {
        toast.error('Gagal memuat data kategori pengeluaran: ' + error.message);
      } else if (data) {
        setExpenseCategories(data);
      }
    } catch (err) {
      toast.error('Terjadi kesalahan saat memuat data kategori pengeluaran');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Jika yang berubah adalah kategori, update kode berdasarkan kategori yang dipilih
    if (name === 'category') {
      console.log('Kategori dipilih, value:', value);
      setFormData(prev => {
        const newState = {
          ...prev,
          category: expenseCategories.find(cat => cat.id.toString() === value)?.name || '',
          category_id: value, // legacy
          expenses_category_id: value, // PASTIKAN INI SELALU TERISI
          code: expenseCategories.find(cat => cat.id.toString() === value)?.code || ''
        };
        console.log('State setelah pilih kategori:', newState);
        return newState;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'status' ? parseInt(value) : value
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      category: '',
      category_id: '', // legacy
      expenses_category_id: '',
      name: '',
      status: 1,
      coa_code: ''
    });
    setIsEditing(false);
  };

  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = async (id: number) => {
    try {
      const { data, error } = await MasterOtherExpenseService.getById(id);
      if (error) {
        toast.error('Gagal memuat data: ' + error.message);
        return;
      }
      if (data) {
        // Cari kategori berdasarkan nama untuk mendapatkan ID
        const categoryMatch = expenseCategories.find(cat => cat.name === data.category);
        
        setFormData({
          id: data.id,
          code: data.code,
          category: data.category,
          category_id: categoryMatch ? categoryMatch.id.toString() : '',
          expenses_category_id: data.expenses_category_id ? data.expenses_category_id.toString() : (categoryMatch ? categoryMatch.id.toString() : ''),
          name: data.name,
          status: data.status,
          coa_code: data.coa_code
        });
        setIsEditing(true);
        setShowForm(true);
      }
    } catch (err) {
      toast.error('Terjadi kesalahan saat memuat data');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      try {
        const { error } = await MasterOtherExpenseService.delete(id);
        if (error) {
          toast.error('Gagal menghapus data: ' + error.message);
        } else {
          toast.success('Data berhasil dihapus');
          fetchOtherExpenses();
        }
      } catch (err) {
        toast.error('Terjadi kesalahan saat menghapus data');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.name || !formData.coa_code) {
      toast.error('Semua field harus diisi');
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        expenses_category_id: formData.expenses_category_id ? Number(formData.expenses_category_id) : null,
      };
      console.log('Data yang akan dikirim ke Supabase:', dataToSend);
      if (isEditing && formData.id) {
        const { error } = await MasterOtherExpenseService.update(formData.id, dataToSend);
        if (error) {
          toast.error('Gagal mengupdate data: ' + error.message);
          return;
        }
        toast.success('Data berhasil diupdate');
      } else {
        const { error } = await MasterOtherExpenseService.create(dataToSend);
        if (error) {
          toast.error('Gagal menambahkan data: ' + error.message);
          return;
        }
        toast.success('Data berhasil ditambahkan');
      }
      
      setShowForm(false);
      resetForm();
      fetchOtherExpenses();
    } catch (err) {
      toast.error('Terjadi kesalahan saat menyimpan data');
    }
  };

  const filteredExpenses = otherExpenses.filter(expense => 
    expense.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.coa?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Pengelolaan Pengeluaran Lain</h1>
      
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

      {/* Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {isEditing ? 'Edit Pengeluaran Lain' : 'Tambah Pengeluaran Lain'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  Kode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                  disabled
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Kode akan otomatis terisi berdasarkan kategori</p>
              </div>

              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.expenses_category_id || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {expenseCategories.map((category) => (
                    <option key={category.id} value={category.id.toString()}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <textarea
                  name="name"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Kode COA</label>
                <select
                  name="coa_code"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.coa_code}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Pilih Kode COA</option>
                  {coaList.map(coa => (
                    <option key={coa.code} value={coa.code}>
                      {coa.code} - {coa.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  {Object.entries(EXPENSE_STATUS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {isEditing ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2">Loading...</p>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'Tidak ada data yang sesuai dengan pencarian' : 'Belum ada data pengeluaran lain'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode COA</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{expense.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{expense.category}</td>
                    <td className="px-6 py-4">{expense.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {expense.coa_code} {expense.coa && `- ${expense.coa.name}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        expense.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {EXPENSE_STATUS[expense.status as keyof typeof EXPENSE_STATUS]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => expense.id && handleEdit(expense.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => expense.id && handleDelete(expense.id)}
                          className="text-red-600 hover:text-red-900"
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
      </div>
    </div>
  );
};

export default MasterOtherExpenseManagement;
