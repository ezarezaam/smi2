import React from 'react';
import VendorPaymentManagement from '../components/Purchases/VendorPaymentManagement';

const VendorPaymentPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Vendor Payments</h1>
      <VendorPaymentManagement />
    </div>
  );
};

export default VendorPaymentPage;