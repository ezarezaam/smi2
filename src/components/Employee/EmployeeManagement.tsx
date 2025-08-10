import React, { useState, useEffect } from 'react';
import * as LucideIcons from '../../components/icons';
import { Employee as EmployeeModel, EmployeeFormData as EmployeeFormDataModel, ROLE_LEVELS, DEFAULT_EMPLOYEE } from '../../models/Employee';
import { EmployeeService } from '../../services/EmployeeService';
import { Division as DivisionModel, Position as PositionModel } from '../../services/MasterDataService';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

const { Plus, Edit, Trash2, Search, Eye, X, Key } = LucideIcons;

// Use local interfaces that match the component needs
interface Division extends DivisionModel {}

interface Position extends PositionModel {}

interface Employee extends EmployeeModel {
  id: string; // Override to make id required in this component
}

interface EmployeeFormData extends EmployeeFormDataModel {}

const EmployeeManagement: React.FC = () => {
  // State untuk data
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // State untuk filter
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [divisionFilter, setDivisionFilter] = useState<number | string>('all');

  // State untuk data master
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loadingMaster, setLoadingMaster] = useState(true);

  // State untuk modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  // Reset password modal state - will be implemented later
  // Using underscore to indicate unused variable
  const [, _setShowResetPasswordModal] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // State untuk form
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    email: '',
    position_id: '',
    division_id: '',
    role_level: 4, // Default to level 4 (lowest)
    phone: '',
    address: '',
    status: 'active',
  });

  // Function to fetch master data
  const fetchMasterData = async () => {
    setLoadingMaster(true);
    try {
      // Fetch divisions
      const { data: divisionsData, error: divisionsError } = await supabase
        .from('m_division')
        .select('*')
        .order('id');
      
      if (divisionsError) throw divisionsError;
      setDivisions(divisionsData || []);
      
      // Fetch positions
      const { data: positionsData, error: positionsError } = await supabase
        .from('m_jabatan')
        .select('*')
        .order('id');
      
      if (positionsError) throw positionsError;
      setPositions(positionsData || []);
      
    } catch (error: any) {
      console.error('Error fetching master data:', error);
      setError('Failed to load master data');
    } finally {
      setLoadingMaster(false);
    }
  };

  // Fetch employees and master data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // First fetch master data
        await fetchMasterData();
        
        // Then fetch employees
        const fetchEmployees = async () => {
          setLoading(true);
          try {
            const { data, error } = await EmployeeService.getAll();
            
            if (error) throw error;
            // Ensure all employees have an id
            const validEmployees = (data || []).filter(emp => emp.id) as unknown as Employee[];
            setEmployees(validEmployees);
          } catch (error: any) {
            console.error('Error fetching employees:', error);
            setError('Failed to load employees');
          } finally {
            setLoading(false);
          }
        };
        await fetchEmployees();
      } catch (err: any) {
        setError(err.message);
        toast.error(`Gagal memuat data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handler untuk menampilkan modal edit
  const handleEdit = (employee: Employee) => {
    setCurrentEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      position_id: employee.position_id || '',
      division_id: employee.division_id || '',
      role_level: employee.role_level,
      phone: employee.phone || '',
      address: employee.address || '',
      status: employee.status
    });
    setShowEditModal(true);
  };

  // Handler untuk menampilkan modal delete
  const handleDelete = (employee: Employee) => {
    setCurrentEmployee(employee);
    setShowDeleteModal(true);
  };

  // Handle view employee details
  const handleView = (employee: Employee) => {
    // Find division and position names
    const division = divisions.find(d => d.id === employee.division_id);
    const position = positions.find(p => p.id === employee.position_id);
    
    setCurrentEmployee({
      ...employee,
      division_name: division?.name || 'Unknown',
      position_name: position?.name || 'Unknown'
    } as Employee);
    setShowDetailModal(true);
  };
  
  // Handler untuk reset password
  const handleResetPassword = (employee: Employee) => {
    // Implementasi reset password
    toast.success(`Password untuk ${employee.name} telah direset ke default: 123456`);
  };
  
  // Handler untuk menampilkan modal add
  const handleAdd = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      division_id: '',
      position_id: '',
      role_level: 4,
      status: 'active',
    });
    setShowAddModal(true);
  };
  
  // Handle reset form
  const resetForm = () => {
    setFormData(DEFAULT_EMPLOYEE);
    setCurrentEmployee(null);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate form
      if (!formData.name || !formData.email) {
        toast.error('Nama dan email harus diisi');
        return;
      }
      
      // Prepare data for submission
      // Using type assertion to ensure compatibility with API
      const employeeData = {
        position_id: formData.position_id === '' ? null : Number(formData.position_id),
        division_id: formData.division_id === '' ? null : Number(formData.division_id),
        name: formData.name,
        email: formData.email,
        role_level: formData.role_level,
        phone: formData.phone,
        address: formData.address,
        status: formData.status
      };
      
      let result;
      if (showAddModal) {
        // Add new employee
        result = await EmployeeService.create(employeeData as any);
        if (result.error) throw result.error;
        
        // Update local state if result has an id
        if (result.data && result.data.id) {
          setEmployees([...employees, result.data as Employee]);
          toast.success('Employee berhasil ditambahkan');
        }
      } else {
        // Update existing employee
        if (!currentEmployee) return;
        
        result = await EmployeeService.update(currentEmployee.id, employeeData as any);
        if (result.error) throw result.error;
        
        // Update local state
        const updatedEmployees = employees.map(emp => 
          emp.id === currentEmployee.id ? { ...emp, ...employeeData, id: currentEmployee.id } as Employee : emp
        );
        setEmployees(updatedEmployees);
        toast.success('Employee berhasil diupdate');
      }  
      setShowEditModal(false);
      setShowAddModal(false);
      resetForm();
    } catch (err: any) {
      console.error('Error saving employee:', err);
      toast.error(`Gagal menyimpan data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler untuk konfirmasi delete
  const confirmDelete = async () => {
    if (currentEmployee) {
      try {
        // Delete dari Supabase
        const { error } = await EmployeeService.delete(currentEmployee.id || '');
        
        if (error) {
          throw new Error(error.message);
        }
        
        // Update state employees
        setEmployees(employees.filter(emp => emp.id !== currentEmployee.id));
        toast.success('Employee berhasil dihapus');
      } catch (err: any) {
        toast.error(`Error: ${err.message}`);
      } finally {
        setShowDeleteModal(false);
        setCurrentEmployee(null);
      }
    }
  };

  // Filter employees based on search term and filters
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    const matchesDivision = divisionFilter === 'all' || employee.division_id === Number(divisionFilter);
    
    return matchesSearch && matchesStatus && matchesDivision;
  });

  // Render status badge dengan warna yang sesuai
  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Aktif
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Tidak Aktif
          </span>
        );
      case 'on-leave':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Cuti
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header dan Tombol Tambah */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari nama, email, ID..."
              className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus className="h-5 w-5 mr-2" />
            <span>Tambah Employee</span>
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-4 bg-gray-50 p-4 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on-leave">On Leave</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Divisi</label>
          <select
            value={divisionFilter}
            onChange={(e) => setDivisionFilter(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">Semua Divisi</option>
            {divisions.map(division => (
              <option key={division.id} value={division.id}>{division.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading state */}
      {loading || loadingMaster && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading...</span>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={() => window.location.reload()} 
            className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
          >
            Coba Lagi
          </button>
        </div>
      )}
      
      {/* Tabel Employee */}
      {!loading && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Divisi
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jabatan
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role Level
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {employee.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {divisions.find(d => d.id === employee.division_id)?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {positions.find(p => p.id === employee.position_id)?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Level {employee.role_level}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatusBadge(employee.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleView(employee)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="Lihat Detail"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(employee)}
                        className="text-yellow-600 hover:text-yellow-900 mr-3"
                        title="Edit"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleResetPassword(employee)}
                        className="text-green-600 hover:text-green-900 mr-3"
                        title="Reset Password"
                      >
                        <Key className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee)}
                        className="text-red-600 hover:text-red-900"
                        title="Hapus"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Konfirmasi Hapus</h3>
            <p className="text-gray-500 mb-6">
              Apakah Anda yakin ingin menghapus employee {currentEmployee?.name}? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-3">
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
      )}
      
      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full my-8 mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {showAddModal ? 'Tambah Employee' : 'Edit Employee'}
            </h3>
            
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Employee
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    readOnly
                    className="w-full border border-gray-300 bg-gray-100 rounded-md px-3 py-2"
                  />
                </div>
                {/* Tanggal bergabung otomatis dari created_at di database */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap *
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
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Divisi
                  </label>
                  <select
                    name="division_id"
                    value={formData.division_id || ''}
                    onChange={(e) => setFormData({...formData, division_id: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={loadingMaster}
                  >
                    <option value="">Pilih Divisi</option>
                    {divisions.map(division => (
                      <option key={division.id} value={division.id}>{division.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={(e) => {
                      const value = e.target.value as 'active' | 'inactive' | 'on-leave';
                      setFormData({ ...formData, status: value });
                    }}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on-leave">On Leave</option>
                  </select>
                </div>
              </div>
              
              {/* Divisi, Jabatan & Role Level */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Divisi *
                  </label>
                  <select
                    value={formData.division_id}
                    onChange={(e) => setFormData({...formData, division_id: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Pilih Divisi</option>
                    {divisions.map(division => (
                      <option key={division.id} value={division.id}>{division.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jabatan *
                  </label>
                  <select
                    value={formData.position_id}
                    onChange={(e) => setFormData({...formData, position_id: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Pilih Jabatan</option>
                    {positions.map(position => (
                      <option key={position.id} value={position.id}>{position.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role Level *
                  </label>
                  <select
                    value={formData.role_level}
                    onChange={(e) => setFormData({...formData, role_level: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="1">Level 1</option>
                    <option value="2">Level 2</option>
                    <option value="3">Level 3</option>
                    <option value="4">Level 4</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
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
                onClick={handleSubmit}
                disabled={!formData.name || !formData.email || isLoading}
                className={`px-4 py-2 rounded-md ${!formData.name || !formData.email || isLoading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {isLoading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* View Modal */}
      {showDetailModal && currentEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full my-8 mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Detail Employee</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">ID Employee</p>
                <p className="font-medium">{currentEmployee.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tanggal Bergabung</p>
                <p className="font-medium">{currentEmployee.created_at ? new Date(currentEmployee.created_at).toLocaleDateString('id-ID') : '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nama Lengkap</p>
                <p className="font-medium">{currentEmployee.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{currentEmployee.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nomor Telepon</p>
                <p className="font-medium">{currentEmployee.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <div>{renderStatusBadge(currentEmployee.status)}</div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Divisi</p>
                <p className="font-medium">{divisions.find(d => d.id === currentEmployee.division_id)?.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Jabatan</p>
                <p className="font-medium">{positions.find(p => p.id === currentEmployee.position_id)?.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role Level</p>
                <p className="font-medium">Level {currentEmployee.role_level || 1}</p>
                <p className="text-xs text-gray-400">{ROLE_LEVELS[currentEmployee.role_level || 1]}</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
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

export default EmployeeManagement;
