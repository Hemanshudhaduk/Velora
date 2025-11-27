import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Package, MapPin, CreditCard, Home, ChevronRight, XCircle, Clock, Box, Truck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://clothing-store-server.vercel.app';

interface OrderItem {
  id: string;
  productSnapshot: {
    product_name: string;
    sku: string;
    main_image: string;
    size: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  shippingCharges: number;
  codCharges?: number;
  taxAmount: number;
  totalAmount: number;
  shippingAddress: any;
  trackingNumber?: string;
  courier?: string;
  createdAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, getToken } = useAuth();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    if (!orderId) {
      navigate('/orders');
      return;
    }

    fetchOrderDetails();
  }, [isAuthenticated, orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/order/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        // IMPORTANT FIX: Only show order if:
        // 1. It's a COD order
        // 2. It's an online payment with successful payment
        if (data.data.order.paymentMethod === 'cod' || data.data.order.paymentStatus === 'success') {
          setOrder(data.data.order);
          setOrderItems(data.data.orderItems);
        } else {
          toast.error('Order not found or payment pending');
          navigate('/orders');
        }
      } else {
        throw new Error('Order not found');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  // UPDATED: Changed to 24 hours (from 48)
  const canCancelOrder = (): boolean => {
    if (!order) return false;
    
    // Check status - only pending/confirmed can be cancelled
    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      return false;
    }

    // Check 24 hours limit
    const orderDate = new Date(order.createdAt);
    const currentDate = new Date();
    const hoursDifference = (currentDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60);

    return hoursDifference <= 24; // Changed from 48 to 24 hours
  };

  const getTimeRemaining = (): string => {
    if (!order) return '';
    
    const orderDate = new Date(order.createdAt);
    const currentDate = new Date();
    const hoursDifference = (currentDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
    const hoursRemaining = 24 - hoursDifference; // Changed from 48 to 24

    if (hoursRemaining <= 0) return '';

    if (hoursRemaining < 1) {
      return `${Math.floor(hoursRemaining * 60)} minutes`;
    } else if (hoursRemaining < 24) {
      return `${Math.floor(hoursRemaining)} hour${Math.floor(hoursRemaining) !== 1 ? 's' : ''}`;
    } else {
      return `${Math.floor(hoursRemaining / 24)} day${Math.floor(hoursRemaining / 24) !== 1 ? 's' : ''}`;
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    setCancelling(true);

    try {
      const response = await fetch(`${API_BASE}/api/order/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: cancelReason })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Order cancelled successfully');
        setShowCancelModal(false);
        setCancelReason('');
        fetchOrderDetails();
      } else {
        throw new Error(data.message || 'Failed to cancel order');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
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

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-gray-900 flex items-center gap-1 transition-colors">
              <Home size={16} /> Home
            </Link>
            <ChevronRight size={14} />
            <Link to="/orders" className="hover:text-gray-900 transition-colors">
              Orders
            </Link>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium">{order.orderNumber}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header with Cancel Button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-light mb-2">
              Order #{order.orderNumber}
            </h1>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Clock size={14} />
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <span
              className={`text-xs px-3 py-1 rounded-full font-medium ${
                STATUS_COLORS[order.orderStatus as keyof typeof STATUS_COLORS]
              }`}
            >
              {order.orderStatus.toUpperCase()}
            </span>

            {/* Cancel Button - Only shows if order is cancellable */}
            {canCancelOrder() && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium px-4 py-2 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                <XCircle size={16} />
                Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Cancellation Time Warning */}
        {canCancelOrder() && getTimeRemaining() && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <Clock size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-orange-800">
                <strong>Cancellation Available:</strong> You can cancel this order within the next <strong>{getTimeRemaining()}</strong>. 
                After 24 hours from order placement, cancellation won't be possible.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Box size={20} className="text-purple-600" />
                Order Items
              </h2>
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <img
                      src={item.productSnapshot.main_image || 'https://via.placeholder.com/100'}
                      alt={item.productSnapshot.product_name}
                      className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-md border border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium mb-1 text-sm md:text-base line-clamp-2">
                        {item.productSnapshot.product_name}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600">SKU: {item.productSnapshot.sku}</p>
                      <p className="text-xs md:text-sm text-gray-600">Size: {item.productSnapshot.size}</p>
                      <p className="text-xs md:text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-purple-600 font-semibold mt-2">
                        ₹{item.totalPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-purple-600" />
                Delivery Address
              </h2>
              <div className="text-sm">
                <p className="font-medium">{order.shippingAddress.full_name}</p>
                <p className="text-gray-600 mt-1">{order.shippingAddress.phone}</p>
                <p className="text-gray-700 mt-2">
                  {order.shippingAddress.address_line1}
                  {order.shippingAddress.address_line2 && `, ${order.shippingAddress.address_line2}`}
                </p>
                <p className="text-gray-700">
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 lg:sticky lg:top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>
                    {order.shippingCharges === 0 ? (
                      <span className="text-green-600 font-medium">FREE</span>
                    ) : (
                      `₹${order.shippingCharges}`
                    )}
                  </span>
                </div>
                {order.codCharges && order.codCharges > 0 && (
                  <div className="flex justify-between">
                    <span className="text-orange-600">COD Charges</span>
                    <span className="text-orange-600">₹{order.codCharges}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">GST</span>
                  <span>₹{order.taxAmount.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center font-semibold text-base">
                  <span>Total</span>
                  <span className="text-purple-600">₹{order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-purple-600" />
                Payment
              </h2>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Method</span>
                  <span className="font-medium uppercase">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span
                    className={`font-medium ${
                      order.paymentStatus === 'success'
                        ? 'text-green-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {order.paymentStatus.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Tracking */}
            {order.trackingNumber && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Truck size={20} className="text-purple-600" />
                  Tracking
                </h2>
                <div className="text-sm space-y-2">
                  <div>
                    <span className="text-gray-600 block mb-1">Tracking Number</span>
                    <p className="font-medium break-all">{order.trackingNumber}</p>
                  </div>
                  {order.courier && (
                    <div>
                      <span className="text-gray-600 block mb-1">Courier</span>
                      <p className="font-medium">{order.courier}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !cancelling && setShowCancelModal(false)}
          />
          
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <XCircle size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold">Cancel Order</h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to cancel this order? This action cannot be undone. 
              {order.paymentStatus === 'success' && (
                <span className="block mt-2 text-purple-600 font-medium">
                  Refunds will be processed within 5-7 business days.
                </span>
              )}
            </p>
            
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please tell us why you're cancelling (required)..."
              rows={4}
              disabled={cancelling}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4 resize-none disabled:bg-gray-100"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
                disabled={cancelling}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling || !cancelReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Cancelling...
                  </>
                ) : (
                  'Cancel Order'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}