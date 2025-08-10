import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, DollarSign, Calendar, TrendingUp, CreditCard } from '../icons';
import { Loan, LoanPayment, LOAN_STATUS, LOAN_TYPES, DEFAULT_LOAN } from '../../models/Loan';
import { LoanService } from '../../services/LoanService';
import { EmployeeService } from '../../services/EmployeeService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { toast } from 'react-hot-toast';

const LoanManagement: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<Loan>(DEFAULT_LOAN);
  const [paymentData, setPaymentData] = useState<LoanPayment>({
    loan_id: '',
    payment_number: '',
    payment_date: new Date().toISOString().split('T')[0],
    amount: 0,
    principal_amount: 0,
    interest_amount: 0,
    remaining_balance: 0,
    status: 'completed',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load loans
      const { data: loansData, error: loansError } = await LoanService.getAll();
      if (loansError) throw loansError;
      setLoans(loansData || []);

      // Load employees for borrower selection
      const { data: employeesData, error: employeesError } = await EmployeeService.getAll();
      if (employeesError) throw employeesError;
      setEmployees(employeesData || []);
    } catch (error: any) {
      toast.error('Gagal memuat data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate monthly payment and end date
  useEffect(() => {
    if (formData.principal_amount && formData.interest_rate && formData.term_months) {
      const monthlyRate = formData.interest_rate / 100 / 12;
      const payment = formData.principal_amount * (monthlyRate * Math.pow(1 + monthlyRate, formData.term_months)) / 
                     (Math.pow(1 + monthlyRate, formData.term_months) - 1);
      
      const startDate = new Date(formData.start_date);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + formData.term_months);
      
      setFormData(prev => ({
        ...prev,
        monthly_payment: Math.round(payment),
        remaining_balance: prev.remaining_balance || prev.principal_amount,
        end_date: endDate.toISOString().split('T')[0]
      }));
    }
  }, [formData.principal_amount, formData.interest_rate, formData.term_months, formData.start_date]);

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.loan_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.borrower_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    const matchesType = typeFilter === 'all' || loan.borrower_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleAdd = () => {
    setFormData({
      ...DEFAULT_LOAN,
      loan_number: LoanService.generateLoanNumber()
    });
    setShowAddModal(true);
  };

  const handleEdit = (loan: Loan) => {
    setSelectedLoan(loan);
    setFormData(loan);
    setShowEditModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitLoan = async () => {
      try {
        setIsLoading(true);
        
        if (selectedLoan?.id) {
          const { error } = await LoanService.update(selectedLoan.id, formData);
          if (error) throw error;
          toast.success('Loan berhasil diperbarui');
        } else {
          const { error } = await LoanService.create(formData);
          if (error) throw error;
          toast.success('Loan berhasil ditambahkan');
        }
        
        setShowAddModal(false);
        setShowEditModal(false);
        setSelectedLoan(null);
        loadData();
      } catch (error: any) {
        toast.error('Gagal menyimpan loan: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    submitLoan();
  };

  const handleDelete = (loan: Loan) => {
    setSelectedLoan(loan);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedLoan?.id) return;
    
    try {
      setIsLoading(true);
      const { error } = await LoanService.delete(selectedLoan.id);
      if (error) throw error;
      
      toast.success('Loan berhasil dihapus');
      setShowDeleteModal(false);
      setSelectedLoan(null);
      loadData();
    } catch (error: any) {
      toast.error('Gagal menghapus loan: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordPayment = (loan: Loan) => {
    setSelectedLoan(loan);
    setPaymentData({
      loan_id: loan.id || '',
      payment_number: `LP-${loan.loan_number}-${String(Date.now()).slice(-4)}`,
      payment_date: new Date().toISOString().split('T')[0],
      amount: loan.monthly_payment,
      principal_amount: loan.monthly_payment * 0.8,
      interest_amount: loan.monthly_payment * 0.2,
      remaining_balance: loan.remaining_balance - (loan.monthly_payment * 0.8),
      status: 'completed',
      notes: ''
    });
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const { error } = await LoanService.recordPayment(paymentData.loan_id, paymentData);
      if (error) throw error;
      
      toast.success('Pembayaran berhasil dicatat');
      setShowPaymentModal(false);
      loadData();
    } catch (error: any) {
      toast.error('Gagal mencatat pembayaran: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paid_off': return 'bg-blue-100 text-blue-800';
      case 'defaulted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'employee': return 'bg-blue-100 text-blue-800';
      case 'business': return 'bg-green-100 text-green-800';
      case 'equipment': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Loan Management</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          <span>Add Loan</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-md">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Principal</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(loans.reduce((sum, l) => sum + l.principal_amount, 0))}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-md">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Outstanding</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(loans.reduce((sum, l) => sum + l.remaining_balance, 0))}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-md">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Loans</p>
              <p className="text-2xl font-bold text-gray-900">
                {loans.filter(l => l.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-md">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Monthly Payment</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(loans.filter(l => l.status === 'active').reduce((sum, l) => sum + l.monthly_payment, 0))}
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
                placeholder="Search loans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {Object.entries(LOAN_TYPES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            {Object.entries(LOAN_STATUS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loan Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Borrower</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Principal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remaining</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monthly Payment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredLoans.map((loan) => (
              <tr key={loan.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {loan.loan_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {loan.borrower_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(loan.borrower_type)}`}>
                    {LOAN_TYPES[loan.borrower_type as keyof typeof LOAN_TYPES]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(loan.principal_amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(loan.remaining_balance)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(loan.monthly_payment)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(loan.status)}`}>
                    {LOAN_STATUS[loan.status as keyof typeof LOAN_STATUS]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {loan.status === 'active' && (
                      <button
                        onClick={() => handleRecordPayment(loan)}
                        className="text-green-600 hover:text-green-900"
                        title="Record Payment"
                      >
                        <CreditCard className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(loan)}
                      className="text-yellow-600 hover:text-yellow-900"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(loan)}
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

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {showAddModal ? 'Add New Loan' : 'Edit Loan'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loan Number
                  </label>
                  <input
                    type="text"
                    value={formData.loan_number}
                    onChange={(e) => setFormData({...formData, loan_number: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Borrower Name
                  </label>
                  <input
                    type="text"
                    value={formData.borrower_name}
                    onChange={(e) => setFormData({...formData, borrower_name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Borrower Type
                  </label>
                  <select
                    value={formData.borrower_type}
                    onChange={(e) => setFormData({...formData, borrower_type: e.target.value as any})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    {Object.entries(LOAN_TYPES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                {formData.borrower_type === 'employee' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee
                    </label>
                    <select
                      value={formData.borrower_id || ''}
                      onChange={(e) => {
                        const employee = employees.find(emp => emp.id === e.target.value);
                        setFormData({
                          ...formData, 
                          borrower_id: e.target.value,
                          borrower_name: employee?.name || ''
                        });
                      }}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Select Employee</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} - {emp.position || 'No Position'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Principal Amount
                  </label>
                  <input
                    type="number"
                    value={formData.principal_amount}
                    onChange={(e) => setFormData({...formData, principal_amount: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interest Rate (% per year)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.interest_rate}
                    onChange={(e) => setFormData({...formData, interest_rate: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Term (months)
                  </label>
                  <input
                    type="number"
                    value={formData.term_months}
                    onChange={(e) => setFormData({...formData, term_months: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={typeof formData.start_date === 'string' ? formData.start_date.split('T')[0] : ''}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={typeof formData.end_date === 'string' ? formData.end_date.split('T')[0] : ''}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
                    readOnly
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Calculated Values</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Monthly Payment</p>
                    <p className="text-lg font-semibold text-blue-600">{formatCurrency(formData.monthly_payment)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Remaining Balance</p>
                    <p className="text-lg font-semibold text-yellow-600">{formatCurrency(formData.remaining_balance)}</p>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedLoan && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Konfirmasi Hapus</h3>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus loan {selectedLoan.loan_number}?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedLoan && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Record Loan Payment</h3>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Number
                  </label>
                  <input
                    type="text"
                    value={paymentData.payment_number}
                    onChange={(e) => setPaymentData({...paymentData, payment_number: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={typeof paymentData.payment_date === 'string' ? paymentData.payment_date.split('T')[0] : ''}
                    onChange={(e) => setPaymentData({...paymentData, payment_date: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Amount
                  </label>
                  <input
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({...paymentData, amount: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Principal Amount
                  </label>
                  <input
                    type="number"
                    value={paymentData.principal_amount}
                    onChange={(e) => setPaymentData({...paymentData, principal_amount: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interest Amount
                  </label>
                  <input
                    type="number"
                    value={paymentData.interest_amount}
                    onChange={(e) => setPaymentData({...paymentData, interest_amount: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remaining Balance
                  </label>
                  <input
                    type="number"
                    value={paymentData.remaining_balance}
                    onChange={(e) => setPaymentData({...paymentData, remaining_balance: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {isLoading ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanManagement;