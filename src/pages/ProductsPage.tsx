import React from 'react';
import ProductManagement from '../components/Products/ProductManagement';

const ProductsPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Manajemen Produk</h1>
      <ProductManagement />
    </div>
  );
};

export default ProductsPage;
