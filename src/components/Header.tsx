// src/components/Header.tsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, User as UserIcon, Search, ChevronDown, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getCart, getWish } from "@/utils/localStore";
import Logo from "@/assets/logo-gold.svg";

const API_BASE = "http://localhost:5000";

/**
 * Resolve profile image URL
 */
function resolveProfileImage(img?: string | null): string | null {
  if (!img) return null;
  const trimmed = img.trim();
  if (!trimmed) return null;
  
  // If it's already a full URL
  if (/^https?:\/\//i.test(trimmed)) {
    const urlMatch = trimmed.match(/\/uploads\/.+$/);
    if (urlMatch) {
      return `${API_BASE}${urlMatch[0]}`;
    }
    return trimmed;
  }
  
  // If it starts with slash, append to API base
  if (trimmed.startsWith("/")) {
    return `${API_BASE}${trimmed}`;
  }
  
  // Otherwise assume it's a filename in uploads folder
  return `${API_BASE}/uploads/${trimmed}`;
}

/**
 * Off-canvas sidebar shared container
 */
interface OffcanvasProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Offcanvas({ open, onClose, title, children }: OffcanvasProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        aria-hidden="true"
      />

      {/* panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white z-50 shadow-xl transform transition-transform duration-300"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            aria-label="Close"
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100%-64px)]">{children}</div>
      </aside>
    </>
  );
}

/** Cart/Wishlist item type */
interface CartItem {
  id?: string | number;
  name?: string;
  image?: string;
  price?: number;
  size?: string;
  qty?: number;
}

/** Simple cart item row */
function CartRow({ item }: { item: CartItem }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-b-0">
      <img
        src={item.image || "https://via.placeholder.com/64"}
        alt={item.name || "product"}
        className="w-16 h-16 object-cover rounded"
      />
      <div className="flex-1">
        <div className="text-sm font-medium">{item.name || "Product name"}</div>
        <div className="text-xs text-gray-500">Size: {item.size || "-"}</div>
        <div className="text-sm text-amber-700 font-semibold">
          ₹{item.price?.toFixed?.(2) ?? item.price}
        </div>
      </div>
      <div className="text-xs text-gray-500">x{item.qty || 1}</div>
    </div>
  );
}

/** Simple wishlist row */
function WishRow({ item }: { item: CartItem }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-b-0">
      <img
        src={item.image || "https://via.placeholder.com/64"}
        alt={item.name || "wish"}
        className="w-16 h-16 object-cover rounded"
      />
      <div className="flex-1">
        <div className="text-sm font-medium">{item.name || "Wishlist item"}</div>
        <div className="text-sm text-amber-700 font-semibold">
          ₹{item.price?.toFixed?.(2) ?? item.price}
        </div>
      </div>
      <div className="text-xs text-gray-500">⋯</div>
    </div>
  );
}

