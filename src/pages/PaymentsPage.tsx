import React from 'react';
import PaymentTracking from '../components/Payments/PaymentTracking';

const PaymentsPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Pelacakan Pembayaran</h1>
      <PaymentTracking />
    </div>
  );
};

export default PaymentsPage;
