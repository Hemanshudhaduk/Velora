// src/pages/Cart.tsx
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, Home, ChevronRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/components/ui/use-toast';

export default function Cart() {
  const { cartItems, cartCount, removeFromCart, updateCartQuantity } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();


  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleQuantityChange = async (cartItemId: string, newQuantity: number, maxStock: number) => {
    if (newQuantity < 1 || newQuantity > maxStock) return;
    
    try {
      await updateCartQuantity(cartItemId, newQuantity);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update quantity',
        variant: 'destructive',
      });
    }
  };

  const handleRemove = async (cartItemId: string, productName: string) => {
    try {
      await removeFromCart(cartItemId);
      toast({
        title: 'Removed',
        description: `${productName} removed from cart`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove item',
        variant: 'destructive',
      });
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.currentPrice * item.quantity,
    0
  );

  const shipping = subtotal > 1000 ? 0 : 99;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        
        <div className="flex-1 flex items-center justify-center py-16">
          <div className="text-center max-w-md px-4">
            <ShoppingBag size={80} className="mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-semibold mb-3">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added anything to your cart yet
            </p>
            <Link
              to="/"
              className="inline-block bg-amber-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-amber-600 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
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
            <Link to="/" className="hover:text-gray-900 flex items-center gap-1">
              <Home size={16} /> Home
            </Link>
            <ChevronRight size={14} />
            <span className="text-gray-900">Shopping Cart</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-3xl font-light mb-8">
          Shopping Cart <span className="text-gray-500">({cartCount} items)</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  <Link to={`/product/${item.productId}`} className="flex-shrink-0">
                    <img
                      src={item.mainImage || 'https://via.placeholder.com/150'}
                      alt={item.productName}
                      className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-md border border-gray-200"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-4 mb-2">
                      <Link
                        to={`/product/${item.productId}`}
                        className="font-medium text-gray-900 hover:text-amber-600 transition-colors line-clamp-2"
                      >
                        {item.productName}
                      </Link>
                      <button
                        onClick={() => handleRemove(item.id, item.productName)}
                        className="flex-shrink-0 text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">Size: {item.selectedSize}</p>

                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3 border border-gray-300 rounded-md">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.availableStock)}
                          disabled={item.quantity <= 1}
                          className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-medium min-w-[30px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.availableStock)}
                          disabled={item.quantity >= item.availableStock}
                          className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-semibold text-amber-600">
                          ₹{(item.currentPrice * item.quantity).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          ₹{item.currentPrice.toLocaleString()} each
                        </p>
                      </div>
                    </div>

                    {!item.inStock && (
                      <div className="mt-3 bg-red-50 border border-red-200 rounded px-3 py-2">
                        <p className="text-sm text-red-600 font-medium">Out of stock</p>
                      </div>
                    )}
                    {item.quantity > item.availableStock && item.inStock && (
                      <div className="mt-3 bg-orange-50 border border-orange-200 rounded px-3 py-2">
                        <p className="text-sm text-orange-600">
                          Only {item.availableStock} available
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 sticky top-24">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal ({cartCount} items)</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-medium">FREE</span>
                    ) : (
                      `₹${shipping}`
                    )}
                  </span>
                </div>
                {subtotal < 1000 && (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                    Add ₹{(1000 - subtotal).toLocaleString()} more for FREE shipping!
                  </p>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-amber-600">₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-amber-500 text-white py-3 rounded-lg font-medium hover:bg-amber-600 transition-colors shadow-md mb-3"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/"
                className="block text-center text-amber-600 hover:text-amber-700 font-medium text-sm"
              >
                ← Continue Shopping
              </Link>

              <div className="mt-6 pt-6 border-t space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Easy returns within 7 days</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Free shipping on orders above ₹1000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}