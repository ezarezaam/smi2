import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Jabatan, DEFAULT_JABATAN } from '../models/Jabatan';
import { JabatanService } from '../services/JabatanService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'react-hot-toast';

const JabatanPage: React.FC = () => {
  const [jabatans, setJabatans] = useState<Jabatan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentJabatan, setCurrentJabatan] = useState<Jabatan | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [jabatanToDelete, setJabatanToDelete] = useState<number | null>(null);

  // Load data jabatan
  const loadJabatans = async () => {
    try {
      const data = await JabatanService.getAll();
      setJabatans(data);
    } catch (error) {
      console.error('Error loading jabatans:', error);
      toast.error('Gagal memuat data jabatan');
    }
  };

  // Filter jabatan berdasarkan pencarian
  const filteredJabatans = jabatans.filter(jabatan => 
    jabatan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (jabatan.description && jabatan.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => { loadJabatans(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentJabatan) return;

    try {
      if (currentJabatan.id) {
        await JabatanService.update(currentJabatan.id, currentJabatan);
        toast.success('Jabatan berhasil diperbarui');
      } else {
        await JabatanService.create(currentJabatan);
        toast.success('Jabatan berhasil ditambahkan');
      }
      
      setIsModalOpen(false);
      loadJabatans();
    } catch (error) {
      console.error('Error saving jabatan:', error);
      toast.error('Gagal menyimpan jabatan');
    }
  };

  const handleDeleteJabatan = async () => {
    if (!jabatanToDelete) return;
    
    try {
      await JabatanService.delete(jabatanToDelete);
      toast.success('Jabatan berhasil dihapus');
      loadJabatans();
    } catch (error) {
      console.error('Error deleting jabatan:', error);
      toast.error('Gagal menghapus jabatan');
    } finally {
      setIsDeleteModalOpen(false);
      setJabatanToDelete(null);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Jabatan</h1>
        <Button onClick={() => { setCurrentJabatan({ ...DEFAULT_JABATAN } as Jabatan); setIsModalOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Jabatan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Daftar Jabatan</CardTitle>
            <Input
              type="text"
              placeholder="Cari jabatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-1/3"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJabatans.map((jabatan) => (
                <TableRow key={jabatan.id}>
                  <TableCell className="font-medium">{jabatan.name}</TableCell>
                  <TableCell>{jabatan.description || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={jabatan.status ? 'default' : 'secondary'}>
                      {jabatan.status ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => { setCurrentJabatan(jabatan); setIsModalOpen(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => { setJabatanToDelete(jabatan.id); setIsDeleteModalOpen(true); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Form */}
      {isModalOpen && currentJabatan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">{currentJabatan.id ? 'Edit' : 'Tambah'} Jabatan</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Jabatan</label>
                <Input
                  type="text"
                  name="name"
                  value={currentJabatan.name}
                  onChange={(e) => setCurrentJabatan({...currentJabatan, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  name="description"
                  value={currentJabatan.description || ''}
                  onChange={(e) => setCurrentJabatan({...currentJabatan, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="status"
                  checked={currentJabatan.status}
                  onChange={(e) => setCurrentJabatan({...currentJabatan, status: e.target.checked})}
                  className="h-4 w-4"
                />
                <label htmlFor="status" className="text-sm">Aktif</label>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">Simpan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Hapus Jabatan</h2>
            <p className="mb-6">Apakah Anda yakin ingin menghapus jabatan ini?</p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Batal
              </Button>
              <Button variant="destructive" onClick={handleDeleteJabatan}>
                Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JabatanPage;
