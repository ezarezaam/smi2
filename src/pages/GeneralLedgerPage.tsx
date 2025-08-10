import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, TrendingUp, TrendingDown } from '../components/icons';
import { formatCurrency, formatDate } from '../utils/formatters';

interface LedgerEntry {
  id: string;
  date: string;
  journal_entry_number: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
  balance: number;
}

interface COALedger {
  coa_code: string;
  coa_name: string;
  opening_balance: number;
  total_debit: number;
  total_credit: number;
  closing_balance: number;
  entries: LedgerEntry[];
}

const GeneralLedgerPage: React.FC = () => {
  const [ledgers, setLedgers] = useState<COALedger[]>([]);
  const [selectedCoa, setSelectedCoa] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('2025-01-01');
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  // Sample data
  const sampleLedgers: COALedger[] = [
    {
      coa_code: '1100',
      coa_name: 'Kas',
      opening_balance: 50000000,
      total_debit: 25000000,
      total_credit: 10000000,
      closing_balance: 65000000,
      entries: [
        {
          id: '1',
          date: '2025-01-15',
          journal_entry_number: 'JE-001',
          description: 'Penerimaan kas dari penjualan',
          debit_amount: 15000000,
          credit_amount: 0,
          balance: 65000000
        },
        {
          id: '2',
          date: '2025-01-20',
          journal_entry_number: 'JE-002',
          description: 'Pengeluaran kas untuk gaji',
          debit_amount: 0,
          credit_amount: 10000000,
          balance: 55000000
        }
      ]
    },
    {
      coa_code: '4000',
      coa_name: 'Pendapatan Penjualan',
      opening_balance: 0,
      total_debit: 0,
      total_credit: 15000000,
      closing_balance: 15000000,
      entries: [
        {
          id: '3',
          date: '2025-01-15',
          journal_entry_number: 'JE-001',
          description: 'Pendapatan dari penjualan produk',
          debit_amount: 0,
          credit_amount: 15000000,
          balance: 15000000
        }
      ]
    }
  ];

  useEffect(() => {
    setLedgers(sampleLedgers);
  }, []);

  const filteredLedgers = selectedCoa === 'all' 
    ? ledgers 
    : ledgers.filter(ledger => ledger.coa_code === selectedCoa);

  const totalAssets = ledgers
    .filter(l => l.coa_code.startsWith('1'))
    .reduce((sum, l) => sum + l.closing_balance, 0);

  const totalLiabilities = ledgers
    .filter(l => l.coa_code.startsWith('2'))
    .reduce((sum, l) => sum + l.closing_balance, 0);

  const totalEquity = ledgers
    .filter(l => l.coa_code.startsWith('3'))
    .reduce((sum, l) => sum + l.closing_balance, 0);

  const totalRevenue = ledgers
    .filter(l => l.coa_code.startsWith('4'))
    .reduce((sum, l) => sum + l.closing_balance, 0);

  const totalExpenses = ledgers
    .filter(l => l.coa_code.startsWith('5'))
    .reduce((sum, l) => sum + l.closing_balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">General Ledger</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-md">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Assets</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(totalAssets)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-md">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Liabilities</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(totalLiabilities)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-md">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Equity</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(totalEquity)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-md">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Revenue</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-md">
              <TrendingDown className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Expenses</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">COA Account</label>
            <select
              value={selectedCoa}
              onChange={(e) => setSelectedCoa(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Accounts</option>
              <option value="1100">1100 - Kas</option>
              <option value="1200">1200 - Bank</option>
              <option value="4000">4000 - Pendapatan</option>
              <option value="5000">5000 - Beban</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Ledger Display */}
      <div className="space-y-6">
        {filteredLedgers.map((ledger) => (
          <div key={ledger.coa_code} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {ledger.coa_code} - {ledger.coa_name}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Closing Balance</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(ledger.closing_balance)}</p>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Journal Entry</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Debit</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-blue-50">
                    <td className="px-6 py-3 text-sm font-medium">Opening Balance</td>
                    <td className="px-6 py-3 text-sm">-</td>
                    <td className="px-6 py-3 text-sm">Saldo awal periode</td>
                    <td className="px-6 py-3 text-sm text-right">-</td>
                    <td className="px-6 py-3 text-sm text-right">-</td>
                    <td className="px-6 py-3 text-sm text-right font-medium">{formatCurrency(ledger.opening_balance)}</td>
                  </tr>
                  {ledger.entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(entry.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.journal_entry_number}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {entry.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {entry.debit_amount > 0 ? formatCurrency(entry.debit_amount) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {entry.credit_amount > 0 ? formatCurrency(entry.credit_amount) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(entry.balance)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-blue-50 font-medium">
                    <td className="px-6 py-3 text-sm">Closing Balance</td>
                    <td className="px-6 py-3 text-sm">-</td>
                    <td className="px-6 py-3 text-sm">Saldo akhir periode</td>
                    <td className="px-6 py-3 text-sm text-right">{formatCurrency(ledger.total_debit)}</td>
                    <td className="px-6 py-3 text-sm text-right">{formatCurrency(ledger.total_credit)}</td>
                    <td className="px-6 py-3 text-sm text-right font-bold">{formatCurrency(ledger.closing_balance)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeneralLedgerPage;