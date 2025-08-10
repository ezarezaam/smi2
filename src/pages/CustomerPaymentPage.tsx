import React from 'react';
import CustomerPaymentManagement from '../components/Payments/CustomerPaymentManagement';

const CustomerPaymentPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Customer Payments</h1>
      <CustomerPaymentManagement />
    </div>
  );
};

export default CustomerPaymentPage;