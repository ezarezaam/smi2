import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Eye
} from '../../components/icons';
import ProposalFormModal from './ProposalFormModal';
import DeleteProposalModal from './DeleteProposalModal';
import ViewProposalModal from './ViewProposalModal';

// Tipos de datos
interface CommercialProposal {
  id: string;
  title: string;
  clientName: string;
  date: string;
  amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  validUntil: string;
  description: string;
  category: string;
}

// Datos de ejemplo
const sampleProposals: CommercialProposal[] = [
  {
    id: 'CP001',
    title: 'Website Development',
    clientName: 'PT Maju Bersama',
    date: '2023-08-01',
    amount: 15000000,
    status: 'sent',
    validUntil: '2023-09-01',
    description: 'Proposal for company website development with CMS',
    category: 'IT Services'
  },
  {
    id: 'CP002',
    title: 'Digital Marketing Campaign',
    clientName: 'CV Sejahtera',
    date: '2023-08-05',
    amount: 8500000,
    status: 'accepted',
    validUntil: '2023-09-05',
    description: 'Social media marketing campaign for product launch',
    category: 'Marketing'
  },
  {
    id: 'CP003',
    title: 'Office Renovation',
    clientName: 'PT Karya Indah',
    date: '2023-08-10',
    amount: 45000000,
    status: 'draft',
    validUntil: '2023-09-10',
    description: 'Office renovation for new headquarters',
    category: 'Construction'
  },
  {
    id: 'CP004',
    title: 'Accounting Software Implementation',
    clientName: 'PT Abadi Jaya',
    date: '2023-08-15',
    amount: 12000000,
    status: 'rejected',
    validUntil: '2023-09-15',
    description: 'Implementation of ERP accounting system',
    category: 'IT Services'
  }
];

// Categorías para filtro
const categories = ['IT Services', 'Marketing', 'Construction', 'Consulting', 'Training'];
const statuses = ['draft', 'sent', 'accepted', 'rejected'];

const CommercialProposalManagement: React.FC = () => {
  const [proposals, setProposals] = useState<CommercialProposal[]>(sampleProposals);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentProposal, setCurrentProposal] = useState<CommercialProposal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  // Filtrar propuestas
  const filteredProposals = proposals.filter(proposal => {
    // Búsqueda por texto
    const matchesSearch = 
      proposal.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por categoría
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.includes(proposal.category);
    
    // Filtro por estado
    const matchesStatus = selectedStatuses.length === 0 || 
      selectedStatuses.includes(proposal.status);
    
    // Filtro por fecha
    const matchesDate = 
      (dateRange.from === '' || proposal.date >= dateRange.from) &&
      (dateRange.to === '' || proposal.date <= dateRange.to);
    
    return matchesSearch && matchesCategory && matchesStatus && matchesDate;
  });

  // Funciones para CRUD
  const handleAddProposal = (proposal: Omit<CommercialProposal, 'id'>) => {
    const newProposal = {
      ...proposal,
      id: `CP${String(proposals.length + 1).padStart(3, '0')}`
    };
    setProposals([...proposals, newProposal as CommercialProposal]);
    setIsAddModalOpen(false);
  };

  const handleEditProposal = (updatedProposal: CommercialProposal | Omit<CommercialProposal, 'id'>) => {
    if ('id' in updatedProposal) {
      setProposals(proposals.map(p => 
        p.id === updatedProposal.id ? updatedProposal as CommercialProposal : p
      ));
    }
    setIsEditModalOpen(false);
  };

  const handleDeleteProposal = () => {
    if (currentProposal) {
      setProposals(proposals.filter(p => p.id !== currentProposal.id));
      setIsDeleteModalOpen(false);
      setCurrentProposal(null);
    }
  };

  const openEditModal = (proposal: CommercialProposal) => {
    setCurrentProposal(proposal);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (proposal: CommercialProposal) => {
    setCurrentProposal(proposal);
    setIsDeleteModalOpen(true);
  };

  const openViewModal = (proposal: CommercialProposal) => {
    setCurrentProposal(proposal);
    setIsViewModalOpen(true);
  };

  // Renderizar estado con color
  const renderStatus = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
            <span className="mr-1">•</span>
            Draft
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
            <span className="mr-1">•</span>
            Sent
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-red-100 text-red-800">
            <AlertCircle className="w-4 h-4 mr-1" />
            Rejected
          </span>
        );
      default:
        return status;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Commercial Proposals</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Proposal
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda por texto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by ID, title, client..."
                className="w-full pl-10 pr-4 py-2 border rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Filtro por categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              multiple
              className="w-full p-2 border rounded-md"
              value={selectedCategories}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                setSelectedCategories(values);
              }}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Filtro por estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              multiple
              className="w-full p-2 border rounded-md"
              value={selectedStatuses}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                setSelectedStatuses(values);
              }}
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-2 border rounded-md"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                />
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <span className="self-center">to</span>
              <div className="relative flex-1">
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-2 border rounded-md"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                />
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de propuestas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid Until</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProposals.map((proposal) => (
                <tr key={proposal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{proposal.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proposal.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proposal.clientName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proposal.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(proposal.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {renderStatus(proposal.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proposal.validUntil}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proposal.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => openViewModal(proposal)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => openEditModal(proposal)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => openDeleteModal(proposal)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para añadir/editar propuesta */}
      <ProposalFormModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleAddProposal} 
        isEdit={false}
      />

      {/* Modal para editar propuesta */}
      <ProposalFormModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSave={handleEditProposal} 
        proposal={currentProposal || undefined} 
        isEdit={true}
      />

      {/* Modal para eliminar propuesta */}
      {currentProposal && (
        <DeleteProposalModal 
          isOpen={isDeleteModalOpen} 
          onClose={() => setIsDeleteModalOpen(false)} 
          onConfirm={handleDeleteProposal} 
          proposalId={currentProposal.id} 
          proposalTitle={currentProposal.title}
        />
      )}

      {/* Modal para ver detalles de propuesta */}
      <ViewProposalModal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        proposal={currentProposal}
      />
    </div>
  );
};

export default CommercialProposalManagement;
