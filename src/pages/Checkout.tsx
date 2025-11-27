// src/pages/Checkout.tsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ChevronRight, MapPin, Plus, Check, CreditCard, Banknote, Wallet, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import AddressModal from '@/components/AddressModal';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://clothing-store-server.vercel.app';

interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  landmark?: string;
  addressType: string;
  isDefault: boolean;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Checkout() {
  const navigate = useNavigate();
  const { isAuthenticated, getToken, user } = useAuth();
  const { cartItems, cartCount, refreshCart } = useCart();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('razorpay');
  const [customerNotes, setCustomerNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin', { state: { from: '/checkout' } });
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }

    fetchAddresses();
    loadRazorpayScript();
  }, [isAuthenticated]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const fetchAddresses = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/address/list`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setAddresses(data.data.addresses);
        
        const defaultAddr = data.data.addresses.find((a: Address) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        } else if (data.data.addresses.length > 0) {
          setSelectedAddressId(data.data.addresses[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to load addresses');
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressModalOpen(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressModalOpen(true);
  };

  const handleRazorpayPayment = async (orderId: string, orderNumber: string) => {
    try {
      // Check if Razorpay is loaded
      if (typeof window.Razorpay === 'undefined') {
        throw new Error('Payment gateway not available. Please refresh the page.');
      }

      // Create Razorpay order
      const razorpayResponse = await fetch(`${API_BASE}/api/razorpay/create-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId })
      });

      const razorpayData = await razorpayResponse.json();

      if (!razorpayData.success) {
        throw new Error(razorpayData.message || 'Failed to initialize payment');
      }

      const { razorpay } = razorpayData.data;

      // Razorpay checkout options
      const options = {
        key: razorpay.keyId,
        amount: razorpay.amount,
        currency: razorpay.currency,
        name: 'Velora',
        description: `Order #${orderNumber}`,
        order_id: razorpay.orderId,
        prefill: {
          name: razorpay.customerDetails.name,
          email: razorpay.customerDetails.email,
          contact: razorpay.customerDetails.contact
        },
        theme: {
          color: '#7C3AED'
        },
        handler: async function (response: any) {
          try {
            setLoading(true);
            const verifyResponse = await fetch(`${API_BASE}/api/razorpay/verify-payment`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              })
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              await refreshCart();
              toast.success('Payment successful!');
              navigate(`/order/success/${orderId}`);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error: any) {
            toast.error('Payment verification failed');
            console.error('Verification error:', error);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function() {
            toast.error('Payment cancelled');
            setLoading(false);
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();

    } catch (error: any) {
      console.error('Razorpay payment error:', error);
      toast.error(error.message || 'Payment initialization failed');
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    // Validation
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }

    setLoading(true);

    try {
      // Create order
      const orderResponse = await fetch(`${API_BASE}/api/order/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shippingAddressId: selectedAddressId,
          billingAddressId: selectedAddressId,
          paymentMethod,
          customerNotes
        })
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      const order = orderData.data.order;

      // Handle COD
      if (paymentMethod === 'cod') {
        const codResponse = await fetch(`${API_BASE}/api/payment/cod`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ orderId: order.id })
        });

        const codData = await codResponse.json();

        if (codData.success) {
          await refreshCart();
          toast.success('Order placed successfully!');
          navigate(`/order/success/${order.id}`);
        } else {
          throw new Error('Failed to confirm COD order');
        }
        setLoading(false);
      } else if (paymentMethod === 'razorpay') {
        // Handle Razorpay payment
        await handleRazorpayPayment(order.id, order.orderNumber);
      }

    } catch (error: any) {
      console.error('Place order error:', error);
      toast.error(error.message || 'Failed to place order');
      setLoading(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.currentPrice * item.quantity, 0);
  const shippingCharges = subtotal >= 1000 ? 0 : 50;
  const codCharges = paymentMethod === 'cod' ? 69 : 0;
  const tax = subtotal * 0.05;
  const total = subtotal + shippingCharges + codCharges + tax;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Home size={16} />
            <ChevronRight size={14} />
            <span>Cart</span>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium">Checkout</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-2xl md:text-3xl font-light mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin size={20} className="text-purple-600" />
                  Delivery Address
                </h2>
                <button
                  onClick={handleAddAddress}
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-sm"
                >
                  <Plus size={18} />
                  Add New
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No saved addresses</p>
                  <button
                    onClick={handleAddAddress}
                    className="bg-purple-700 text-white px-6 py-2 rounded-lg hover:bg-purple-800 transition-colors"
                  >
                    Add Address
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      onClick={() => setSelectedAddressId(address.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedAddressId === address.id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedAddressId === address.id
                              ? 'border-purple-600 bg-purple-600'
                              : 'border-gray-300'
                          }`}>
                            {selectedAddressId === address.id && (
                              <Check size={14} className="text-white" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{address.fullName}</span>
                              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                {address.addressType}
                              </span>
                              {address.isDefault && (
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                  DEFAULT
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{address.phone}</p>
                            <p className="text-sm text-gray-700 mt-2">
                              {address.addressLine1}
                              {address.addressLine2 && `, ${address.addressLine2}`}
                            </p>
                            <p className="text-sm text-gray-700">
                              {address.city}, {address.state} - {address.pincode}
                            </p>
                            {address.landmark && (
                              <p className="text-sm text-gray-600 mt-1">
                                Landmark: {address.landmark}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAddress(address);
                          }}
                          className="text-purple-600 hover:text-purple-700 text-sm font-medium ml-4"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-purple-600" />
                Payment Method
              </h2>

              <div className="space-y-3">
                {/* Razorpay */}
                <div
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'razorpay'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'razorpay'
                          ? 'border-purple-600 bg-purple-600'
                          : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'razorpay' && <Check size={14} className="text-white" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard size={20} className="text-gray-600" />
                        <div>
                          <p className="font-medium">Online Payment</p>
                          <p className="text-xs text-gray-500">Cards, UPI, Wallets, NetBanking</p>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                      RECOMMENDED
                    </span>
                  </div>
                  {paymentMethod === 'razorpay' && (
                    <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                        <CreditCard size={12} /> Cards
                      </span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                        <Wallet size={12} /> UPI
                      </span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                        <Building2 size={12} /> Net Banking
                      </span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                        <Wallet size={12} /> Wallets
                      </span>
                    </div>
                  )}
                </div>

                {/* COD */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'cod'
                        ? 'border-purple-600 bg-purple-600'
                        : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'cod' && <Check size={14} className="text-white" />}
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <Banknote size={20} className="text-gray-600" />
                      <div className="flex-1">
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-xs text-gray-500">Pay when you receive</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-orange-600 font-medium">+ ₹69 COD Fee</p>
                      </div>
                    </div>
                  </div>
                  {paymentMethod === 'cod' && (
                    <div className="mt-3 pt-3 border-t bg-orange-50 rounded p-3">
                      <p className="text-xs text-orange-800">
                        <strong>Note:</strong> Additional ₹69 will be charged for Cash on Delivery orders. 
                        Save ₹69 by paying online!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Order Notes (Optional)</h2>
              <textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="Any special instructions for delivery?"
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 text-sm">
                    <img
                      src={item.mainImage || 'https://via.placeholder.com/60'}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium line-clamp-2">{item.productName}</p>
                      <p className="text-gray-500 text-xs">Size: {item.selectedSize} | Qty: {item.quantity}</p>
                      <p className="text-purple-600 font-semibold">
                        ₹{(item.currentPrice * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({cartCount} items)</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span>
                    {shippingCharges === 0 ? (
                      <span className="text-green-600 font-medium">FREE</span>
                    ) : (
                      `₹${shippingCharges}`
                    )}
                  </span>
                </div>
                {codCharges > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-orange-600">COD Charges</span>
                    <span className="text-orange-600">₹{codCharges}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST (5%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-purple-600">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading || !selectedAddressId || addresses.length === 0}
                className="w-full mt-6 bg-purple-700 text-white py-3 rounded-lg font-medium hover:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Processing...
                  </span>
                ) : (
                  `Place Order - ₹${total.toFixed(2)}`
                )}
              </button>

              <div className="mt-4 space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-green-600" />
                  <span>100% Secure Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-green-600" />
                  <span>Easy returns within 7 days</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-green-600" />
                  <span>Free shipping above ₹1000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddressModal
        isOpen={addressModalOpen}
        onClose={() => {
          setAddressModalOpen(false);
          setEditingAddress(null);
        }}
        onSuccess={fetchAddresses}
        editAddress={editingAddress}
      />

      <Footer />
    </div>
  );
}