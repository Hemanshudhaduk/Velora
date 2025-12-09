// src/pages/ProductDetail.tsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronRight, Home, X, Heart, ShoppingBag } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const API_BASE =
  (import.meta && (import.meta as any).env?.VITE_API_BASE_URL) ||
  (process.env.REACT_APP_API_BASE_URL as string) ||
  "https://clothing-store-server.vercel.app";

interface Product {
  id: string;
  categoryId: string;
  categoryName: string;
  productName: string;
  sku: string;
  mainImage: string;
  images: string[];
  originalPrice: number;
  discountPercentage: number;
  finalPrice: number;
  description: string;
  material: string;
  fit: string;
  sizes: Array<{ size: string; stock: number }>;
  specifications: any;
  totalStock: number;
  isActive: boolean;
  isFeatured: boolean;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Get the correct functions from useCart
  const { 
    addToCart,           // ← USE THIS, NOT addItem
    addToWishlist, 
    removeFromWishlist, 
    isInWishlist, 
    wishlistItems 
  } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(["description"]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);

  const placeholderImage = "https://via.placeholder.com/800x1000?text=No+Image";

  const inWishlist = product ? isInWishlist(product.id) : false;
  const wishlistItem = wishlistItems.find(item => item.productId === product?.id);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/product/${id}`);
        const json = await res.json();

        if (json && json.success && json.data && json.data.product) {
          setProduct(json.data.product);
          
          // Auto-select first available size
          const availableSizes = (json.data.product.sizes || []).filter((s: any) => s.stock > 0);
          if (availableSizes.length > 0) {
            setSelectedSize(availableSizes[0].size);
          }
        } else {
          toast.error("Product not found");
          navigate("/");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  // FIXED: Use addToCart instead of addItem
  const handleAddToBag = async () => {
    // Check authentication first
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to cart");
      navigate('/signin', { state: { from: { pathname: window.location.pathname } } });
      return;
    }

    if (!product) return;

    // Validate size selection
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    // Check stock
    const sizeObj = product.sizes.find((s) => s.size === selectedSize);
    if (sizeObj && sizeObj.stock <= 0) {
      toast.error("Selected size is out of stock");
      return;
    }

    setAddingToCart(true);
    try {
      // CORRECT: Use addToCart with (productId, selectedSize, quantity)
      await addToCart(product.id, selectedSize, 1);
      toast.success("Added to cart!");
    } catch (error: any) {
      console.error("Add to cart error:", error);
      toast.error(error.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to wishlist");
      navigate('/signin', { state: { from: { pathname: window.location.pathname } } });
      return;
    }

    if (!product) return;

    setAddingToWishlist(true);
    try {
      if (inWishlist && wishlistItem) {
        await removeFromWishlist(wishlistItem.id);
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist(product.id);
        toast.success("Added to wishlist");
      }
    } catch (error: any) {
      console.error("Wishlist error:", error);
      toast.error(error.message || "Failed to update wishlist");
    } finally {
      setAddingToWishlist(false);
    }
  };

  const allImages = product
    ? [product.mainImage, ...product.images].filter(Boolean)
    : [placeholderImage];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Product not found</p>
            <Link to="/" className="text-amber-600 hover:text-amber-700">
              ← Back to Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-gray-900 flex items-center gap-1">
            <Home size={16} /> Home
          </Link>
          <ChevronRight size={14} />
          <Link
            to={`/${product.categoryName.toLowerCase().replace(/\s+/g, "-")}/${product.categoryId}`}
            className="hover:text-gray-900"
          >
            {product.categoryName}
          </Link>
          <ChevronRight size={14} />
          <span className="text-gray-900">{product.productName}</span>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Images */}
          <div>
            {/* Main Image */}
            <div
              className="relative aspect-[3/4] overflow-hidden rounded-lg mb-4 cursor-pointer"
              onClick={() => setShowImageModal(true)}
            >
              <img
                src={allImages[selectedImageIndex] || placeholderImage}
                alt={product.productName}
                className="w-full h-full object-cover"
                loading="lazy" 
              />
              {product.isFeatured && (
                <span className="absolute top-4 left-4 bg-amber-500 text-white text-xs px-3 py-1 rounded">
                  NEW
                </span>
              )}
              {product.discountPercentage > 0 && (
                <span className="absolute top-4 right-4 bg-red-500 text-white text-xs px-3 py-1 rounded">
                  {product.discountPercentage}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail Images */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.slice(0, 4).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-[3/4] overflow-hidden rounded-lg transition-all ${
                      selectedImageIndex === index
                        ? "ring-2 ring-gray-900"
                        : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={image || placeholderImage}
                      alt={`${product.productName} view ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy" 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div>
            <div className="sticky top-4">
              <h1 className="text-2xl md:text-3xl font-light mb-2">{product.productName}</h1>
              <p className="text-sm text-gray-500 mb-4">SKU: {product.sku}</p>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl font-semibold">₹{product.finalPrice.toLocaleString()}</span>
                {product.discountPercentage > 0 && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                    <span className="text-sm text-green-600 font-medium">
                      {product.discountPercentage}% off
                    </span>
                  </>
                )}
              </div>

              {/* Size Selector */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">
                    Size: {selectedSize && <span className="text-gray-600">{selectedSize}</span>}
                  </label>
                  <button className="text-xs text-amber-600 hover:text-amber-700">
                    View Size Chart
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {product.sizes.map((sizeObj) => {
                    const isOutOfStock = sizeObj.stock <= 0;
                    return (
                      <button
                        key={sizeObj.size}
                        onClick={() => !isOutOfStock && setSelectedSize(sizeObj.size)}
                        disabled={isOutOfStock}
                        className={`py-3 px-2 border rounded-lg text-sm font-medium transition-all ${
                          selectedSize === sizeObj.size
                            ? "bg-gray-900 text-white border-gray-900"
                            : isOutOfStock
                            ? "border-gray-200 text-gray-300 cursor-not-allowed line-through"
                            : "border-gray-300 hover:border-gray-900"
                        }`}
                      >
                        {sizeObj.size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleAddToBag}
                  disabled={!selectedSize || addingToCart}
                  className="flex-1 bg-purple-700 hover:bg-purple-800 text-white py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingToCart ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={20} />
                      ADD TO CART
                    </>
                  )}
                </button>

                <button
                  onClick={handleWishlistToggle}
                  disabled={addingToWishlist}
                  className={`px-5 py-4 rounded-lg border-2 transition-all ${
                    inWishlist
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-red-500 hover:bg-red-50"
                  }`}
                  title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  {addingToWishlist ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current" />
                  ) : (
                    <Heart
                      size={24}
                      fill={inWishlist ? "#EF4444" : "none"}
                      stroke={inWishlist ? "#EF4444" : "currentColor"}
                      className={inWishlist ? "text-red-500" : "text-gray-700"}
                    />
                  )}
                </button>
              </div>

              {/* Delivery Section */}
              <div className="border-t border-b border-gray-200 py-4 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Express Shipping</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Cash on Delivery Available</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>Easy 7 Days Return Policy</span>
                  </div>
                </div>
              </div>

              {/* Collapsible Sections */}
              <div className="space-y-1">
                {/* Description */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => toggleSection("description")}
                    className="w-full py-4 flex items-center justify-between text-left"
                  >
                    <span className="font-medium text-sm uppercase tracking-wide">Description</span>
                    <ChevronRight
                      className={`transition-transform ${
                        expandedSections.includes("description") ? "rotate-90" : ""
                      }`}
                      size={16}
                    />
                  </button>
                  {expandedSections.includes("description") && (
                    <div className="pb-4">
                      <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
                    </div>
                  )}
                </div>

                {/* Size & Fit */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => toggleSection("size")}
                    className="w-full py-4 flex items-center justify-between text-left"
                  >
                    <span className="font-medium text-sm uppercase tracking-wide">Size & Fit</span>
                    <ChevronRight
                      className={`transition-transform ${
                        expandedSections.includes("size") ? "rotate-90" : ""
                      }`}
                      size={16}
                    />
                  </button>
                  {expandedSections.includes("size") && (
                    <div className="pb-4">
                      <p className="text-sm text-gray-600">{product.fit || "Standard fit"}</p>
                    </div>
                  )}
                </div>

                {/* Material */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => toggleSection("material")}
                    className="w-full py-4 flex items-center justify-between text-left"
                  >
                    <span className="font-medium text-sm uppercase tracking-wide">Material</span>
                    <ChevronRight
                      className={`transition-transform ${
                        expandedSections.includes("material") ? "rotate-90" : ""
                      }`}
                      size={16}
                    />
                  </button>
                  {expandedSections.includes("material") && (
                    <div className="pb-4">
                      <p className="text-sm text-gray-600">{product.material || "Premium quality fabric"}</p>
                    </div>
                  )}
                </div>

                {/* Specifications */}
                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <div className="border-b border-gray-200">
                    <button
                      onClick={() => toggleSection("specs")}
                      className="w-full py-4 flex items-center justify-between text-left"
                    >
                      <span className="font-medium text-sm uppercase tracking-wide">Specifications</span>
                      <ChevronRight
                        className={`transition-transform ${
                          expandedSections.includes("specs") ? "rotate-90" : ""
                        }`}
                        size={16}
                      />
                    </button>
                    {expandedSections.includes("specs") && (
                      <div className="pb-4">
                        <dl className="space-y-2">
                          {Object.entries(product.specifications).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm">
                              <dt className="text-gray-600 capitalize">{key}:</dt>
                              <dd className="text-gray-900">{String(value)}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X size={32} />
          </button>

          <div className="relative max-w-4xl w-full">
            <img
              src={allImages[selectedImageIndex] || placeholderImage}
              alt={product.productName}
              className="w-full h-auto max-h-[90vh] object-contain"
            />

            {allImages.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setSelectedImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight size={24} className="rotate-180" />
                </button>
                <button
                  onClick={() =>
                    setSelectedImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}