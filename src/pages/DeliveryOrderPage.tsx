import React from 'react';
import DeliveryOrderManagement from '../components/Sales/DeliveryOrderManagement';

const DeliveryOrderPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Delivery Order Management</h1>
      <DeliveryOrderManagement />
    </div>
  );
};

export default DeliveryOrderPage;