// src/pages/Home.tsx
import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChevronLeft, ChevronRight } from "lucide-react";

const API_BASE =
  (import.meta && (import.meta as any).env?.VITE_API_BASE_URL) ||
  (process.env.REACT_APP_API_BASE_URL as string) ||
  "https://clothing-store-server.vercel.app";

const placeholderImage = "https://via.placeholder.com/600x800?text=No+Image";

const Home: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // New arrivals: start with static data (first-time / offline)
  const staticNewArrivals = [
    {
      id: "stat-1",
      productName: "Elegant Silk Saree",
      mainImage: placeholderImage,
      originalPrice: 4999,
      finalPrice: 3499,
      discountPercentage: 30,
      isFeatured: true,
    },
    {
      id: "stat-2",
      productName: "Floral Georgette Saree",
      mainImage: placeholderImage,
      originalPrice: 3999,
      finalPrice: 2799,
      discountPercentage: 30,
      isFeatured: false,
    },
    {
      id: "stat-3",
      productName: "Banarasi Silk Saree",
      mainImage: placeholderImage,
      originalPrice: 8999,
      finalPrice: 7199,
      discountPercentage: 20,
      isFeatured: true,
    },
    {
      id: "stat-4",
      productName: "Chiffon Party Saree",
      mainImage: placeholderImage,
      originalPrice: 2999,
      finalPrice: 2199,
      discountPercentage: 26,
      isFeatured: false,
    },
    {
      id: "stat-5",
      productName: "Kanjivaram Blend",
      mainImage: placeholderImage,
      originalPrice: 12999,
      finalPrice: 9999,
      discountPercentage: 23,
      isFeatured: true,
    },
    {
      id: "stat-6",
      productName: "Casual Cotton Saree",
      mainImage: placeholderImage,
      originalPrice: 1999,
      finalPrice: 1499,
      discountPercentage: 25,
      isFeatured: false,
    },
    {
      id: "stat-7",
      productName: "Designer Sequence Saree",
      mainImage: placeholderImage,
      originalPrice: 6999,
      finalPrice: 5599,
      discountPercentage: 20,
      isFeatured: true,
    },
    {
      id: "stat-8",
      productName: "Handloom Pure Cotton",
      mainImage: placeholderImage,
      originalPrice: 2599,
      finalPrice: 1999,
      discountPercentage: 23,
      isFeatured: false,
    },
  ];

  const [newArrivals, setNewArrivals] = useState<any[]>(staticNewArrivals);
  const [arrivalsLoading, setArrivalsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/category/list?active=true`);
        const json = await res.json().catch(() => ({}));
        if (json && json.success && json.data && Array.isArray(json.data.categories)) {
          const formatted = json.data.categories.map((cat: any) => {
            const slug = (cat.categoryName || cat.category_name || "category")
              .toString()
              .toLowerCase()
              .replace(/\s+/g, "-");
            return {
              id: cat.id,
              name: cat.categoryName ?? cat.category_name ?? "Category",
              img: cat.mainImage ?? cat.main_image ?? placeholderImage,
              link: `${slug}/${cat.id}`,
              description: cat.description ?? "",
            };
          });
          setCategories(formatted);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Try fetch featured from API - if it returns valid products override static
  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/product/featured?limit=8`);
        const json = await res.json().catch(() => ({}));
        if (json && json.success && json.data && Array.isArray(json.data.products) && json.data.products.length > 0) {
          // normalize minimal shape used by Home
          const normalized = json.data.products.map((p: any) => ({
            id: p.id ?? p._id ?? "p-" + Math.random().toString(36).slice(2, 9),
            productName: p.productName ?? p.product_name ?? p.name ?? "Product",
            mainImage: p.mainImage ?? p.main_image ?? (Array.isArray(p.images) && p.images[0]) ?? placeholderImage,
            originalPrice: Number(p.originalPrice ?? p.original_price ?? p.mrp ?? 0),
            finalPrice: Number(p.finalPrice ?? p.final_price ?? p.price ?? 0),
            discountPercentage: Number(p.discountPercentage ?? p.discount_percentage ?? 0),
            isFeatured: Boolean(p.isFeatured ?? p.is_featured),
          }));
          setNewArrivals(normalized);
        } else {
          // keep static
          setNewArrivals(staticNewArrivals);
        }
      } catch (err) {
        console.error("Error fetching featured:", err);
        setNewArrivals(staticNewArrivals);
      } finally {
        setArrivalsLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  // Refs & measurement (same approach as your original file)
  const catScrollRef = useRef<HTMLDivElement | null>(null);
  const catWrapRef = useRef<HTMLDivElement | null>(null);
  const arrivalScrollRef = useRef<HTMLDivElement | null>(null);

  const [visibleCount, setVisibleCount] = useState(0);
  const [itemWidth, setItemWidth] = useState(300);
  const [showCatArrows, setShowCatArrows] = useState(false);

  const scrollLeft = (ref: any, distance: number) => ref.current?.scrollBy({ left: -distance, behavior: "smooth" });
  const scrollRight = (ref: any, distance: number) => ref.current?.scrollBy({ left: distance, behavior: "smooth" });

  useEffect(() => {
    if (!catWrapRef.current) return;
    let raf: number | null = null;
    let resizeTimeout: any = null;

    const measure = () => {
      const wrap = catWrapRef.current;
      if (!wrap) return;
      const containerWidth = wrap.clientWidth;
      const firstItem = wrap.querySelector("[data-cat-item]");
      let effectiveItemWidth = itemWidth;
      if (firstItem) {
        const rect = (firstItem as HTMLElement).getBoundingClientRect();
        effectiveItemWidth = Math.round(rect.width);
      }
      const count = Math.max(1, Math.floor(containerWidth / effectiveItemWidth));
      setItemWidth(effectiveItemWidth);
      setVisibleCount(count);
      const isMdUp = window.matchMedia("(min-width: 768px)").matches;
      setShowCatArrows(isMdUp && categories.length > count);
    };

    raf = requestAnimationFrame(measure);

    const ro = new ResizeObserver(() => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(measure);
      }, 120);
    });

    ro.observe(catWrapRef.current);

    const onResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(measure);
      }, 120);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (resizeTimeout) clearTimeout(resizeTimeout);
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catWrapRef.current, categories.length]);

  const getCatScrollDistance = () => {
    const wrap = catWrapRef.current;
    if (!wrap) return itemWidth * Math.max(1, visibleCount || 1);
    const wrapW = wrap.clientWidth;
    const pageDistance = itemWidth * Math.max(1, visibleCount || 1);
    return Math.min(pageDistance, wrapW);
  };

  const HERO_IMAGES = [
    "./imags/Main_image_1.jpg",
    "./imags/Main_image_2.jpg",
    "./imags/Main_image_3.jpg",
    "./imags/Main_image_4.jpg",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* HERO */}
      <section className="relative bg-white py-20 px-6 lg:px-16 overflow-hidden">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.03]">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-400" />
            <circle cx="100" cy="40" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-400" />
            <circle cx="160" cy="100" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-400" />
            <circle cx="100" cy="160" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-400" />
            <circle cx="40" cy="100" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-400" />
          </svg>
        </div>

        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-8 z-10">
              <h1 className="text-6xl lg:text-7xl font-normal text-gray-900 leading-tight tracking-tight">
                Hems boutique in
                <br />
                one place
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                Welcome to DH BOUTIQUE, your online hub for trendy and timeless clothing collections
              </p>
              <div>
                <Link to={categories[0]?.link || "/"}>
                  <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-10 py-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-base">
                    Shop Now
                  </button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 z-10">
              {HERO_IMAGES.map((img, idx) => (
                <div key={idx} className="relative overflow-hidden rounded-3xl shadow-xl">
                  <img src={img} alt={`Fashion collection ${idx + 1}`} className="w-full h-[300px] object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY */}
      <section className="container mx-auto px-6 py-16 md:py-24 relative">
        <h2 className="text-3xl md:text-4xl font-light text-center mb-12">Shop by Category</h2>

        {categoriesLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No categories available at the moment.</p>
          </div>
        ) : (
          <>
            {showCatArrows && (
              <div className="absolute inset-y-0 flex items-center justify-between px-2 pointer-events-none z-10">
                <button onClick={() => scrollLeft(catScrollRef, getCatScrollDistance())} className="hidden md:flex pointer-events-auto bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow" aria-label="Scroll categories left">
                  <ChevronLeft size={28} />
                </button>
                <button onClick={() => scrollRight(catScrollRef, getCatScrollDistance())} className="hidden md:flex pointer-events-auto bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow" aria-label="Scroll categories right">
                  <ChevronRight size={28} />
                </button>
              </div>
            )}

            <div ref={catWrapRef} className="w-full">
              <div ref={catScrollRef} className="flex gap-6 overflow-x-auto scroll-smooth pb-4 no-scrollbar">
                {categories.map((cat) => (
                  <Link key={cat.id} to={cat.link} className="flex-shrink-0 w-[250px] sm:w-[300px] group" data-cat-item>
                    <div className="aspect-[5/6] overflow-hidden rounded-xl border border-border shadow-sm transition-transform duration-500 group-hover:scale-105 group-hover:border-primary">
                      <img src={cat.img || placeholderImage} alt={cat.name} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <h3 className="text-lg md:text-xl font-medium text-center mt-4 group-hover:text-primary transition">{cat.name}</h3>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      {/* NEW ARRIVALS */}
      <section className="bg-muted/30 py-16 md:py-24 relative">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-light text-center mb-12">New Arrivals</h2>

          {arrivalsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
            </div>
          ) : newArrivals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No new arrivals at the moment.</p>
            </div>
          ) : (
            <ArrivalsWithConditionalArrows items={newArrivals} arrivalScrollRef={arrivalScrollRef} />
          )}

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" asChild>
              <Link to={categories[0]?.link || "/"}>View All</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* BRAND MISSION */}
      <section id="mission" className="container mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl md:text-4xl font-light mb-6">Our Promise of Elegance & Empowerment</h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">At <span className="font-semibold text-pink-600">Velora</span>, we believe every woman deserves to feel confident, comfortable, and effortlessly beautiful.</p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">From flowy dresses to elegant ethnic wear, our fabrics are chosen for comfort, style, and sustainability.</p>
            <Link to={categories[0]?.link || "/"}>
              <button className="border-2 border-gray-900 text-gray-900 px-8 py-3 rounded-md hover:bg-gray-900 hover:text-white transition-all duration-300 font-medium text-base">Explore Our Collection</button>
            </Link>
          </div>

          <div className="order-1 md:order-2">
            <div className="aspect-[4/3] overflow-hidden rounded-lg shadow-md">
              <img src="https://assets.vogue.com/photos/65ca3f98b3fbcf4bbe874018/master/w_960,c_limit/Designer_collage_final.gif" alt="Velora Women's Fashion" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;

/* Arrivals helper component (kept similar to original) */
function ArrivalsWithConditionalArrows({ items = [], arrivalScrollRef }: any) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [itemW, setItemW] = useState(300);
  const [showArrows, setShowArrows] = useState(false);
  const placeholderImageLocal = "https://via.placeholder.com/600x800?text=No+Image";

  useEffect(() => {
    if (!wrapRef.current) return;
    let resizeTimeout: any = null;
    const measure = () => {
      const wrap = wrapRef.current!;
      const containerWidth = wrap.clientWidth;
      const firstItem = wrap.querySelector("[data-arrival-item]");
      let effectiveItemWidth = itemW;
      if (firstItem) effectiveItemWidth = Math.round((firstItem as HTMLElement).getBoundingClientRect().width);
      const count = Math.max(1, Math.floor(containerWidth / effectiveItemWidth));
      setItemW(effectiveItemWidth);
      setVisibleCount(count);
      const isMdUp = window.matchMedia("(min-width: 768px)").matches;
      setShowArrows(isMdUp && items.length > count);
    };

    const ro = new ResizeObserver(() => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(measure, 120);
    });
    ro.observe(wrapRef.current);
    measure();
    window.addEventListener("resize", measure);

    return () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wrapRef.current, items.length]);

  const getScrollDistance = () => {
    const wrap = wrapRef.current;
    if (!wrap) return itemW * Math.max(1, visibleCount || 1);
    const wrapW = wrap.clientWidth;
    const pageDistance = itemW * Math.max(1, visibleCount || 1);
    return Math.min(pageDistance, wrapW);
  };

  return (
    <div className="relative">
      {showArrows && (
        <div className="absolute inset-y-0 flex items-center justify-between px-2 pointer-events-none z-10">
          <button onClick={() => arrivalScrollRef.current?.scrollBy({ left: -getScrollDistance(), behavior: "smooth" })} className="hidden md:flex pointer-events-auto bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow" aria-label="Scroll arrivals left">
            <ChevronLeft size={28} />
          </button>
          <button onClick={() => arrivalScrollRef.current?.scrollBy({ left: getScrollDistance(), behavior: "smooth" })} className="hidden md:flex pointer-events-auto bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow" aria-label="Scroll arrivals right">
            <ChevronRight size={28} />
          </button>
        </div>
      )}

      <div ref={wrapRef} className="w-full">
        <div ref={arrivalScrollRef} className="flex gap-6 overflow-x-auto scroll-smooth pb-4 no-scrollbar">
          {items.map((product: any) => (
            <Link key={product.id} to={`/product/${product.id}`} className="flex-shrink-0 w-[250px] sm:w-[300px] group" data-arrival-item>
              <div className="relative overflow-hidden rounded-lg border border-gray-200 mb-3 aspect-[3/4]">
                {product.isFeatured && <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded z-10">NEW</span>}
                <img src={product.mainImage || product.mainImageUrl || placeholderImageLocal} alt={product.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
              </div>
              <h3 className="text-sm font-medium mb-1 line-clamp-2">{product.productName}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-semibold">₹{Number(product.finalPrice || product.final_price || 0).toLocaleString()}</span>
                {Number(product.discountPercentage || product.discount_percentage || 0) > 0 && (
                  <>
                    <span className="text-sm text-gray-400 line-through">₹{Number(product.originalPrice || product.original_price || 0).toLocaleString()}</span>
                    <span className="text-xs text-green-600 font-medium">{Number(product.discountPercentage || product.discount_percentage || 0)}% off</span>
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
