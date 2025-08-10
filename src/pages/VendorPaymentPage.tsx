import React from 'react';
import PaymentManagement from '../components/Payments/PaymentManagement';

const VendorPaymentPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Vendor Payments</h1>
      <PaymentManagement />
    </div>
  );
};

export default VendorPaymentPage;