import React, { useState } from 'react';

const dummyExpenses = [
  { id: 1, date: '2025-08-01', category: 'Operasional', description: 'Pembelian alat tulis kantor', amount: 200000, status: 'Disetujui' },
  { id: 2, date: '2025-08-03', category: 'Transportasi', description: 'Bensin perjalanan dinas', amount: 150000, status: 'Menunggu' },
  { id: 3, date: '2025-08-05', category: 'Lain-lain', description: 'Biaya entertain klien', amount: 500000, status: 'Ditolak' },
];

const ExpensesManagement: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Daftar Pengeluaran</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          onClick={() => {
            setSelectedExpense(null);
            setShowModal(true);
          }}
        >
          + Tambah Pengeluaran
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dummyExpenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">Belum ada data pengeluaran.</td>
              </tr>
            ) : (
              dummyExpenses.map((exp) => (
                <tr key={exp.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{exp.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{exp.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{exp.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">Rp {exp.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${exp.status === 'Disetujui' ? 'bg-green-100 text-green-700' : exp.status === 'Ditolak' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{exp.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      className="text-blue-600 hover:underline mr-2"
                      onClick={() => {
                        setSelectedExpense(exp);
                        setShowModal(true);
                      }}
                    >Edit</button>
                    <button className="text-red-600 hover:underline">Hapus</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form Pengeluaran (Mockup) */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
            <h2 className="text-lg font-semibold mb-4">{selectedExpense ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                <input type="date" className="w-full border rounded-md px-3 py-2" defaultValue={selectedExpense?.date || ''} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select className="w-full border rounded-md px-3 py-2" defaultValue={selectedExpense?.category || ''}>
                  <option value="">Pilih Kategori</option>
                  <option value="Operasional">Operasional</option>
                  <option value="Transportasi">Transportasi</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <input type="text" className="w-full border rounded-md px-3 py-2" defaultValue={selectedExpense?.description || ''} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp)</label>
                <input type="number" className="w-full border rounded-md px-3 py-2" defaultValue={selectedExpense?.amount || ''} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select className="w-full border rounded-md px-3 py-2" defaultValue={selectedExpense?.status || ''}>
                  <option value="Menunggu">Menunggu</option>
                  <option value="Disetujui">Disetujui</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button type="button" className="bg-gray-200 px-4 py-2 rounded-md" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesManagement;