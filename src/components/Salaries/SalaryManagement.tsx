import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Calculator, Users } from '../icons';
import { Salary, SALARY_STATUS } from '../../models/Salary';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { toast } from 'react-hot-toast';

const SalaryManagement: React.FC = () => {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('current');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null);

  // Sample data
  const sampleSalaries: Salary[] = [
    {
      id: '1',
      employee_id: '1',
      employee: { name: 'John Doe', position: 'Manager' },
      period_month: 1,
      period_year: 2025,
      basic_salary: 8000000,
      allowances: 1500000,
      deductions: 500000,
      overtime_hours: 10,
      overtime_rate: 50000,
      overtime_pay: 500000,
      gross_salary: 10000000,
      tax_deduction: 1000000,
      net_salary: 9000000,
      status: 'approved',
      notes: 'Gaji bulan Januari 2025'
    },
    {
      id: '2',
      employee_id: '2',
      employee: { name: 'Jane Smith', position: 'Staff' },
      period_month: 1,
      period_year: 2025,
      basic_salary: 5000000,
      allowances: 800000,
      deductions: 200000,
      overtime_hours: 5,
      overtime_rate: 40000,
      overtime_pay: 200000,
      gross_salary: 6000000,
      tax_deduction: 600000,
      net_salary: 5400000,
      status: 'paid',
      payment_date: '2025-01-31',
      notes: 'Gaji bulan Januari 2025'
    }
  ];

  const [formData, setFormData] = useState<Salary>({
    employee_id: '',
    period_month: new Date().getMonth() + 1,
    period_year: new Date().getFullYear(),
    basic_salary: 0,
    allowances: 0,
    deductions: 0,
    overtime_hours: 0,
    overtime_rate: 0,
    overtime_pay: 0,
    gross_salary: 0,
    tax_deduction: 0,
    net_salary: 0,
    status: 'draft',
    notes: ''
  });

  useEffect(() => {
    setSalaries(sampleSalaries);
  }, []);

  // Calculate gross and net salary
  useEffect(() => {
    const gross = formData.basic_salary + formData.allowances + formData.overtime_pay;
    const net = gross - formData.deductions - formData.tax_deduction;
    setFormData(prev => ({
      ...prev,
      overtime_pay: prev.overtime_hours * prev.overtime_rate,
      gross_salary: gross,
      net_salary: net
    }));
  }, [formData.basic_salary, formData.allowances, formData.deductions, formData.overtime_hours, formData.overtime_rate, formData.tax_deduction]);

  const filteredSalaries = salaries.filter(salary => {
    const matchesSearch = salary.employee?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || salary.status === statusFilter;
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const matchesPeriod = periodFilter === 'all' || 
                         (periodFilter === 'current' && salary.period_month === currentMonth && salary.period_year === currentYear);
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  const handleAdd = () => {
    setFormData({
      employee_id: '',
      period_month: new Date().getMonth() + 1,
      period_year: new Date().getFullYear(),
      basic_salary: 0,
      allowances: 0,
      deductions: 0,
      overtime_hours: 0,
      overtime_rate: 0,
      overtime_pay: 0,
      gross_salary: 0,
      tax_deduction: 0,
      net_salary: 0,
      status: 'draft',
      notes: ''
    });
    setShowAddModal(true);
  };

  const handleEdit = (salary: Salary) => {
    setSelectedSalary(salary);
    setFormData(salary);
    setShowEditModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSalary) {
      setSalaries(salaries.map(s => s.id === selectedSalary.id ? { ...formData, id: selectedSalary.id } : s));
      toast.success('Salary berhasil diperbarui');
    } else {
      setSalaries([...salaries, { ...formData, id: String(salaries.length + 1) }]);
      toast.success('Salary berhasil ditambahkan');
    }
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedSalary(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Salary Management</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          <span>Add Salary</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-md">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{salaries.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-md">
              <Calculator className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Payroll</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(salaries.reduce((sum, s) => sum + s.net_salary, 0))}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-md">
              <Eye className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900">
                {salaries.filter(s => s.status === 'draft').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            {Object.entries(SALARY_STATUS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="current">Current Month</option>
            <option value="all">All Periods</option>
          </select>
        </div>
      </div>

      {/* Salaries Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Basic Salary</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gross Salary</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Salary</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredSalaries.map((salary) => (
              <tr key={salary.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{salary.employee?.name}</div>
                    <div className="text-sm text-gray-500">{salary.employee?.position}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(salary.period_year, salary.period_month - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(salary.basic_salary)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(salary.gross_salary)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                  {formatCurrency(salary.net_salary)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(salary.status)}`}>
                    {SALARY_STATUS[salary.status as keyof typeof SALARY_STATUS]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(salary)}
                      className="text-yellow-600 hover:text-yellow-900"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {showAddModal ? 'Add Salary Record' : 'Edit Salary Record'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee
                  </label>
                  <select
                    value={formData.employee_id}
                    onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Select Employee</option>
                    <option value="1">John Doe - Manager</option>
                    <option value="2">Jane Smith - Staff</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Month
                    </label>
                    <select
                      value={formData.period_month}
                      onChange={(e) => setFormData({...formData, period_month: Number(e.target.value)})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      {Array.from({length: 12}, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(2025, i).toLocaleDateString('id-ID', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <input
                      type="number"
                      value={formData.period_year}
                      onChange={(e) => setFormData({...formData, period_year: Number(e.target.value)})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      min="2020"
                      max="2030"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Basic Salary
                  </label>
                  <input
                    type="number"
                    value={formData.basic_salary}
                    onChange={(e) => setFormData({...formData, basic_salary: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allowances
                  </label>
                  <input
                    type="number"
                    value={formData.allowances}
                    onChange={(e) => setFormData({...formData, allowances: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deductions
                  </label>
                  <input
                    type="number"
                    value={formData.deductions}
                    onChange={(e) => setFormData({...formData, deductions: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Overtime Hours
                  </label>
                  <input
                    type="number"
                    value={formData.overtime_hours}
                    onChange={(e) => setFormData({...formData, overtime_hours: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Overtime Rate
                  </label>
                  <input
                    type="number"
                    value={formData.overtime_rate}
                    onChange={(e) => setFormData({...formData, overtime_rate: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Deduction
                  </label>
                  <input
                    type="number"
                    value={formData.tax_deduction}
                    onChange={(e) => setFormData({...formData, tax_deduction: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Gross Salary</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(formData.gross_salary)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Net Salary</p>
                    <p className="text-lg font-semibold text-green-600">{formatCurrency(formData.net_salary)}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryManagement;