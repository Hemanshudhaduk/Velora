// src/pages/Wishlist.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, Home, ChevronRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

export default function Wishlist() {
  const { wishlistItems, wishlistCount, removeFromWishlist, addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [movingToCart, setMovingToCart] = useState<string | null>(null);
  const [removingItem, setRemovingItem] = useState<string | null>(null);

  const handleRemove = async (wishlistItemId: string, productName: string) => {
    setRemovingItem(wishlistItemId);
    try {
      await removeFromWishlist(wishlistItemId);
      toast.success(`${productName} removed from wishlist`);
    } catch (error) {
      toast.error('Failed to remove item');
    } finally {
      setRemovingItem(null);
    }
  };

  const handleMoveToCart = async (item: any) => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    if (item.availableSizes.length === 0) {
      toast.error('This item is currently out of stock');
      return;
    }

    setMovingToCart(item.id);
    try {
      // Use the first available size by default
      await addToCart(item.productId, item.availableSizes[0].size, 1);
      await removeFromWishlist(item.id);
      toast.success(`${item.productName} moved to cart`);
    } catch (error) {
      toast.error('Failed to move item to cart');
    } finally {
      setMovingToCart(null);
    }
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        
        <div className="flex-1 flex items-center justify-center py-16">
          <div className="text-center max-w-md px-4">
            <div className="mb-6">
              <Heart size={80} className="mx-auto text-gray-300" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl md:text-3xl font-light mb-3">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8">
              Save your favorite items here for later
            </p>
            <Link
              to="/"
              className="inline-block bg-purple-700 hover:bg-purple-800 text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-md"
            >
              Discover Products
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
            <span className="text-gray-900 font-medium">Wishlist</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-light flex items-center gap-3">
            <Heart size={28} className="text-red-500" fill="#EF4444" />
            My Wishlist 
            <span className="text-gray-500">({wishlistCount})</span>
          </h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 group"
            >
              {/* Product Image */}
              <Link to={`/product/${item.productId}`} className="relative block">
                <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                  <img
                    src={item.mainImage || 'https://via.placeholder.com/300x400?text=No+Image'}
                    alt={item.productName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                {!item.inStock && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-medium">
                      Out of Stock
                    </span>
                  </div>
                )}
                {item.inStock && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart size={16} fill="white" />
                  </div>
                )}
              </Link>

              {/* Product Info */}
              <div className="p-3 md:p-4">
                <Link
                  to={`/product/${item.productId}`}
                  className="block mb-2"
                >
                  <h3 className="font-medium text-sm md:text-base line-clamp-2 min-h-[2.5rem] hover:text-purple-600 transition-colors">
                    {item.productName}
                  </h3>
                </Link>

                {/* {item.categoryName && (
                  <p className="text-xs text-gray-500 mb-2">{item.categoryName}</p>
                )} */}

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-lg md:text-xl font-semibold text-purple-700">
                    ₹{item.finalPrice.toLocaleString()}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMoveToCart(item)}
                    disabled={!item.inStock || movingToCart === item.id}
                    className="flex-1 bg-purple-700 text-white px-3 py-2.5 rounded-md text-sm font-medium hover:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                  >
                    {movingToCart === item.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <>
                        <ShoppingCart size={16} />
                        <span className="hidden sm:inline">Move to Cart</span>
                        <span className="sm:hidden">Add</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleRemove(item.id, item.productName)}
                    disabled={removingItem === item.id}
                    className="p-2.5 border border-red-200 text-red-500 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center"
                    title="Remove from wishlist"
                  >
                    {removingItem === item.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-center">About Your Wishlist</h2>
            <div className="grid md:grid-cols-3 gap-6 text-center text-sm text-gray-600">
              <div>
                <Heart size={24} className="mx-auto mb-2 text-red-500" />
                <p className="font-medium text-gray-900 mb-1">Save Favorites</p>
                <p>Keep track of products you love</p>
              </div>
              <div>
                <ShoppingCart size={24} className="mx-auto mb-2 text-purple-600" />
                <p className="font-medium text-gray-900 mb-1">Quick Add to Cart</p>
                <p>Move items to cart anytime</p>
              </div>
              <div>
                <svg className="w-6 h-6 mx-auto mb-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
                <p className="font-medium text-gray-900 mb-1">Price Drop Alerts</p>
                <p>Get notified of special offers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}