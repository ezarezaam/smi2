import React, { useState, useEffect } from 'react';
import { UOM, sampleUOMs } from '../../models/UOM';
import { UOMService } from '../../services/UOMService';
import { Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const UOMManagement: React.FC = () => {
  const [uoms, setUOMs] = useState<UOM[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<UOM>>({
    code: '',
    name: '',
    description: '',
    is_active: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSampleDataButton, setShowSampleDataButton] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtered UOMs based on search term
  const filteredUOMs = uoms.filter(uom => 
    uom.code?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    uom.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uom.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load UOMs
  const loadUOMs = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await UOMService.getAll();
      
      if (error) throw error;
      setUOMs(data || []);
      
      // Show sample data button if no UOMs exist
      setShowSampleDataButton((data || []).length === 0);
    } catch (err: any) {
      toast.error(`Error loading UOMs: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Check if code already exists
      const codeExists = await UOMService.isCodeExists(
        formData.code?.toUpperCase() || '',
        editingId || undefined
      );
      
      if (codeExists) {
        toast.error('UOM code already exists');
        return;
      }

      if (editingId) {
        // Update existing UOM
        const { error } = await UOMService.update(editingId, formData);
        if (error) throw error;
        toast.success('UOM updated successfully');
      } else {
        // Create new UOM
        const { error } = await UOMService.create({
          ...formData,
          code: formData.code?.toUpperCase(),
        } as UOM);
        if (error) throw error;
        toast.success('UOM created successfully');
      }
      
      resetForm();
      setShowForm(false);
      loadUOMs();
    } catch (error) {
      console.error('Error saving UOM:', error);
      toast.error('Failed to save UOM');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (uom: UOM) => {
    if (!uom.id) return;
    
    setEditingId(uom.id.toString());
    setFormData({
      code: uom.code,
      name: uom.name,
      description: uom.description || '',
      is_active: uom.is_active ?? true,
    });
    
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this UOM?')) {
      try {
        const { error } = await UOMService.delete(id);
        if (error) throw error;
        
        toast.success('UOM deleted successfully');
        loadUOMs();
      } catch (error) {
        console.error('Error deleting UOM:', error);
        toast.error('Failed to delete UOM');
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      is_active: true,
    });
  };
  
  // Handle add new
  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  // Generate sample data
  const generateSampleData = async () => {
    if (!window.confirm('This will create sample UOM data. Continue?')) return;
    
    try {
      setIsSubmitting(true);
      
      for (const uom of sampleUOMs) {
        // Check if UOM with this code already exists
        const { data: existing } = await UOMService.getAll();
        const exists = existing?.some(u => u.code === uom.code);
        
        if (!exists) {
          await UOMService.create({
            ...uom,
            is_active: true,
          });
        }
      }
      
      toast.success('Sample UOM data generated successfully');
      await loadUOMs();
      setShowSampleDataButton(false);
    } catch (err: any) {
      toast.error(`Error generating sample data: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadUOMs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">Unit of Measurement</h1>
        <div className="flex space-x-2">
          {!showForm && (
            <button
              onClick={handleAddNew}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-1" />
              Tambah Baru
            </button>
          )}
          
          {showSampleDataButton && (
            <button
              onClick={generateSampleData}
              disabled={isSubmitting}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 mr-1 animate-spin" />
              ) : (
                'Generate Sample Data'
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="relative w-full md:w-96 mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Cari UOM..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">
              {editingId ? 'Edit UOM' : 'Tambah UOM Baru'}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  Kode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  id="code"
                  value={formData.code}
                  onChange={handleChange}
                  maxLength={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center">
                  <input
                    id="is_active"
                    name="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Aktif
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="inline-block animate-spin h-4 w-4 mr-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    {editingId ? 'Update' : 'Simpan'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2">Loading...</p>
          </div>
        ) : filteredUOMs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'Tidak ada data yang sesuai dengan pencarian' : 'Belum ada data UOM'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUOMs.map((uom) => (
                  <tr key={uom.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{uom.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{uom.name}</td>
                    <td className="px-6 py-4">{uom.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        uom.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {uom.is_active ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(uom)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => uom.id && handleDelete(uom.id)}
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

export default UOMManagement;
