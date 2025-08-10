import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, TrendingUp, TrendingDown, Download } from '../icons';
import { GeneralLedgerEntry } from '../../models/GeneralLedger';
import { GeneralLedgerService } from '../../services/GeneralLedgerService';
import { COAService } from '../../services/COAService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { toast } from 'react-hot-toast';

const GeneralLedgerReport: React.FC = () => {
  const [ledgerEntries, setLedgerEntries] = useState<GeneralLedgerEntry[]>([]);
  const [coaList, setCoaList] = useState<any[]>([]);
  const [selectedCoa, setSelectedCoa] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('2025-01-01');
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedCoa, dateFrom, dateTo]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load COA list
      const { data: coaData, error: coaError } = await COAService.getAll();
      if (coaError) throw coaError;
      setCoaList(coaData || []);

      // Load general ledger entries
      const { data: ledgerData, error: ledgerError } = await GeneralLedgerService.getAll(
        selectedCoa, dateFrom, dateTo
      );
      if (ledgerError) throw ledgerError;
      setLedgerEntries(ledgerData || []);
    } catch (error: any) {
      toast.error('Gagal memuat data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Group entries by COA
  const groupedEntries = ledgerEntries.reduce((acc, entry) => {
    const coaCode = entry.coa_code;
    if (!acc[coaCode]) {
      acc[coaCode] = {
        coa: entry.coa,
        entries: [],
        totalDebit: 0,
        totalCredit: 0
      };
    }
    acc[coaCode].entries.push(entry);
    acc[coaCode].totalDebit += entry.debit_amount;
    acc[coaCode].totalCredit += entry.credit_amount;
    return acc;
  }, {} as any);

  const totalAssets = Object.values(groupedEntries)
    .filter((group: any) => group.coa?.code?.startsWith('1'))
    .reduce((sum: number, group: any) => sum + (group.totalDebit - group.totalCredit), 0);

  const totalLiabilities = Object.values(groupedEntries)
    .filter((group: any) => group.coa?.code?.startsWith('2'))
    .reduce((sum: number, group: any) => sum + (group.totalCredit - group.totalDebit), 0);

  const totalEquity = Object.values(groupedEntries)
    .filter((group: any) => group.coa?.code?.startsWith('3'))
    .reduce((sum: number, group: any) => sum + (group.totalCredit - group.totalDebit), 0);

  const totalRevenue = Object.values(groupedEntries)
    .filter((group: any) => group.coa?.code?.startsWith('4'))
    .reduce((sum: number, group: any) => sum + (group.totalCredit - group.totalDebit), 0);

  const totalExpenses = Object.values(groupedEntries)
    .filter((group: any) => group.coa?.code?.startsWith('5'))
    .reduce((sum: number, group: any) => sum + (group.totalDebit - group.totalCredit), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">General Ledger</h1>
        <button className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-green-700">
          <Download className="h-4 w-4" />
          <span>Export</span>
        </button>
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
              {coaList.map(coa => (
                <option key={coa.code} value={coa.code}>
                  {coa.code} - {coa.name}
                </option>
              ))}
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
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2">Loading...</p>
          </div>
        ) : Object.keys(groupedEntries).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No ledger entries found for the selected criteria
          </div>
        ) : (
          Object.entries(groupedEntries).map(([coaCode, group]: [string, any]) => (
            <div key={coaCode} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {group.coa?.code} - {group.coa?.name}
                    </h3>
                    <p className="text-sm text-gray-500">{group.coa?.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Net Balance</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(group.totalDebit - group.totalCredit)}
                    </p>
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
                    {group.entries.map((entry: GeneralLedgerEntry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(entry.transaction_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entry.journal_entry?.entry_number || '-'}
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
                          {formatCurrency(entry.running_balance)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-blue-50 font-medium">
                      <td colSpan={3} className="px-6 py-3 text-right">Total:</td>
                      <td className="px-6 py-3 text-right">{formatCurrency(group.totalDebit)}</td>
                      <td className="px-6 py-3 text-right">{formatCurrency(group.totalCredit)}</td>
                      <td className="px-6 py-3 text-right font-bold">{formatCurrency(group.totalDebit - group.totalCredit)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GeneralLedgerReport;