export default function Header(): JSX.Element {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState<string>("");
  const [openMenu, setOpenMenu] = useState<boolean>(false);

  // sidebar states
  const [openCart, setOpenCart] = useState<boolean>(false);
  const [openWish, setOpenWish] = useState<boolean>(false);

  // source data
  const [cartItems, setCartItems] = useState<CartItem[]>(() => getCart());
  const [wishItems, setWishItems] = useState<CartItem[]>(() => getWish());

  // derived counts
  const cartCount = cartItems.reduce((sum, item) => sum + (item.qty || 0), 0);
  const wishCount = wishItems.length;

  // keep local state in sync if localStorage changes elsewhere
  useEffect(() => {
    const onStorage = () => {
      setCartItems(getCart());
      setWishItems(getWish());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (openMenu && !target.closest('.relative')) {
        setOpenMenu(false);
      }
    };
    
    if (openMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openMenu]);

  const handleSearch = () => {
    if (!q.trim()) return;
    navigate(`/women?q=${encodeURIComponent(q.trim())}`);
  };

  const openCartPanel = () => {
    if (!isAuthenticated) {
      navigate("/signin", { state: { from: { pathname: window.location.pathname } } });
      return;
    }
    // refresh cart before opening
    setCartItems(getCart());
    setOpenCart(true);
  };

  const openWishPanel = () => {
    if (!isAuthenticated) {
      navigate("/signin", { state: { from: { pathname: window.location.pathname } } });
      return;
    }
    setWishItems(getWish());
    setOpenWish(true);
  };

  // derive a friendly display name from available fields
  const displayName = React.useMemo(() => {
    if (!user) return null;
    // prefer full name if available
    const first = user.firstName?.trim();
    const last = user.lastName?.trim();
    if (first || last) {
      return `${first ?? ""}${first && last ? " " : ""}${last ?? ""}`.trim();
    }
    // then username
    if (user.username) return user.username;
    // fallback to email prefix
    if (user.email) return user.email.split("@")[0];
    return null;
  }, [user]);

  const avatarInitial = displayName?.charAt(0)?.toUpperCase() ?? "U";
  
  // Get profile image URL or generate fallback
  const profileImageUrl = React.useMemo(() => {
    if (!user) return null;
    return resolveProfileImage(user.profileImage);
  }, [user]);

  // Generate SVG fallback for avatar
  const generateAvatarSvg = (initial: string): string => {
    const svg = encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect fill='#FDF6ED' width='100%' height='100%'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-family='Inter, Arial' font-size='45' fill='#B87333'>${initial}</text></svg>`
    );
    return `data:image/svg+xml;charset=UTF-8,${svg}`;
  };

  const avatarSrc = profileImageUrl || generateAvatarSvg(avatarInitial);

  const calculateSubtotal = (): number => {
    return cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.qty || 1)), 0);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-3 sm:px-4 md:px-6 h-16 sm:h-20 md:h-24">
          {/* Logo */}
          <Link to="/" aria-label="Velora Home" className="flex items-center">
            <img 
              src={Logo} 
              alt="Velora" 
              className="h-10 sm:h-14 md:h-16 lg:h-20 w-auto object-contain" 
            />
          </Link>

          {/* Search - hidden on small */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="w-full max-w-2xl">
              <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-full px-4 py-1.5 shadow-sm hover:shadow-md transition-all duration-200">
                <Search className="text-amber-500" size={18} />
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search dresses, kurtas, tops..."
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-1.5 rounded-full bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-all shadow-sm"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <nav className="flex items-center gap-2 sm:gap-3">
            {/* Wishlist - open sidebar */}
            <button
              aria-label="Wishlist"
              onClick={openWishPanel}
              className="relative p-1.5 sm:p-2 rounded-full hover:bg-gray-50 transition-colors"
              title="Wishlist"
            >
              <Heart size={20} className="sm:w-[22px] sm:h-[22px] text-amber-500" />
              {wishCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] sm:text-xs rounded-full px-1 sm:px-1.5 min-w-[16px] sm:min-w-[18px] h-4 sm:h-auto flex items-center justify-center">
                  {wishCount}
                </span>
              )}
            </button>

            {/* Cart - open sidebar */}
            <button
              aria-label="Cart"
              onClick={openCartPanel}
              className="relative p-1.5 sm:p-2 rounded-full hover:bg-gray-50 transition-colors"
              title="Cart"
            >
              <ShoppingCart size={20} className="sm:w-[22px] sm:h-[22px] text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] sm:text-xs rounded-full px-1 sm:px-1.5 min-w-[16px] sm:min-w-[18px] h-4 sm:h-auto flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setOpenMenu((prev) => !prev)}
                  className="flex items-center gap-1 sm:gap-2 px-1 sm:px-2 py-1 rounded hover:bg-gray-50 transition"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-amber-200">
                    <img 
                      src={avatarSrc} 
                      alt={displayName || "User"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to SVG if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = generateAvatarSvg(avatarInitial);
                      }}
                    />
                  </div>
                  <ChevronDown size={12} className="sm:w-[14px] sm:h-[14px] text-gray-500" />
                </button>

                {openMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700">
                      <div className="font-medium">{displayName}</div>
                      <div className="text-xs text-gray-500">{user?.email}</div>
                    </div>
                    <hr className="my-1" />
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      onClick={() => setOpenMenu(false)}
                    >
                      My Profile
                    </Link>
                    <Link 
                      to="/orders" 
                      className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      onClick={() => setOpenMenu(false)}
                    >
                      Orders
                    </Link>
                    <Link 
                      to="/wishlist" 
                      className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      onClick={() => setOpenMenu(false)}
                    >
                      Wishlist
                    </Link>
                    <button
                      onClick={() => { 
                        signOut(); 
                        setOpenMenu(false); 
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link 
                  to="/signin" 
                  className="hidden sm:inline-block text-sm px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Sign in
                </Link>
                <Link 
                  to="/signup" 
                  className="hidden sm:inline-block text-sm px-3 py-1 rounded-md border border-amber-500 text-amber-600 font-medium hover:bg-amber-50 transition-colors"
                >
                  Sign up
                </Link>
                <Link 
                  to="/signin" 
                  className="sm:hidden p-1.5 sm:p-2 rounded-md hover:bg-gray-50"
                >
                  <UserIcon size={20} className="sm:w-[22px] sm:h-[22px] text-gray-700" />
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Cart sidebar */}
      <Offcanvas
        open={openCart}
        onClose={() => setOpenCart(false)}
        title={`Cart (${cartCount})`}
      >
        {cartItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Your cart is empty</div>
        ) : (
          <>
            <div className="space-y-2">
              {cartItems.map((item, idx) => (
                <CartRow key={item.id ?? idx} item={item} />
              ))}
            </div>

            <div className="mt-6 border-t pt-4">
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm text-gray-600">Subtotal</div>
                <div className="text-lg font-semibold">
                  ₹{calculateSubtotal().toFixed(2)}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setOpenCart(false);
                    navigate("/cart");
                  }}
                  className="flex-1 py-2 rounded-md bg-amber-500 text-white font-medium hover:opacity-95 transition-opacity"
                >
                  View Cart
                </button>
                <button
                  onClick={() => {
                    setOpenCart(false);
                    navigate("/checkout");
                  }}
                  className="flex-1 py-2 rounded-md border border-amber-300 text-amber-700 font-medium hover:bg-amber-50 transition-colors"
                >
                  Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </Offcanvas>

      {/* Wishlist sidebar */}
      <Offcanvas
        open={openWish}
        onClose={() => setOpenWish(false)}
        title={`Wishlist (${wishCount})`}
      >
        {wishItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No items in wishlist</div>
        ) : (
          <>
            <div className="space-y-2">
              {wishItems.map((item, idx) => (
                <WishRow key={item.id ?? idx} item={item} />
              ))}
            </div>

            <div className="mt-6">
              <button
                onClick={() => {
                  setOpenWish(false);
                  navigate("/wishlist");
                }}
                className="w-full py-2 rounded-md bg-amber-500 text-white font-medium hover:opacity-95 transition-opacity"
              >
                View Wishlist
              </button>
            </div>
          </>
        )}
      </Offcanvas>
    </>
  );
}