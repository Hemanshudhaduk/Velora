import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { RefreshCw } from "lucide-react";
import {
  Package,
  Calendar,
  CreditCard,
  Pause,
  Play,
  X,
  ChevronRight,
  Home,
  Truck,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://clothing-store-server.vercel.app";

interface Subscription {
  id: string;
  razorpay_subscription_id: string;
  product_name: string;
  product_image: string;
  product_sku: string;
  selected_size: string;
  amount: string;
  billing_cycle: string;
  status: string;
  next_billing_date: string;
  total_orders: number;
  total_cycles_completed: number;
  start_date: string;
  cancelled_at: string | null;
  paused_at: string | null;
  shipping_city: string;
  shipping_state: string;
}

export default function MySubscriptions() {
  const navigate = useNavigate();
  const { isAuthenticated, getToken } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }
    fetchSubscriptions();
  }, [isAuthenticated]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/api/subscription/my-subscriptions`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        setSubscriptions(data.data.subscriptions);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this subscription? You can always subscribe again later.",
    );

    if (!confirmed) return;

    try {
      setActionLoading(subscriptionId);
      const response = await fetch(
        `${API_BASE}/api/subscription/${subscriptionId}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cancelAtCycleEnd: false }),
        },
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Subscription cancelled successfully");
        fetchSubscriptions();
      } else {
        // ✅ Show specific error message
        toast.error(data.message || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Cancel subscription error:", error);
      toast.error("Failed to cancel subscription");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePauseSubscription = async (subscriptionId: string) => {
    try {
      setActionLoading(subscriptionId);
      const response = await fetch(
        `${API_BASE}/api/subscription/${subscriptionId}/pause`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Subscription paused successfully");
        fetchSubscriptions();
      } else {
        // ✅ Show specific error message
        toast.error(data.message || "Failed to pause subscription");
      }
    } catch (error) {
      console.error("Pause subscription error:", error);
      toast.error("Failed to pause subscription");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResumeSubscription = async (subscriptionId: string) => {
    try {
      setActionLoading(subscriptionId);
      const response = await fetch(
        `${API_BASE}/api/subscription/${subscriptionId}/resume`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Subscription resumed successfully");
        fetchSubscriptions();
      } else {
        // ✅ Show specific error message
        toast.error(data.message || "Failed to resume subscription");
      }
    } catch (error) {
      console.error("Resume subscription error:", error);
      toast.error("Failed to resume subscription");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSyncStatus = async (subscriptionId: string) => {
    try {
      setActionLoading(subscriptionId);
      const response = await fetch(
        `${API_BASE}/api/subscription/${subscriptionId}/sync`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Subscription status updated");
        fetchSubscriptions();
      } else {
        toast.error(data.message || "Failed to sync status");
      }
    } catch (error) {
      console.error("Sync status error:", error);
      toast.error("Failed to sync status");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700 border-green-200";
      case "paused":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      case "created":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link
              to="/"
              className="hover:text-gray-900 flex items-center gap-1"
            >
              <Home size={16} /> Home
            </Link>
            <ChevronRight size={14} />
            <span>Account</span>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium">My Subscriptions</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-light mb-2">My Subscriptions</h1>
          <p className="text-gray-600">
            Manage your active subscriptions and delivery schedule
          </p>
        </div>

        {subscriptions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-medium mb-2">
              No Active Subscriptions
            </h2>
            <p className="text-gray-600 mb-6">
              Subscribe to your favorite products and enjoy hassle-free
              auto-delivery with exclusive savings!
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-purple-700 text-white px-6 py-3 rounded-lg hover:bg-purple-800 transition-colors"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={sub.product_image || "https://via.placeholder.com/100"}
                    alt={sub.product_name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          {sub.product_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          SKU: {sub.product_sku} • Size: {sub.selected_size}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`text-xs px-3 py-1 rounded-full border font-medium ${getStatusColor(sub.status)}`}
                          >
                            {sub.status.toUpperCase()}
                          </span>
                          <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full border border-purple-200 font-medium">
                            {sub.billing_cycle.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">
                          ₹{parseFloat(sub.amount).toLocaleString()}
                          <span className="text-sm font-normal text-gray-600">
                            /delivery
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 py-4 border-y">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Next Billing
                        </p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Calendar size={14} className="text-purple-600" />
                          {new Date(sub.next_billing_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Deliveries</p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Truck size={14} className="text-purple-600" />
                          {sub.total_cycles_completed} completed
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Started</p>
                        <p className="text-sm font-medium">
                          {new Date(sub.start_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Shipping To
                        </p>
                        <p className="text-sm font-medium">
                          {sub.shipping_city}, {sub.shipping_state}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons - FIXED */}
                    <div className="flex gap-3">
                      {sub.status === "active" && (
                        <>
                          <button
                            onClick={() => handlePauseSubscription(sub.id)}
                            disabled={actionLoading === sub.id}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            <Pause size={16} />
                            {actionLoading === sub.id ? "Pausing..." : "Pause"}
                          </button>
                          <button
                            onClick={() => handleCancelSubscription(sub.id)}
                            disabled={actionLoading === sub.id}
                            className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            <X size={16} />
                            {actionLoading === sub.id
                              ? "Cancelling..."
                              : "Cancel"}
                          </button>
                        </>
                      )}

                      {sub.status === "paused" && (
                        <>
                          <button
                            onClick={() => handleResumeSubscription(sub.id)}
                            disabled={actionLoading === sub.id}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            <Play size={16} />
                            {actionLoading === sub.id
                              ? "Resuming..."
                              : "Resume"}
                          </button>
                          <button
                            onClick={() => handleCancelSubscription(sub.id)}
                            disabled={actionLoading === sub.id}
                            className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            <X size={16} />
                            {actionLoading === sub.id
                              ? "Cancelling..."
                              : "Cancel"}
                          </button>
                        </>
                      )}

                      {sub.status === "cancelled" && (
                        <div className="text-sm text-gray-600 bg-red-50 px-4 py-2 rounded-lg">
                          ❌ Cancelled on{" "}
                          {new Date(sub.cancelled_at!).toLocaleDateString()}
                        </div>
                      )}

                      {sub.status === "created" && (
                        <div className="flex gap-3">
                          <div className="text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
                            ⏳ Pending first payment
                          </div>
                          <button
                            onClick={() => handleSyncStatus(sub.id)}
                            disabled={actionLoading === sub.id}
                            className="flex items-center gap-2 px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            <RefreshCw size={16} />
                            {actionLoading === sub.id
                              ? "Checking..."
                              : "Check Status"}
                          </button>
                        </div>
                      )}

                      {sub.status === "halted" && (
                        <div className="text-sm text-orange-600 bg-orange-50 px-4 py-2 rounded-lg">
                          ⚠️ Payment failed - Please update payment method
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
