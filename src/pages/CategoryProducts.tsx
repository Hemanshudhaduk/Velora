// src/pages/CategoryProducts.tsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronDown, ChevronRight, Home, X, Filter } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const API_BASE =
  (import.meta && (import.meta as any).env?.VITE_API_BASE_URL) ||
  (process.env.REACT_APP_API_BASE_URL as string) ||
  "https://clothing-store-server.vercel.app";

interface ProductNormalized {
  id: string;
  productName: string;
  mainImages: string[];
  originalPrice: number;
  finalPrice: number;
  discountPercentage: number;
  sizes: string[];
  isFeatured: boolean;
}

interface FilterState {
  sizes: string[];
  minPrice: string;
  maxPrice: string;
}

export default function CategoryProducts() {
  const { categoryId, slug } = useParams<{
    categoryId?: string;
    slug?: string;
  }>();

  const [products, setProducts] = useState<ProductNormalized[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryInfo, setCategoryInfo] = useState<any>(null);

  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState<string[]>([
    "size",
    "price",
  ]);

  // Separate input state (what user types) from applied filters (what's sent to API)
  const [filterInputs, setFilterInputs] = useState({
    minPrice: "",
    maxPrice: "",
  });

  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    sizes: [],
    minPrice: "",
    maxPrice: "",
  });

  const placeholderImage = "https://via.placeholder.com/600x800?text=No+Image";

  // Fetch category info
  useEffect(() => {
    if (!categoryId) {
      setCategoryInfo(null);
      return;
    }
    const fetchCategory = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/category/${encodeURIComponent(categoryId)}`
        );
        const json = await res.json().catch(() => ({}));
        if (json && json.success && json.data && json.data.category) {
          setCategoryInfo(json.data.category);
        }
      } catch (err) {
        console.error("Error fetching category info:", err);
      }
    };
    fetchCategory();
  }, [categoryId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categoryId]);

  const normalizeProducts = (raw: any[]): ProductNormalized[] => {
    return (raw || []).map((p: any) => {
      const imagesFrom =
        p.mainImages ||
        p.main_images ||
        (p.mainImage ? [p.mainImage] : []) ||
        (p.main_image ? [p.main_image] : []) ||
        (Array.isArray(p.images) ? p.images : []) ||
        [];

      const makeNumber = (v: any) => {
        if (v == null || v === "") return 0;
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
      };

      return {
        id: p.id ?? String(p.productId ?? ""),
        productName: p.productName ?? p.product_name ?? p.name ?? "Product",
        mainImages: Array.isArray(imagesFrom)
          ? imagesFrom
          : [imagesFrom].filter(Boolean),
        originalPrice: makeNumber(p.originalPrice ?? p.original_price ?? 0),
        finalPrice: makeNumber(p.finalPrice ?? p.final_price ?? 0),
        discountPercentage: makeNumber(
          p.discountPercentage ?? p.discount_percentage ?? 0
        ),
        sizes: Array.isArray(p.sizes) ? p.sizes : [],
        isFeatured: Boolean(p.isFeatured ?? p.is_featured),
      };
    });
  };

  // Fetch products (only when appliedFilters change, not on every keystroke)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        if (!categoryId) {
          setProducts([]);
          setTotalPages(1);
          setTotalProducts(0);
          setLoading(false);
          return;
        }

        const params = new URLSearchParams({
          page: String(currentPage || 1),
          limit: "20",
          sortBy,
        });

        if (appliedFilters.minPrice)
          params.append("minPrice", appliedFilters.minPrice);
        if (appliedFilters.maxPrice)
          params.append("maxPrice", appliedFilters.maxPrice);

        const url = `${API_BASE}/api/product/category/${encodeURIComponent(
          categoryId
        )}?${params.toString()}`;
        const res = await fetch(url);
        const json = await res.json().catch(() => ({}));

        if (json && json.success && json.data) {
          const raw = json.data.products || [];
          const normalized = normalizeProducts(raw);
          setProducts(normalized);

          const pagination = json.data.pagination || {};
          setTotalPages(Number(pagination.totalPages ?? 1));
          setTotalProducts(Number(pagination.totalProducts ?? raw.length ?? 0));
        } else {
          setProducts([]);
          setTotalPages(1);
          setTotalProducts(0);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    categoryId,
    sortBy,
    currentPage,
    appliedFilters.minPrice,
    appliedFilters.maxPrice,
  ]);

  const toggleFilter = (section: string) => {
    setExpandedFilters((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const handleSizeToggle = (size: string) => {
    setAppliedFilters((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  // Apply price filters when user clicks "Apply" button or presses Enter
  const applyPriceFilters = () => {
    setAppliedFilters((prev) => ({
      ...prev,
      minPrice: filterInputs.minPrice,
      maxPrice: filterInputs.maxPrice,
    }));
    setCurrentPage(1); // Reset to first page
  };

  const clearAllFilters = () => {
    setFilterInputs({ minPrice: "", maxPrice: "" });
    setAppliedFilters({ sizes: [], minPrice: "", maxPrice: "" });
    setCurrentPage(1);
  };

  const FilterSection = () => (
    <div className="space-y-4">
      {/* Size Filter */}
      <div className="border-b pb-4">
        <button
          onClick={() => toggleFilter("size")}
          className="flex items-center justify-between w-full text-left font-medium text-sm uppercase tracking-wide"
        >
          SIZE
          <ChevronDown
            className={`transition-transform ${
              expandedFilters.includes("size") ? "rotate-180" : ""
            }`}
            size={16}
          />
        </button>
        {expandedFilters.includes("size") && (
          <div className="mt-3 space-y-2">
            {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
              <label
                key={size}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={appliedFilters.sizes.includes(size)}
                  onChange={() => handleSizeToggle(size)}
                  className="w-4 h-4"
                />
                <span className="text-sm">{size}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Filter */}
      <div className="border-b pb-4">
        <button
          onClick={() => toggleFilter("price")}
          className="flex items-center justify-between w-full text-left font-medium text-sm uppercase tracking-wide"
        >
          PRICE
          <ChevronDown
            className={`transition-transform ${
              expandedFilters.includes("price") ? "rotate-180" : ""
            }`}
            size={16}
          />
        </button>
        {expandedFilters.includes("price") && (
          <div className="mt-3 space-y-3">
            <div>
              <label className="text-xs text-gray-600 block mb-1">
                Min Price
              </label>
              <input
                type="number"
                placeholder="₹0"
                min="0"
                value={filterInputs.minPrice}
                onChange={(e) =>
                  setFilterInputs({ ...filterInputs, minPrice: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyPriceFilters();
                  }
                }}
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">
                Max Price
              </label>
              <input
                type="number"
                placeholder="₹10000"
                min="0"
                value={filterInputs.maxPrice}
                onChange={(e) =>
                  setFilterInputs({ ...filterInputs, maxPrice: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyPriceFilters();
                  }
                }}
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              />
            </div>
            <button
              onClick={applyPriceFilters}
              disabled={!filterInputs.minPrice && !filterInputs.maxPrice}
              className="w-full bg-gray-900 text-white py-2 rounded-md hover:bg-gray-800 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Price Filter
            </button>
          </div>
        )}
      </div>

      {/* Clear Filters */}
      {(appliedFilters.sizes.length > 0 ||
        appliedFilters.minPrice ||
        appliedFilters.maxPrice) && (
        <button
          onClick={clearAllFilters}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

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
          <span className="text-gray-900 capitalize">
            {categoryInfo?.categoryName ?? slug ?? "Category"}
          </span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <Filter size={20} /> FILTER
                </h2>
              </div>
              <FilterSection />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Category Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-light mb-3 capitalize">
                {categoryInfo?.categoryName ?? slug ?? "Category"}
              </h1>
              {categoryInfo?.description && (
                <p className="text-gray-600 leading-relaxed mb-4">
                  {categoryInfo.description}
                </p>
              )}
              <p className="text-sm text-gray-500">
                {totalProducts} {totalProducts === 1 ? "product" : "products"}
              </p>
            </div>

            {/* Mobile Filter Button & Sort */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 border px-4 py-2 rounded-md hover:bg-gray-50"
              >
                <Filter size={18} /> Filter
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 hidden sm:inline">
                  Sort by:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  <option value="newest">Newest</option>
                  <option value="popular">Popular</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">
                  No products found in this category.
                </p>
                <Link
                  to="/"
                  className="text-amber-600 hover:text-amber-700 mt-4 inline-block"
                >
                  ← Back to Home
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {products.map((product) => {
                    const imageSrc =
                      product.mainImages && product.mainImages[0]
                        ? product.mainImages[0]
                        : placeholderImage;
                    return (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        className="group flex flex-col"
                      >
                        {/* Product Image */}
                        <div className="relative overflow-hidden rounded-lg border border-gray-200 mb-3 aspect-[3/4]">
                          {product.isFeatured && (
                            <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded z-10">
                              NEW
                            </span>
                          )}
                          <img
                            src={imageSrc}
                            alt={product.productName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex flex-col flex-1">
                          <h3 className="text-sm font-medium mb-2 line-clamp-2 min-h-[2.5rem]">
                            {product.productName}
                          </h3>

                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-base md:text-lg font-semibold">
                              ₹{product.finalPrice.toLocaleString()}
                            </span>
                            {product.discountPercentage > 0 && (
                              <>
                                <span className="text-xs md:text-sm text-gray-400 line-through">
                                  ₹{product.originalPrice.toLocaleString()}
                                </span>
                                <span className="text-xs text-green-600 font-medium">
                                  {product.discountPercentage}% off
                                </span>
                              </>
                            )}
                          </div>

                          {/* {product.sizes && product.sizes.length > 0 && (
                            <p className="text-xs text-gray-500 mt-auto">
                              {product.sizes.slice(0, 4).join(" · ")}
                              {product.sizes.length > 4 && " ..."}
                            </p>
                          )} */}
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    <button
                      onClick={() => {
                        setCurrentPage((p) => Math.max(1, p - 1));
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600 px-4">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => {
                        setCurrentPage((p) => Math.min(totalPages, p + 1));
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="font-semibold text-lg">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              <FilterSection />
            </div>
            <div className="p-4 border-t sticky bottom-0 bg-white">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-md transition-colors"
              >
                View Products
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
