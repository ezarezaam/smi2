import React from 'react';
import { X, Calendar, DollarSign, FileText, CheckCircle, AlertCircle } from '../../components/icons';

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

interface ViewProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: CommercialProposal | null;
}

const ViewProposalModal: React.FC<ViewProposalModalProps> = ({
  isOpen,
  onClose,
  proposal
}) => {
  if (!isOpen || !proposal) return null;

  // Renderizar estado con color
  const renderStatus = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            <span className="mr-1">•</span>
            Draft
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <span className="mr-1">•</span>
            Sent
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <AlertCircle className="w-4 h-4 mr-1" />
            Rejected
          </span>
        );
      default:
        return status;
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="flex justify-between items-center px-6 py-4 bg-blue-50 border-b">
            <h3 className="text-lg font-medium text-blue-900">
              Commercial Proposal Details
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="px-6 py-5 bg-white">
            <div className="mb-6 pb-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{proposal.title}</h2>
                  <p className="text-gray-600 mt-1">Proposal ID: {proposal.id}</p>
                </div>
                <div>
                  {renderStatus(proposal.status)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Client Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-lg font-medium text-gray-900">{proposal.clientName}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Category</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-lg font-medium text-gray-900">{proposal.category}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="flex items-start">
                <Calendar className="h-6 w-6 text-blue-500 mr-3 mt-1" />
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Created Date</h4>
                  <p className="text-base font-medium text-gray-900">{formatDate(proposal.date)}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Calendar className="h-6 w-6 text-blue-500 mr-3 mt-1" />
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Valid Until</h4>
                  <p className="text-base font-medium text-gray-900">{formatDate(proposal.validUntil)}</p>
                </div>
              </div>

              <div className="flex items-start">
                <DollarSign className="h-6 w-6 text-blue-500 mr-3 mt-1" />
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Amount</h4>
                  <p className="text-base font-medium text-gray-900">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(proposal.amount)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Description</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <FileText className="h-6 w-6 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">{proposal.description}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProposalModal;
