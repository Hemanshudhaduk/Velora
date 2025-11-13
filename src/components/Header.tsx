import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, User, Search, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getCart, getWish } from "@/utils/localStore";
import Logo from "@/assets/logo-gold.svg";

export default function Header() {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const cartCount = getCart().reduce((sum, item) => sum + (item.qty || 0), 0);
  const wishCount = getWish().length;

  const handleSearch = () => {
    if (!q.trim()) return;
    navigate(`/women?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-4 md:px-6 h-20 md:h-24">
        
        {/* ----------- Logo ----------- */}
        <Link to="/" aria-label="Velora Home" className="flex items-center">
          <img
            src={Logo}
            alt="Velora"
            className="h-18 sm:h-16 md:h-16 lg:h-20 w-auto object-contain"
          />
        </Link>

        {/* ----------- Search Bar ----------- */}
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

        {/* ----------- Actions (Wishlist, Cart, Profile) ----------- */}
        <nav className="flex items-center gap-3">
          {/* Wishlist */}
          <button
            aria-label="Wishlist"
            onClick={() =>
              isAuthenticated
                ? navigate("/wishlist")
                : navigate("/signin", {
                    state: { from: { pathname: window.location.pathname } },
                  })
            }
            className="relative p-2 rounded-full hover:bg-gray-50 transition-colors"
          >
            <Heart size={22} className="text-amber-500" />
            {wishCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full px-1.5">
                {wishCount}
              </span>
            )}
          </button>

          {/* Cart */}
          <button
            aria-label="Cart"
            onClick={() =>
              isAuthenticated
                ? navigate("/cart")
                : navigate("/signin", {
                    state: { from: { pathname: window.location.pathname } },
                  })
            }
            className="relative p-2 rounded-full hover:bg-gray-50 transition-colors"
          >
            <ShoppingCart size={22} className="text-gray-700" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full px-1.5">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Menu */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 transition"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700">
                  {user?.name?.[0]?.toUpperCase() ?? "U"}
                </div>
                <ChevronDown size={14} className="text-gray-500" />
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-lg shadow-lg py-2">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Orders
                  </Link>
                  <Link
                    to="/wishlist"
                    className="block px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Wishlist
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/signin"
                className="hidden sm:inline-block text-sm px-3 py-1 rounded-md hover:bg-gray-100 transition"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="hidden sm:inline-block text-sm px-3 py-1 rounded-md border border-amber-500 text-amber-600 font-medium hover:bg-amber-50 transition"
              >
                Sign up
              </Link>
              <Link to="/signin" className="sm:hidden p-2 rounded-md hover:bg-gray-50">
                <User size={22} className="text-gray-700" />
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
