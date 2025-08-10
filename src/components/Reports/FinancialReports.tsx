import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';

const { Download, Calendar, TrendingUp, PieChart, BarChart3 } = LucideIcons;

const FinancialReports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('profit-loss');

  const reportTypes = [
    { id: 'profit-loss', name: 'Laba Rugi', icon: TrendingUp },
    { id: 'cash-flow', name: 'Arus Kas', icon: BarChart3 },
    { id: 'aging', name: 'Aging Report', icon: Calendar },
    { id: 'sales-analysis', name: 'Analisis Penjualan', icon: PieChart }
  ];

  const periods = [
    { id: 'week', name: 'Minggu Ini' },
    { id: 'month', name: 'Bulan Ini' },
    { id: 'quarter', name: 'Kuartal Ini' },
    { id: 'year', name: 'Tahun Ini' },
    { id: 'custom', name: 'Periode Kustom' }
  ];

  const renderProfitLossReport = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Laporan Laba Rugi</h3>
        
        <div className="space-y-4">
          {/* Revenue Section */}
          <div className="border-b border-gray-200 pb-4">
            <h4 className="font-medium text-gray-900 mb-3">PENDAPATAN</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Penjualan Produk</span>
                <span className="font-medium">Rp 45,750,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Penjualan Jasa</span>
                <span className="font-medium">Rp 8,500,000</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total Pendapatan</span>
                <span className="text-green-600">Rp 54,250,000</span>
              </div>
            </div>
          </div>

          {/* Cost of Goods Sold */}
          <div className="border-b border-gray-200 pb-4">
            <h4 className="font-medium text-gray-900 mb-3">HARGA POKOK PENJUALAN</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Pembelian Bahan Baku</span>
                <span className="font-medium">Rp 28,400,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Biaya Produksi</span>
                <span className="font-medium">Rp 3,200,000</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total HPP</span>
                <span className="text-red-600">Rp 31,600,000</span>
              </div>
            </div>
          </div>

          {/* Gross Profit */}
          <div className="border-b border-gray-200 pb-4">
            <div className="flex justify-between font-semibold text-lg">
              <span>LABA KOTOR</span>
              <span className="text-green-600">Rp 22,650,000</span>
            </div>
          </div>

          {/* Operating Expenses */}
          <div className="border-b border-gray-200 pb-4">
            <h4 className="font-medium text-gray-900 mb-3">BIAYA OPERASIONAL</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Gaji Karyawan</span>
                <span className="font-medium">Rp 2,500,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sewa Tempat</span>
                <span className="font-medium">Rp 1,200,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Listrik & Utilitas</span>
                <span className="font-medium">Rp 450,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Biaya Lain-lain</span>
                <span className="font-medium">Rp 200,000</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total Biaya Operasional</span>
                <span className="text-red-600">Rp 4,350,000</span>
              </div>
            </div>
          </div>

          {/* Net Profit */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex justify-between font-bold text-xl">
              <span>LABA BERSIH</span>
              <span className="text-green-600">Rp 18,300,000</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>Margin Keuntungan</span>
              <span>33.7%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCashFlowReport = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Laporan Arus Kas</h3>
        
        <div className="space-y-4">
          {/* Opening Balance */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between font-semibold">
              <span>Saldo Awal</span>
              <span className="text-blue-600">Rp 15,500,000</span>
            </div>
          </div>

          {/* Cash Inflow */}
          <div className="border-b border-gray-200 pb-4">
            <h4 className="font-medium text-gray-900 mb-3 text-green-600">ARUS KAS MASUK</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Penjualan Tunai</span>
                <span className="font-medium text-green-600">Rp 28,750,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pembayaran Piutang</span>
                <span className="font-medium text-green-600">Rp 12,400,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pendapatan Lain</span>
                <span className="font-medium text-green-600">Rp 850,000</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total Kas Masuk</span>
                <span className="text-green-600">Rp 42,000,000</span>
              </div>
            </div>
          </div>

          {/* Cash Outflow */}
          <div className="border-b border-gray-200 pb-4">
            <h4 className="font-medium text-gray-900 mb-3 text-red-600">ARUS KAS KELUAR</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Pembelian Inventory</span>
                <span className="font-medium text-red-600">Rp 18,200,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Biaya Operasional</span>
                <span className="font-medium text-red-600">Rp 4,350,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pembayaran Hutang</span>
                <span className="font-medium text-red-600">Rp 5,500,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pengeluaran Lain</span>
                <span className="font-medium text-red-600">Rp 1,200,000</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total Kas Keluar</span>
                <span className="text-red-600">Rp 29,250,000</span>
              </div>
            </div>
          </div>

          {/* Net Cash Flow */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex justify-between font-semibold text-lg">
              <span>ARUS KAS BERSIH</span>
              <span className="text-green-600">Rp 12,750,000</span>
            </div>
          </div>

          {/* Closing Balance */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between font-bold text-xl">
              <span>SALDO AKHIR</span>
              <span className="text-blue-600">Rp 28,250,000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAgingReport = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Aging Report Piutang</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pelanggan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current (0-30)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  31-60 Hari
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  61-90 Hari
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {'>'} 90 Hari
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  PT Maju Sejahtera
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Rp 2,500,000
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Rp 1,200,000
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Rp 0
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                  Rp 0
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  Rp 3,700,000
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  CV Berkah Jaya
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Rp 1,800,000
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Rp 0
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Rp 0
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                  Rp 0
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  Rp 1,800,000
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Toko Sinar Harapan
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Rp 0
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Rp 950,000
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                  Rp 1,500,000
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                  Rp 0
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  Rp 2,450,000
                </td>
              </tr>
              <tr className="bg-gray-50 font-semibold">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  TOTAL
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Rp 4,300,000
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Rp 2,150,000
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                  Rp 1,500,000
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                  Rp 0
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Rp 7,950,000
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Current (0-30 hari)</p>
            <p className="text-lg font-semibold text-green-600">54.1%</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">31-60 hari</p>
            <p className="text-lg font-semibold text-blue-600">27.0%</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">61-90 hari</p>
            <p className="text-lg font-semibold text-yellow-600">18.9%</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">{'>'} 90 hari</p>
            <p className="text-lg font-semibold text-red-600">0.0%</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSalesAnalysis = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Produk Terlaris</h3>
          <div className="space-y-3">
            {[
              { name: 'Server Dell PowerEdge R740', qty: 8, revenue: 520000000 },
              { name: 'Jasa Implementasi Cloud AWS', qty: 12, revenue: 300000000 },
              { name: 'Lisensi Microsoft Office 365', qty: 85, revenue: 153000000 },
              { name: 'Cisco Switch 48-Port', qty: 15, revenue: 180000000 }
            ].map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.qty} unit terjual</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    Rp {product.revenue.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analisis Kategori</h3>
          <div className="space-y-4">
            {[
              { category: 'Hardware', percentage: 45, amount: 520000000 },
              { category: 'Jasa IT', percentage: 30, amount: 350000000 },
              { category: 'Software', percentage: 15, amount: 175000000 },
              { category: 'Networking', percentage: 10, amount: 120000000 }
            ].map((cat, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900">{cat.category}</span>
                  <span className="text-sm text-gray-500">{cat.percentage}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${cat.percentage}%` }}
                  ></div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-green-600">
                    Rp {cat.amount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performa Pelanggan</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pelanggan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Transaksi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frekuensi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rata-rata Pembelian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { name: 'PT Bank Central Asia', total: 450000000, freq: 8, avg: 56250000, status: 'VIP' },
                { name: 'PT Telkom Indonesia', total: 320000000, freq: 5, avg: 64000000, status: 'Premium' },
                { name: 'PT Astra International', total: 280000000, freq: 12, avg: 23333333, status: 'VIP' },
                { name: 'PT Unilever Indonesia', total: 150000000, freq: 6, avg: 25000000, status: 'Regular' }
              ].map((customer, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {customer.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Rp {customer.total.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.freq}x
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Rp {customer.avg.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      customer.status === 'VIP' ? 'bg-purple-100 text-purple-800' :
                      customer.status === 'Premium' ? 'bg-gold-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderReport = () => {
    switch (selectedReport) {
      case 'profit-loss':
        return renderProfitLossReport();
      case 'cash-flow':
        return renderCashFlowReport();
      case 'aging':
        return renderAgingReport();
      case 'sales-analysis':
        return renderSalesAnalysis();
      default:
        return renderProfitLossReport();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export PDF</span>
        </button>
      </div>

      {/* Report Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Laporan
            </label>
            <div className="grid grid-cols-2 gap-2">
              {reportTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedReport(type.id)}
                    className={`p-3 rounded-lg border-2 transition-all flex items-center space-x-2 ${
                      selectedReport === type.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{type.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Periode Laporan
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {periods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.name}
                </option>
              ))}
            </select>

            {selectedPeriod === 'custom' && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                <input
                  type="date"
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="date"
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Content */}
      {renderReport()}
    </div>
  );
};

export default FinancialReports;