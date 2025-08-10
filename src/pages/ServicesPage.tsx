import React from 'react';
import ServiceManagement from '../components/Services/ServiceManagement';

const ServicesPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Manajemen Layanan</h1>
      <ServiceManagement />
    </div>
  );
};

export default ServicesPage;
