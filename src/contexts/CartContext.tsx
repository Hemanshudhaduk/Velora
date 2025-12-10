// src/contexts/CartContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  getToken,
  getUser,
  setToken as storeToken,
  setUser as storeUser,
  clearAuth,
} from "@/utils/localStore";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://clothing-store-server.vercel.app";

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  selectedSize: string;
  quantity: number;
  currentPrice: number;
  mainImage: string;
  availableStock: number;
  inStock: boolean;
}

interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  mainImage: string;
  finalPrice: number;
  isActive: boolean;
  inStock: boolean;
  availableSizes: Array<{ size: string; stock: number }>;
}

interface CartContextType {
  cartItems: CartItem[];
  wishlistItems: WishlistItem[];
  cartCount: number;
  wishlistCount: number;
  loading: boolean;
  addToCart: (
    productId: string,
    selectedSize: string,
    quantity: number
  ) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateCartQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (wishlistItemId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  refreshCart: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  updateCartQuantityLocal: (cartItemId: string, newQuantity: number) => void;
  removeFromCartLocal: (cartItemId: string) => void;
  restoreCartItems: (prevItems: CartItem[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, getToken } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = getToken();
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  const refreshCart = async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      setCartCount(0);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/cart/list`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      if (data.success) {
        setCartItems(data.data.cartItems || []);
        setCartCount(data.data.summary?.totalItems || 0);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const refreshWishlist = async () => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      setWishlistCount(0);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/wishlist/list`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      if (data.success) {
        setWishlistItems(data.data.wishlistItems || []);
        setWishlistCount(data.data.total || 0);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
      refreshWishlist();
    }
  }, [isAuthenticated]);

  const addToCart = async (
    productId: string,
    selectedSize: string,
    quantity: number
  ) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/cart/add`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ productId, selectedSize, quantity }),
      });

      const data = await response.json();

      if (data.success) {
        await refreshCart();
        return Promise.resolve();
      } else {
        throw new Error(data.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/cart/${cartItemId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        await refreshCart();
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCartQuantity = async (cartItemId: string, quantity: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/cart/${cartItemId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ quantity }),
      });

      const data = await response.json();

      if (data.success) {
        await refreshCart();
      }
    } catch (error) {
      console.error("Error updating cart quantity:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Local updates only - no API
  const updateCartQuantityLocal = (cartItemId, newQuantity) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCartLocal = (cartItemId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const restoreCartItems = (prevItems) => {
    setCartItems(prevItems);
  };

  const addToWishlist = async (productId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/wishlist/add`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (data.success) {
        await refreshWishlist();
        return Promise.resolve();
      } else {
        throw new Error(data.message || "Failed to add to wishlist");
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistItemId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/wishlist/${wishlistItemId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (data.success) {
        await refreshWishlist();
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlistItems.some((item) => item.productId === productId);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        wishlistItems,
        cartCount,
        wishlistCount,
        loading,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        refreshCart,
        refreshWishlist,
        updateCartQuantityLocal,
        removeFromCartLocal,
        restoreCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
