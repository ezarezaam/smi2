import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Division, DEFAULT_DIVISION } from '../models/Division';
import { DivisionService } from '../services/DivisionService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'react-hot-toast';

const DivisiPage: React.FC = () => {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [filteredDivisions, setFilteredDivisions] = useState<Division[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDivision, setCurrentDivision] = useState<Division | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [divisionToDelete, setDivisionToDelete] = useState<number | null>(null);
  
  const navigate = useNavigate();

  // Load data divisi
  const loadDivisions = async () => {
    try {
      setIsLoading(true);
      const data = await DivisionService.getAll();
      setDivisions(data);
      setFilteredDivisions(data);
    } catch (error) {
      console.error('Error loading divisions:', error);
      toast.error('Gagal memuat data divisi');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter divisi berdasarkan pencarian
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDivisions(divisions);
    } else {
      const filtered = divisions.filter(div => 
        div.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (div.description && div.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredDivisions(filtered);
    }
  }, [searchTerm, divisions]);

  // Load data saat komponen pertama kali di-mount
  useEffect(() => {
    loadDivisions();
  }, []);

  // Handler untuk membuka modal tambah divisi
  const handleAddDivisi = () => {
    setCurrentDivision({ ...DEFAULT_DIVISION } as Division);
    setIsModalOpen(true);
  };

  // Handler untuk membuka modal edit divisi
  const handleEditDivisi = (division: Division) => {
    setCurrentDivision(division);
    setIsModalOpen(true);
  };

  // Handler untuk membuka modal hapus divisi
  const handleDeleteClick = (id: number) => {
    setDivisionToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Handler untuk menghapus divisi
  const handleDeleteDivisi = async () => {
    if (!divisionToDelete) return;
    
    try {
      await DivisionService.delete(divisionToDelete);
      toast.success('Divisi berhasil dihapus');
      loadDivisions();
    } catch (error) {
      console.error('Error deleting division:', error);
      toast.error('Gagal menghapus divisi');
    } finally {
      setIsDeleteModalOpen(false);
      setDivisionToDelete(null);
    }
  };

  // Handler untuk submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDivision) return;

    try {
      if (currentDivision.id) {
        // Update existing division
        await DivisionService.update(currentDivision.id, currentDivision);
        toast.success('Divisi berhasil diperbarui');
      } else {
        // Add new division
        await DivisionService.create(currentDivision);
        toast.success('Divisi berhasil ditambahkan');
      }
      
      setIsModalOpen(false);
      loadDivisions();
    } catch (error) {
      console.error('Error saving division:', error);
      toast.error('Gagal menyimpan divisi');
    }
  };

  // Handler untuk perubahan input form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setCurrentDivision(prev => ({
      ...prev!,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Divisi</h1>
        <Button onClick={handleAddDivisi}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Divisi
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Daftar Divisi</CardTitle>
              <CardDescription>Kelola data divisi perusahaan</CardDescription>
            </div>
            <div className="w-1/3">
              <Input
                type="text"
                placeholder="Cari divisi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Memuat data...</div>
          ) : filteredDivisions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'Tidak ada hasil yang cocok' : 'Belum ada data divisi'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Divisi</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDivisions.map((division) => (
                  <TableRow key={division.id}>
                    <TableCell className="font-medium">{division.name}</TableCell>
                    <TableCell>{division.description || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={division.status ? 'default' : 'secondary'}>
                        {division.status ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditDivisi(division)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(division.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal Tambah/Edit Divisi */}
      {isModalOpen && currentDivision && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">
              {currentDivision.id ? 'Edit Divisi' : 'Tambah Divisi Baru'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nama Divisi <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={currentDivision.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    className="w-full p-2 border rounded-md"
                    name="description"
                    value={currentDivision.description || ''}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="status"
                    name="status"
                    checked={currentDivision.status}
                    onChange={handleInputChange}
                    className="h-4 w-4"
                  />
                  <label htmlFor="status" className="text-sm">
                    Aktif
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit">Simpan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus Divisi */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Hapus Divisi</h2>
            <p className="mb-6">
              Apakah Anda yakin ingin menghapus divisi ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDivisionToDelete(null);
                }}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteDivisi}
              >
                Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DivisiPage;
