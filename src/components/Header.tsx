// src/components/Header.tsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, User as UserIcon, Search, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { CartModal, WishlistModal } from "./CartWishlistModals";
import Logo from "@/assets/logo-gold.svg";

const API_BASE = "https://clothing-store-server.vercel.app";

function resolveProfileImage(img?: string | null): string | null {
  if (!img) return null;
  const trimmed = img.trim();
  if (!trimmed) return null;
  
  if (/^https?:\/\//i.test(trimmed)) {
    const urlMatch = trimmed.match(/\/uploads\/.+$/);
    if (urlMatch) {
      return `${API_BASE}${urlMatch[0]}`;
    }
    return trimmed;
  }
  
  if (trimmed.startsWith("/")) {
    return `${API_BASE}${trimmed}`;
  }
  
  return `${API_BASE}/uploads/${trimmed}`;
}

export default function Header(): JSX.Element {
  const { user, isAuthenticated, signOut } = useAuth();
  const { cartCount, wishlistCount } = useCart();
  const navigate = useNavigate();
  const [q, setQ] = useState<string>("");
  const [openMenu, setOpenMenu] = useState<boolean>(false);
  
  // Modal states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (openMenu && !target.closest('.user-menu')) {
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

  const handleCartClick = () => {
    if (!isAuthenticated) {
      navigate("/signin", { state: { from: { pathname: window.location.pathname } } });
      return;
    }
    setIsCartOpen(true);
  };

  const handleWishlistClick = () => {
    if (!isAuthenticated) {
      navigate("/signin", { state: { from: { pathname: window.location.pathname } } });
      return;
    }
    setIsWishlistOpen(true);
  };

  const displayName = React.useMemo(() => {
    if (!user) return null;
    const first = user.firstName?.trim();
    const last = user.lastName?.trim();
    if (first || last) {
      return `${first ?? ""}${first && last ? " " : ""}${last ?? ""}`.trim();
    }
    if (user.username) return user.username;
    if (user.email) return user.email.split("@")[0];
    return null;
  }, [user]);

  const avatarInitial = displayName?.charAt(0)?.toUpperCase() ?? "U";
  
  const profileImageUrl = React.useMemo(() => {
    if (!user) return null;
    return resolveProfileImage(user.profileImage);
  }, [user]);

  const generateAvatarSvg = (initial: string): string => {
    const svg = encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect fill='#FDF6ED' width='100%' height='100%'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-family='Inter, Arial' font-size='45' fill='#B87333'>${initial}</text></svg>`
    );
    return `data:image/svg+xml;charset=UTF-8,${svg}`;
  };

  const avatarSrc = profileImageUrl || generateAvatarSvg(avatarInitial);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-3 sm:px-4 md:px-6 h-16 sm:h-20 md:h-24">
          <Link to="/" aria-label="Velora Home" className="flex items-center">
            <img 
              src={Logo} 
              alt="Velora" 
              className="h-10 sm:h-14 md:h-16 lg:h-20 w-auto object-contain" 
            />
          </Link>

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

          <nav className="flex items-center gap-2 sm:gap-3">
            <button
              aria-label="Wishlist"
              onClick={handleWishlistClick}
              className="relative p-1.5 sm:p-2 rounded-full hover:bg-gray-50 transition-colors"
              title="Wishlist"
            >
              <Heart 
                size={20} 
                className="sm:w-[22px] sm:h-[22px] text-red-500" 
                fill={wishlistCount > 0 ? "#EF4444" : "none"}
              />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] sm:text-xs rounded-full px-1 sm:px-1.5 min-w-[16px] sm:min-w-[18px] h-4 sm:h-auto flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              aria-label="Cart"
              onClick={handleCartClick}
              className="relative p-1.5 sm:p-2 rounded-full hover:bg-gray-50 transition-colors"
              title="Cart"
            >
              <ShoppingCart size={20} className="sm:w-[22px] sm:h-[22px] text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[10px] sm:text-xs rounded-full px-1 sm:px-1.5 min-w-[16px] sm:min-w-[18px] h-4 sm:h-auto flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <div className="relative user-menu">
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

      {/* Modals */}
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <WishlistModal isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
    </>
  );
}