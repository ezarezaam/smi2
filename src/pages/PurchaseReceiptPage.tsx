import React from 'react';
import PurchaseReceiptManagement from '../components/Purchases/PurchaseReceiptManagement';

const PurchaseReceiptPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Purchase Receipt Management</h1>
      <PurchaseReceiptManagement />
    </div>
  );
};

export default PurchaseReceiptPage;