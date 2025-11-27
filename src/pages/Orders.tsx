import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ChevronRight, Home, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://clothing-store-server.vercel.app';

interface Order {
  id: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  createdAt: string;
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function Orders() {
  const navigate = useNavigate();
  const { isAuthenticated, getToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin', { state: { from: '/orders' } });
      return;
    }

    fetchOrders();
  }, [isAuthenticated, currentPage]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/api/order/my-orders?page=${currentPage}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        // IMPORTANT FIX: Filter orders to only show:
        // 1. COD orders (regardless of payment status)
        // 2. Online payment orders with successful payment
        const validOrders = data.data.orders.filter((order: Order) => 
          order.paymentMethod === 'cod' || 
          order.paymentStatus === 'success'
        );
        
        setOrders(validOrders);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading && orders.length === 0) {
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
            <span className="text-gray-900 font-medium">My Orders</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-2xl md:text-3xl font-light mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet
            </p>
            <Link
              to="/"
              className="inline-block bg-purple-700 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-800 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  to={`/order/detail/${order.id}`}
                  className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all"
                >
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                          <h3 className="font-semibold text-base md:text-lg">
                            Order #{order.orderNumber}
                          </h3>
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              STATUS_COLORS[order.orderStatus as keyof typeof STATUS_COLORS]
                            }`}
                          >
                            {order.orderStatus.toUpperCase()}
                          </span>
                          {order.paymentMethod === 'cod' && order.paymentStatus === 'pending' && (
                            <span className="text-xs px-2 py-1 rounded-full font-medium bg-amber-100 text-amber-800">
                              COD
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-x-4 md:gap-x-6 gap-y-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          <span>Payment: {order.paymentMethod.toUpperCase()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Total Amount</p>
                          <p className="text-lg md:text-xl font-semibold text-purple-600">
                            ₹{order.totalAmount.toLocaleString()}
                          </p>
                        </div>
                        <ChevronRight className="text-gray-400 hidden md:block" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-wrap justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}