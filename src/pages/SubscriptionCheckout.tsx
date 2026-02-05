import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Home, ChevronRight, MapPin, Plus, Check, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import AddressModal from '@/components/AddressModal';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://clothing-store-server.vercel.app';

interface Address {
  id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  address_type: string;
  is_default: boolean;
}

interface Product {
  id: string;
  productName: string;
  mainImage: string;
  finalPrice: number;
  discountPercentage: number;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SubscriptionCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, getToken } = useAuth();

  // FIXED: Get state with defaults
  const { productId, selectedSize, billingCycle } = location.state || {};

  const [product, setProduct] = useState<Product | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [addressModalOpen, setAddressModalOpen] = useState(false);

  useEffect(() => {
    console.log('SubscriptionCheckout state:', { productId, selectedSize, billingCycle });

    if (!isAuthenticated) {
      navigate('/signin', { state: { from: '/subscription/checkout' } });
      return;
    }

    // FIXED: Better validation
    if (!productId) {
      toast.error('No product selected for subscription');
      navigate('/');
      return;
    }

    if (!selectedSize) {
      toast.error('Please select a size');
      navigate(`/product/${productId}`);
      return;
    }

    fetchProduct();
    fetchAddresses();
    loadRazorpayScript();
  }, [isAuthenticated, productId, selectedSize]);

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

  const fetchProduct = async () => {
    try {
      console.log('Fetching product:', productId);
      
      const response = await fetch(`${API_BASE}/api/product/${productId}`);
      const data = await response.json();
      
      console.log('Product response:', data);
      console.log('Product data:', data.data);
      console.log('Product details:', data.data?.product);

      if (data.success && data.data?.product) {
        console.log('Product set:', data.data.product);
        setProduct(data.data.product);
      } else {
        toast.error('Product not found');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product details');
      navigate('/');
    } finally {
      setPageLoading(false);
    }
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
        
        const defaultAddr = data.data.addresses.find((a: Address) => a.is_default);
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

  const handleSubscribe = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }

    if (!product || !selectedSize) {
      toast.error('Missing product or size information');
      return;
    }

    setLoading(true);

    try {
      console.log('Creating subscription with:', {
        productId: product.id,
        selectedSize,
        shippingAddressId: selectedAddressId,
        billingCycle: billingCycle || 'monthly'
      });

      // Step 1: Create subscription
      const subscriptionResponse = await fetch(`${API_BASE}/api/subscription/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: product.id,
          selectedSize: selectedSize,
          shippingAddressId: selectedAddressId,
          billingAddressId: selectedAddressId,
          billingCycle: billingCycle || 'monthly',
          customerNotes: customerNotes
        })
      });

      const subscriptionData = await subscriptionResponse.json();

      console.log('Subscription create response:', subscriptionData);

      if (!subscriptionData.success) {
        throw new Error(subscriptionData.message || 'Failed to create subscription');
      }

      const { razorpay } = subscriptionData.data;

      if (!razorpay || !razorpay.subscriptionId) {
        throw new Error('Invalid subscription data received');
      }

      // Step 2: Check if Razorpay is loaded
      if (typeof window.Razorpay === 'undefined') {
        throw new Error('Payment gateway not available. Please refresh the page.');
      }

      // Step 3: Open Razorpay checkout
      const options = {
        key: razorpay.keyId,
        subscription_id: razorpay.subscriptionId,
        name: 'Velora',
        description: `${product.productName} - ${billingCycle || 'Monthly'} Subscription`,
        theme: {
          color: '#7C3AED'
        },
        handler: async function (response: any) {
          try {
            console.log('Payment response:', response);
            setLoading(true);
            
            // Verify subscription payment
            const verifyResponse = await fetch(`${API_BASE}/api/subscription/verify-payment`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                razorpaySubscriptionId: response.razorpay_subscription_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              })
            });

            const verifyData = await verifyResponse.json();

            console.log('Verify response:', verifyData);

            if (verifyData.success) {
              toast.success('Subscription activated successfully!');
              navigate('/subscriptions');
            } else {
              throw new Error(verifyData.message || 'Subscription verification failed');
            }
          } catch (error: any) {
            toast.error(error.message || 'Subscription verification failed');
            console.error('Verification error:', error);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function() {
            toast.error('Subscription cancelled');
            setLoading(false);
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();

    } catch (error: any) {
      console.error('Subscribe error:', error);
      toast.error(error.message || 'Failed to create subscription');
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Product not found</p>
            <Link to="/" className="text-purple-600 hover:underline">← Back to Home</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const subscriptionPrice = product.finalPrice * (1 - (product.discountPercentage || 5) / 100);
  const savings = product.finalPrice - subscriptionPrice;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-gray-900 flex items-center gap-1">
              <Home size={16} /> Home
            </Link>
            <ChevronRight size={14} />
            <span>Products</span>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium">Subscribe & Save</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-2xl md:text-3xl font-light mb-2">Subscribe & Save</h1>
        <p className="text-gray-600 mb-8">
          Get this product delivered automatically and save {product.discountPercentage || 5}%
        </p>

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
                  onClick={() => setAddressModalOpen(true)}
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
                    onClick={() => setAddressModalOpen(true)}
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
                      <div className="flex items-start gap-3">
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
                            <span className="font-semibold">{address.full_name}</span>
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                              {address.address_type}
                            </span>
                            {address.is_default && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{address.phone}</p>
                          <p className="text-sm text-gray-700 mt-2">
                            {address.address_line1}
                            {address.address_line2 && `, ${address.address_line2}`}
                          </p>
                          <p className="text-sm text-gray-700">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Subscription Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-purple-600" />
                Subscription Details
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Billing Cycle:</span>
                  <span className="font-medium capitalize">{billingCycle || 'Monthly'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Selected Size:</span>
                  <span className="font-medium">{selectedSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">First Delivery:</span>
                  <span className="font-medium">Within 5-7 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Billing:</span>
                  <span className="font-medium">
                    {new Date(
                      Date.now() + ((billingCycle === 'monthly' ? 30 : billingCycle === 'quarterly' ? 90 : 365) * 24 * 60 * 60 * 1000)
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>You're saving ₹{savings.toFixed(0)}</strong> on every delivery! 
                  Cancel anytime with no penalties.
                </p>
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Delivery Instructions (Optional)</h2>
              <textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="Any special instructions for delivery?"
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Subscription Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Subscription Summary</h2>

              {/* Product */}
              <div className="flex gap-3 mb-4 pb-4 border-b">
                <img
                  src={product.mainImage || 'https://via.placeholder.com/80'}
                  alt={product.productName}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-medium line-clamp-2 text-sm">{product.productName}</p>
                  <p className="text-gray-500 text-xs mt-1">Size: {selectedSize}</p>
                  <p className="text-purple-600 font-semibold mt-1">
                    ₹{subscriptionPrice.toFixed(0)}/delivery
                  </p>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Regular Price</span>
                  <span className="line-through">₹{product.finalPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 font-medium">
                    Subscription Discount ({product.discountPercentage || 5}%)
                  </span>
                  <span className="text-green-600 font-medium">-₹{savings.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST (5%)</span>
                  <span>₹{(subscriptionPrice * 0.05).toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center font-semibold text-lg">
                  <span>First Payment</span>
                  <span className="text-purple-600">₹{(subscriptionPrice * 1.05).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleSubscribe}
                disabled={loading || !selectedAddressId || addresses.length === 0}
                className="w-full bg-purple-700 text-white py-3 rounded-lg font-medium hover:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Processing...
                  </span>
                ) : (
                  `Subscribe Now`
                )}
              </button>

              <div className="mt-4 space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-green-600" />
                  <span>100% Secure Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-green-600" />
                  <span>Cancel anytime, no fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-green-600" />
                  <span>Free shipping on all deliveries</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddressModal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        onSuccess={fetchAddresses}
        editAddress={null}
      />

      <Footer />
    </div>
  );
}