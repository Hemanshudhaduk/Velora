// src/components/CartWishlistModals.tsx
import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { cartItems, cartCount, removeFromCart, updateCartQuantity } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleQuantityChange = async (cartItemId: string, newQuantity: number, maxStock: number) => {
    if (newQuantity < 1 || newQuantity > maxStock) return;
    try {
      await updateCartQuantity(cartItemId, newQuantity);
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemove = async (cartItemId: string) => {
    try {
      await removeFromCart(cartItemId);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.currentPrice * item.quantity,
    0
  );

  const handleViewCart = () => {
    onClose();
    navigate('/cart');
  };

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold">
            Cart {cartCount > 0 && `(${cartCount})`}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingBag size={64} className="text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg mb-2">Your cart is empty</p>
              <p className="text-gray-400 text-sm">Add items to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <img
                    src={item.mainImage || 'https://via.placeholder.com/100'}
                    alt={item.productName}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-medium text-sm line-clamp-1">
                        {item.productName}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Size: {item.selectedSize}
                      </p>
                      <p className="text-purple-700 font-semibold mt-1">
                        ₹{item.currentPrice.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 border rounded-md">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.availableStock)}
                          className="p-1 hover:bg-gray-100 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-medium min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.availableStock)}
                          className="p-1 hover:bg-gray-100 transition-colors"
                          disabled={item.quantity >= item.availableStock}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t p-4 bg-gray-50 sticky bottom-0">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-xl font-bold">₹{subtotal.toLocaleString()}</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleViewCart}
                className="flex-1 py-3 border border-purple-600 text-purple-700 rounded-lg font-medium hover:bg-purple-50 transition-colors"
              >
                View Cart
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 py-3 bg-purple-700 text-white rounded-lg font-medium hover:bg-purple-800 transition-colors shadow-md"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const WishlistModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { wishlistItems, wishlistCount, removeFromWishlist } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleRemove = async (wishlistItemId: string) => {
    try {
      await removeFromWishlist(wishlistItemId);
      toast.success('Item removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleViewWishlist = () => {
    onClose();
    navigate('/wishlist');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold">
            Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Wishlist Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {wishlistItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="text-8xl mb-4">💝</div>
              <p className="text-gray-500 text-lg mb-2">Your wishlist is empty</p>
              <p className="text-gray-400 text-sm">Save items you love</p>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <img
                    src={item.mainImage || 'https://via.placeholder.com/100'}
                    alt={item.productName}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-medium text-sm line-clamp-2">
                        {item.productName}
                      </h3>
                      <p className="text-purple-700 font-semibold mt-1">
                        ₹{item.finalPrice.toLocaleString()}
                      </p>
                      {!item.inStock && (
                        <p className="text-xs text-red-500 mt-1">Out of stock</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <button
                        onClick={() => {
                          onClose();
                          navigate(`/product/${item.productId}`);
                        }}
                        className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {wishlistItems.length > 0 && (
          <div className="border-t p-4 bg-gray-50 sticky bottom-0">
            <button
              onClick={handleViewWishlist}
              className="w-full py-3 bg-purple-700 text-white rounded-lg font-medium hover:bg-purple-800 transition-colors shadow-md"
            >
              View All Wishlist Items
            </button>
          </div>
        )}
      </div>
    </div>
  );
}