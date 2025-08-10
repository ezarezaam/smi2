import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';

const { Plus, Minus, ShoppingCart, Calculator, Send } = LucideIcons;

const SalesTransaction: React.FC = () => {
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [paymentType, setPaymentType] = useState<'cash' | 'credit'>('cash');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [creditTerms, setCreditTerms] = useState({
    dueDate: '',
    downPayment: 0
  });

  const products = [
    {
      id: 'PRD-001',
      name: 'Server Dell PowerEdge R740',
      sellPrice: 65000000,
      stock: 2
    },
    {
      id: 'PRD-002',
      name: 'Jasa Implementasi Cloud AWS',
      sellPrice: 25000000,
      stock: 999
    },
    {
      id: 'PRD-003',
      name: 'Lisensi Microsoft Office 365',
      sellPrice: 1800000,
      stock: 50
    },
    {
      id: 'PRD-004',
      name: 'Cisco Switch 48-Port',
      sellPrice: 12000000,
      stock: 8
    }
  ];

  const addProduct = (product: any) => {
    const existing = selectedProducts.find(p => p.id === product.id);
    if (existing) {
      setSelectedProducts(selectedProducts.map(p =>
        p.id === product.id 
          ? { ...p, quantity: Math.min(p.quantity + 1, product.stock) }
          : p
      ));
    } else {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
    } else {
      setSelectedProducts(selectedProducts.map(p =>
        p.id === productId ? { ...p, quantity } : p
      ));
    }
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, product) => 
      total + (product.sellPrice * product.quantity), 0
    );
  };

  const calculateRemaining = () => {
    const total = calculateTotal();
    return total - creditTerms.downPayment;
  };

  const generateInvoice = () => {
    const invoiceData = {
      invoiceNumber: `INV-${Date.now()}`,
      customer: customerInfo,
      products: selectedProducts,
      total: calculateTotal(),
      paymentType,
      creditTerms: paymentType === 'credit' ? creditTerms : null,
      date: new Date().toISOString()
    };
    
    console.log('Invoice generated:', invoiceData);
    alert('Invoice berhasil dibuat!');
    
    // Reset form
    setSelectedProducts([]);
    setCustomerInfo({ name: '', email: '', phone: '', address: '' });
    setCreditTerms({ dueDate: '', downPayment: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transaksi Penjualan</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Invoice #</span>
          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
            INV-{Date.now().toString().slice(-6)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pelanggan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Pelanggan *
                </label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan nama pelanggan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No. Telepon
                </label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="customer@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat
                </label>
                <input
                  type="text"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Alamat pelanggan"
                />
              </div>
            </div>
          </div>

          {/* Product Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pilih Produk</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <span className="text-sm text-gray-500">Stok: {product.stock}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-green-600">
                      Rp {product.sellPrice.toLocaleString('id-ID')}
                    </span>
                    <button
                      onClick={() => addProduct(product)}
                      disabled={product.stock === 0}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        product.stock === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Products */}
          {selectedProducts.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Produk Terpilih</h3>
              <div className="space-y-3">
                {selectedProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        Rp {product.sellPrice.toLocaleString('id-ID')} / unit
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(product.id, product.quantity - 1)}
                          className="p-1 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center font-medium">{product.quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, product.quantity + 1)}
                          disabled={product.quantity >= product.stock}
                          className="p-1 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          Rp {(product.sellPrice * product.quantity).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Summary & Payment */}
        <div className="space-y-6">
          {/* Payment Type */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Metode Pembayaran</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="cash"
                  checked={paymentType === 'cash'}
                  onChange={(e) => setPaymentType(e.target.value as 'cash' | 'credit')}
                  className="mr-3"
                />
                <span className="text-gray-900">Tunai (Lunas)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="credit"
                  checked={paymentType === 'credit'}
                  onChange={(e) => setPaymentType(e.target.value as 'cash' | 'credit')}
                  className="mr-3"
                />
                <span className="text-gray-900">Tempo</span>
              </label>
            </div>

            {paymentType === 'credit' && (
              <div className="mt-4 space-y-3 p-4 bg-yellow-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Jatuh Tempo
                  </label>
                  <input
                    type="date"
                    value={creditTerms.dueDate}
                    onChange={(e) => setCreditTerms({...creditTerms, dueDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Uang Muka (DP)
                  </label>
                  <input
                    type="number"
                    value={creditTerms.downPayment}
                    onChange={(e) => setCreditTerms({...creditTerms, downPayment: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Ringkasan Pesanan
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">Rp {calculateTotal().toLocaleString('id-ID')}</span>
              </div>
              
              {paymentType === 'credit' && creditTerms.downPayment > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Uang Muka</span>
                    <span className="font-medium text-green-600">
                      Rp {creditTerms.downPayment.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sisa Pembayaran</span>
                    <span className="font-medium text-yellow-600">
                      Rp {calculateRemaining().toLocaleString('id-ID')}
                    </span>
                  </div>
                </>
              )}
              
              <hr className="my-3" />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-blue-600">Rp {calculateTotal().toLocaleString('id-ID')}</span>
              </div>
            </div>

            <button
              onClick={generateInvoice}
              disabled={selectedProducts.length === 0 || !customerInfo.name}
              className={`w-full mt-6 py-3 rounded-md font-medium transition-colors flex items-center justify-center space-x-2 ${
                selectedProducts.length === 0 || !customerInfo.name
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Send className="h-5 w-5" />
              <span>Buat Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesTransaction;