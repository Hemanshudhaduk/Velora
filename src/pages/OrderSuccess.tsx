// src/pages/OrderSuccess.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Home, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://clothing-store-server.vercel.app';

interface OrderDetails {
  id: string;
  orderNumber: string;
  orderStatus: string;
  paymentMethod: string;
  totalAmount: number;
  createdAt: string;
}

export default function OrderSuccess() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, getToken } = useAuth();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    if (!orderId) {
      navigate('/');
      return;
    }

    fetchOrderDetails();
  }, [isAuthenticated, orderId]);

  useEffect(() => { 
    window.scrollTo({ top: 0, behavior: 'smooth' });  
  }, []);

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
        setOrder(data.data.order);
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

      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle size={48} className="text-green-600" />
            </div>
            <h1 className="text-3xl font-light mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-600">Thank you for your order</p>
          </div>

          {/* Order Details Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Order Number</p>
                <p className="text-lg font-semibold text-purple-600">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Order Date</p>
                <p className="text-lg font-medium">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                <p className="text-lg font-semibold">₹{order.totalAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                <p className="text-lg font-medium uppercase">{order.paymentMethod}</p>
              </div>
            </div>

            {order.paymentMethod === 'cod' && (
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>Cash on Delivery:</strong> Please keep exact change ready for ₹{order.totalAmount.toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* What's Next */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">What's Next?</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-medium">
                  1
                </div>
                <div>
                  <p className="font-medium">Order Confirmation</p>
                  <p className="text-sm text-gray-600">You will receive an email/SMS confirmation shortly</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-medium">
                  2
                </div>
                <div>
                  <p className="font-medium">Processing</p>
                  <p className="text-sm text-gray-600">We'll start preparing your order for shipment</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-medium">
                  3
                </div>
                <div>
                  <p className="font-medium">Delivery</p>
                  <p className="text-sm text-gray-600">Your order will be delivered within 5-7 business days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to={`/order/detail/${order.id}`}
              className="flex-1 flex items-center justify-center gap-2 bg-purple-700 text-white py-3 rounded-lg font-medium hover:bg-purple-800 transition-colors"
            >
              <Package size={20} />
              View Order Details
            </Link>
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-2 border border-purple-600 text-purple-600 py-3 rounded-lg font-medium hover:bg-purple-50 transition-colors"
            >
              <Home size={20} />
              Continue Shopping
            </Link>
          </div>

          {/* Support Info */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>Need help with your order?</p>
            <p className="mt-1">
              Contact us at{' '}
              <a href="mailto:support@velora.com" className="text-purple-600 hover:text-purple-700">
                support@velora.com
              </a>
              {' '}or call{' '}
              <a href="tel:+911234567890" className="text-purple-600 hover:text-purple-700">
                +91 123 456 7890
              </a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}