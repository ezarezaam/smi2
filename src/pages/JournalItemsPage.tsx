import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Calculator } from '../components/icons';
import { JournalItem } from '../models/JournalEntry';
import { formatCurrency, formatDate } from '../utils/formatters';

const JournalItemsPage: React.FC = () => {
  const [journalItems, setJournalItems] = useState<JournalItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [coaFilter, setCoaFilter] = useState('all');

  // Sample data
  const sampleItems: JournalItem[] = [
    {
      id: '1',
      journal_entry_id: 'JE-001',
      coa_code: '1100',
      coa: { code: '1100', name: 'Kas' },
      description: 'Penerimaan kas dari penjualan',
      debit_amount: 15000000,
      credit_amount: 0
    },
    {
      id: '2',
      journal_entry_id: 'JE-001',
      coa_code: '4000',
      coa: { code: '4000', name: 'Pendapatan Penjualan' },
      description: 'Pendapatan dari penjualan produk',
      debit_amount: 0,
      credit_amount: 15000000
    },
    {
      id: '3',
      journal_entry_id: 'JE-002',
      coa_code: '5000',
      coa: { code: '5000', name: 'Beban Gaji' },
      description: 'Pembayaran gaji karyawan',
      debit_amount: 10000000,
      credit_amount: 0
    },
    {
      id: '4',
      journal_entry_id: 'JE-002',
      coa_code: '1100',
      coa: { code: '1100', name: 'Kas' },
      description: 'Pengeluaran kas untuk gaji',
      debit_amount: 0,
      credit_amount: 10000000
    }
  ];

  useEffect(() => {
    setJournalItems(sampleItems);
  }, []);

  const filteredItems = journalItems.filter(item => {
    const matchesSearch = item.coa_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.coa?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCoa = coaFilter === 'all' || item.coa_code === coaFilter;
    return matchesSearch && matchesCoa;
  });

  const totalDebit = filteredItems.reduce((sum, item) => sum + item.debit_amount, 0);
  const totalCredit = filteredItems.reduce((sum, item) => sum + item.credit_amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Journal Items</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-md">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{journalItems.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-md">
              <Calculator className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Debit</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalDebit)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-md">
              <Calculator className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Credit</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCredit)}</p>
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
                placeholder="Search journal items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={coaFilter}
            onChange={(e) => setCoaFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All COA</option>
            <option value="1100">1100 - Kas</option>
            <option value="1200">1200 - Bank</option>
            <option value="4000">4000 - Pendapatan</option>
            <option value="5000">5000 - Beban</option>
          </select>
        </div>
      </div>

      {/* Journal Items Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Journal Entry</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">COA Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">COA Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Debit</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.journal_entry_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.coa_code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.coa?.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {item.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {item.debit_amount > 0 ? formatCurrency(item.debit_amount) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {item.credit_amount > 0 ? formatCurrency(item.credit_amount) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={4} className="px-6 py-3 text-right font-medium text-gray-900">Totals:</td>
              <td className="px-6 py-3 text-right font-medium text-gray-900">{formatCurrency(totalDebit)}</td>
              <td className="px-6 py-3 text-right font-medium text-gray-900">{formatCurrency(totalCredit)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default JournalItemsPage;