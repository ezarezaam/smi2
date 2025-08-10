import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, BookOpen, Calculator } from '../icons';
import { JournalEntry, JournalItem, JOURNAL_STATUS } from '../../models/JournalEntry';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { toast } from 'react-hot-toast';

const JournalEntryManagement: React.FC = () => {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // Sample data
  const sampleEntries: JournalEntry[] = [
    {
      id: '1',
      entry_number: 'JE-001',
      entry_date: '2025-01-15',
      description: 'Penjualan produk kepada PT Maju Bersama',
      reference_type: 'sales_order',
      reference_id: 'SO-001',
      total_debit: 15000000,
      total_credit: 15000000,
      status: 'posted',
      items: [
        {
          id: '1',
          coa_code: '1100',
          coa: { code: '1100', name: 'Kas' },
          description: 'Penerimaan kas dari penjualan',
          debit_amount: 15000000,
          credit_amount: 0
        },
        {
          id: '2',
          coa_code: '4000',
          coa: { code: '4000', name: 'Pendapatan Penjualan' },
          description: 'Pendapatan dari penjualan produk',
          debit_amount: 0,
          credit_amount: 15000000
        }
      ]
    }
  ];

  const [formData, setFormData] = useState<JournalEntry>({
    entry_number: '',
    entry_date: new Date().toISOString().split('T')[0],
    description: '',
    reference_type: '',
    reference_id: '',
    total_debit: 0,
    total_credit: 0,
    status: 'draft',
    notes: '',
    items: []
  });

  const [journalItems, setJournalItems] = useState<JournalItem[]>([]);

  useEffect(() => {
    setJournalEntries(sampleEntries);
  }, []);

  // Calculate totals
  useEffect(() => {
    const totalDebit = journalItems.reduce((sum, item) => sum + item.debit_amount, 0);
    const totalCredit = journalItems.reduce((sum, item) => sum + item.credit_amount, 0);
    setFormData(prev => ({
      ...prev,
      total_debit: totalDebit,
      total_credit: totalCredit,
      items: journalItems
    }));
  }, [journalItems]);

  const filteredEntries = journalEntries.filter(entry => {
    const matchesSearch = entry.entry_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAdd = () => {
    setFormData({
      entry_number: `JE-${String(journalEntries.length + 1).padStart(3, '0')}`,
      entry_date: new Date().toISOString().split('T')[0],
      description: '',
      reference_type: '',
      reference_id: '',
      total_debit: 0,
      total_credit: 0,
      status: 'draft',
      notes: '',
      items: []
    });
    setJournalItems([]);
    setShowAddModal(true);
  };

  const handleEdit = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setFormData(entry);
    setJournalItems(entry.items || []);
    setShowEditModal(true);
  };

  const handleView = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setShowDetailModal(true);
  };

  const addJournalItem = () => {
    setJournalItems([...journalItems, {
      id: String(journalItems.length + 1),
      coa_code: '',
      description: '',
      debit_amount: 0,
      credit_amount: 0
    }]);
  };

  const updateJournalItem = (index: number, field: string, value: any) => {
    const updatedItems = [...journalItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setJournalItems(updatedItems);
  };

  const removeJournalItem = (index: number) => {
    setJournalItems(journalItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate balanced entry
    if (formData.total_debit !== formData.total_credit) {
      toast.error('Total debit dan credit harus seimbang');
      return;
    }

    if (selectedEntry) {
      setJournalEntries(journalEntries.map(je => je.id === selectedEntry.id ? { ...formData, id: selectedEntry.id } : je));
      toast.success('Journal Entry berhasil diperbarui');
    } else {
      setJournalEntries([...journalEntries, { ...formData, id: String(journalEntries.length + 1) }]);
      toast.success('Journal Entry berhasil ditambahkan');
    }
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedEntry(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'posted': return 'bg-green-100 text-green-800';
      case 'reversed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Journal Entries</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          <span>Create Entry</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-md">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Entries</p>
              <p className="text-2xl font-bold text-gray-900">{journalEntries.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-md">
              <Calculator className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Posted Entries</p>
              <p className="text-2xl font-bold text-gray-900">
                {journalEntries.filter(je => je.status === 'posted').length}
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
              <p className="text-sm font-medium text-gray-500">Draft Entries</p>
              <p className="text-2xl font-bold text-gray-900">
                {journalEntries.filter(je => je.status === 'draft').length}
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
                placeholder="Search journal entries..."
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
            {Object.entries(JOURNAL_STATUS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Journal Entries Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entry Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Debit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Credit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredEntries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {entry.entry_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(entry.entry_date)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {entry.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(entry.total_debit)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(entry.total_credit)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(entry.status)}`}>
                    {JOURNAL_STATUS[entry.status as keyof typeof JOURNAL_STATUS]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleView(entry)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(entry)}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {showAddModal ? 'Create Journal Entry' : 'Edit Journal Entry'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entry Number
                  </label>
                  <input
                    type="text"
                    value={formData.entry_number}
                    onChange={(e) => setFormData({...formData, entry_number: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entry Date
                  </label>
                  <input
                    type="date"
                    value={typeof formData.entry_date === 'string' ? formData.entry_date.split('T')[0] : ''}
                    onChange={(e) => setFormData({...formData, entry_date: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={2}
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-md font-medium">Journal Items</h4>
                  <button
                    type="button"
                    onClick={addJournalItem}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">COA Code</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Debit</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {journalItems.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-2">
                            <select
                              value={item.coa_code}
                              onChange={(e) => updateJournalItem(index, 'coa_code', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                              required
                            >
                              <option value="">Select COA</option>
                              <option value="1100">1100 - Kas</option>
                              <option value="1200">1200 - Bank</option>
                              <option value="4000">4000 - Pendapatan</option>
                              <option value="5000">5000 - Beban</option>
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateJournalItem(index, 'description', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                              required
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={item.debit_amount}
                              onChange={(e) => updateJournalItem(index, 'debit_amount', Number(e.target.value))}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-right"
                              min="0"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={item.credit_amount}
                              onChange={(e) => updateJournalItem(index, 'credit_amount', Number(e.target.value))}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-right"
                              min="0"
                            />
                          </td>
                          <td className="px-4 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeJournalItem(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={2} className="px-4 py-2 text-right font-medium">Totals:</td>
                        <td className="px-4 py-2 text-right font-medium">{formatCurrency(formData.total_debit)}</td>
                        <td className="px-4 py-2 text-right font-medium">{formatCurrency(formData.total_credit)}</td>
                        <td className="px-4 py-2"></td>
                      </tr>
                      <tr>
                        <td colSpan={5} className="px-4 py-2 text-center">
                          <span className={`text-sm font-medium ${
                            formData.total_debit === formData.total_credit && formData.total_debit > 0
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {formData.total_debit === formData.total_credit && formData.total_debit > 0
                              ? '✓ Balanced' 
                              : 'Not Balanced'}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
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
                  disabled={formData.total_debit !== formData.total_credit || formData.total_debit === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedEntry && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Journal Entry Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Entry Number</p>
                  <p className="font-medium">{selectedEntry.entry_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{formatDate(selectedEntry.entry_date)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-medium">{selectedEntry.description}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Journal Items</h4>
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">COA</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Debit</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEntry.items?.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2 text-sm">{item.coa_code} - {item.coa?.name}</td>
                        <td className="px-4 py-2 text-sm">{item.description}</td>
                        <td className="px-4 py-2 text-sm text-right">
                          {item.debit_amount > 0 ? formatCurrency(item.debit_amount) : '-'}
                        </td>
                        <td className="px-4 py-2 text-sm text-right">
                          {item.credit_amount > 0 ? formatCurrency(item.credit_amount) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalEntryManagement;