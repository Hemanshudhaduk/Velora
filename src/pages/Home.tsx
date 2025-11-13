import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-image.jpg";
import categoryWomen from "@/assets/category-women.jpg";
import categoryMen from "@/assets/category-men.jpg";
import categoryOuterwear from "@/assets/category-outerwear.jpg";
import sustainabilityImage from "@/assets/sustainability-image.jpg";
import { products } from "@/data/products";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Home = () => {
  const categories = [
    { id: 1, name: "Womenswear", img: categoryWomen, link: "/women" },
    { id: 2, name: "Menswear", img: categoryMen, link: "/men" },
    { id: 3, name: "Outerwear", img: categoryOuterwear, link: "/women" },
    { id: 4, name: "Ethnic Wear", img: categoryOuterwear, link: "/women" },
  ];

  const newArrivals = products.slice(0, 8);
  const gifUrl = "https://assets.vogue.com/photos/65ca3f98b3fbcf4bbe874018/master/w_960,c_limit/Designer_collage_final.gif";


  // Refs for horizontal scroll containers
  const catScrollRef = useRef(null);
  const catWrapRef = useRef(null); // container to measure width
  const arrivalScrollRef = useRef(null);

  // measurement & visibility state
  const [visibleCount, setVisibleCount] = useState(0); // how many items can fit
  const [itemWidth, setItemWidth] = useState(300); // item width used in layout (px)
  const [showCatArrows, setShowCatArrows] = useState(false);

  // Scroll helpers use dynamic distance (visible area width or itemWidth * visibleCount)
  const scrollLeft = (ref, distance) =>
    ref.current?.scrollBy({ left: -distance, behavior: "smooth" });
  const scrollRight = (ref, distance) =>
    ref.current?.scrollBy({ left: distance, behavior: "smooth" });

  // Measure container and compute visible count.
  useEffect(() => {
    if (!catWrapRef.current) return;

    let raf = null;
    let resizeTimeout = null;

    const measure = () => {
      const wrap = catWrapRef.current;
      if (!wrap) return;

      const containerWidth = wrap.clientWidth;
      // Use the CSS widths you set for items (w-[250px] sm:w-[300px]). We'll pick a baseline:
      // on small screens items are 250, on sm+ 300. We'll compute effective item width from first child if available.
      const firstItem = wrap.querySelector("[data-cat-item]");
      let effectiveItemWidth = itemWidth;
      if (firstItem) {
        // getComputedStyle + bounding rect to measure including gap (approx)
        const style = getComputedStyle(firstItem);
        const rect = firstItem.getBoundingClientRect();
        effectiveItemWidth = Math.round(rect.width);
      }

      // compute how many items fit fully in container
      const count = Math.max(
        1,
        Math.floor(containerWidth / effectiveItemWidth)
      );

      // Update state (debounced a little to avoid jitter)
      setItemWidth(effectiveItemWidth);
      setVisibleCount(count);

      // Show arrows only on desktop widths (md+). We'll use matchMedia for md breakpoint (768px).
      const isMdUp = window.matchMedia("(min-width: 768px)").matches;
      setShowCatArrows(isMdUp && categories.length > count);
    };

    // initial measure after next frame
    raf = requestAnimationFrame(measure);

    // resize observer for dynamic responsiveness
    const ro = new ResizeObserver(() => {
      // debounce small flurry of events: wait 120ms after last change
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(measure);
      }, 120);
    });

    ro.observe(catWrapRef.current);

    // also measure on orientation change or window resize (fallback)
    const onResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(measure);
      }, 120);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    // cleanup
    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (resizeTimeout) clearTimeout(resizeTimeout);
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catWrapRef.current, categories.length]);

  // distance to scroll: either visible area (wrap width) or itemWidth * visibleCount (safer)
  const getCatScrollDistance = () => {
    const wrap = catWrapRef.current;
    if (!wrap) return itemWidth * Math.max(1, visibleCount || 1);
    const wrapW = wrap.clientWidth;
    // prefer moving exactly one "page" (visible items) so user sees new set
    const pageDistance = itemWidth * Math.max(1, visibleCount || 1);
    // but if pageDistance > wrapW, use wrapW (avoid overshoot)
    return Math.min(pageDistance, wrapW);
  };

  const HERO_IMAGES = [
    "./public/imags/Main_image_1.jpg",
    "./public/imags/Main_image_2.jpg",
    "./public/imags/Main_image_3.jpg",
    "./public/imags/Main_image_4.jpg",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* ---------------- HERO SECTION ---------------- */}
      <section className="relative bg-white py-20 px-6 lg:px-16 overflow-hidden">
        {/* Large decorative flower outline in background */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.03]">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle
              cx="100"
              cy="100"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-gray-400"
            />
            <circle
              cx="100"
              cy="40"
              r="25"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-gray-400"
            />
            <circle
              cx="160"
              cy="100"
              r="25"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-gray-400"
            />
            <circle
              cx="100"
              cy="160"
              r="25"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-gray-400"
            />
            <circle
              cx="40"
              cy="100"
              r="25"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-gray-400"
            />
            <circle
              cx="130"
              cy="60"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-gray-400"
            />
            <circle
              cx="140"
              cy="140"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-gray-400"
            />
            <circle
              cx="60"
              cy="140"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-gray-400"
            />
            <circle
              cx="60"
              cy="60"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-gray-400"
            />
          </svg>
        </div>

        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="flex flex-col gap-8 z-10">
              <h1 className="text-6xl lg:text-7xl font-normal text-gray-900 leading-tight tracking-tight">
                Hems boutique in
                <br />
                one place
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                Welcome to DH BOUTIQUE, your online hub for trendy and timeless
                clothing collections
              </p>

              <div>
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-10 py-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-base">
                  Shop Now
                </button>
              </div>
            </div>

            {/* Right Images Grid */}
            <div className="grid grid-cols-2 gap-4 z-10">
              {/* Top Left Image */}
              <div className="relative overflow-hidden rounded-3xl shadow-xl">
                <img
                  src={HERO_IMAGES[0]}
                  alt="Fashion collection 1"
                  className="w-full h-[300px] object-cover"
                />
              </div>

              {/* Top Right Image */}
              <div className="relative overflow-hidden rounded-3xl shadow-xl">
                <img
                  src={HERO_IMAGES[1]}
                  alt="Fashion collection 2"
                  className="w-full h-[300px] object-cover"
                />
              </div>

              {/* Bottom Left Image */}
              <div className="relative overflow-hidden rounded-3xl shadow-xl">
                <img
                  src={HERO_IMAGES[2]}
                  alt="Fashion collection 3"
                  className="w-full h-[300px] object-cover"
                />
              </div>

              {/* Bottom Right Image */}
              <div className="relative overflow-hidden rounded-3xl shadow-xl">
                <img
                  src={HERO_IMAGES[3]}
                  alt="Fashion collection 4"
                  className="w-full h-[300px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- CATEGORY SECTION ---------------- */}
      <section className="container mx-auto px-6 py-16 md:py-24 relative">
        <h2 className="text-3xl md:text-4xl font-light text-center mb-12">
          Shop by Category
        </h2>

        {/* Arrow buttons - render only when showCatArrows === true */}
        {showCatArrows && (
          <div className="absolute inset-y-0 flex items-center justify-between px-2 pointer-events-none">
            <button
              onClick={() => scrollLeft(catScrollRef, getCatScrollDistance())}
              className="hidden md:flex pointer-events-auto bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow"
              aria-label="Scroll categories left"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              onClick={() => scrollRight(catScrollRef, getCatScrollDistance())}
              className="hidden md:flex pointer-events-auto bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow"
              aria-label="Scroll categories right"
            >
              <ChevronRight size={28} />
            </button>
          </div>
        )}

        {/* Scroll container (desktop + mobile) */}
        {/* catWrapRef measures the visible area */}
        <div ref={catWrapRef} className="w-full">
          <div
            ref={catScrollRef}
            className="flex gap-6 overflow-x-auto scroll-smooth pb-4 no-scrollbar"
          >
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={cat.link}
                className="flex-shrink-0 w-[250px] sm:w-[300px] group"
                data-cat-item
              >
                <div className="aspect-[5/6] overflow-hidden rounded-xl border border-border shadow-sm transition-transform duration-500 group-hover:scale-105 group-hover:border-primary">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-lg md:text-xl font-medium text-center mt-4 group-hover:text-primary transition">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- NEW ARRIVALS SECTION ---------------- */}
      <section className="bg-muted/30 py-16 md:py-24 relative">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-light text-center mb-12">
            New Arrivals
          </h2>

          {/* Arrow buttons for arrivals: show when items overflow visible width on md+ */}
          <ArrivalsWithConditionalArrows
            items={newArrivals}
            arrivalScrollRef={arrivalScrollRef}
            ItemComponent={({ product }) => (
              <div className="flex-shrink-0 w-[250px] sm:w-[300px]">
                <ProductCard
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.colors[0].images[0]}
                  category={product.category}
                />
              </div>
            )}
          />

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" asChild>
              <Link to="/women">View All</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ---------------- BRAND MISSION SECTION ---------------- */}
      <section id="mission" className="container mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl md:text-4xl font-light mb-6">
              Our Promise of Elegance & Empowerment
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              At <span className="font-semibold text-pink-600">Velora</span>, we
              believe every woman deserves to feel confident, comfortable, and
              effortlessly beautiful.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              From flowy dresses to elegant ethnic wear, our fabrics are chosen
              for comfort, style, and sustainability.
            </p>
            <button className="border-2 border-gray-900 text-gray-900 px-8 py-3 rounded-md hover:bg-gray-900 hover:text-white transition-all duration-300 font-medium text-base">
              Explore Our Collection
            </button>
          </div>

          <div className="order-1 md:order-2">
            <div className="aspect-[4/3] overflow-hidden rounded-lg shadow-md">
              <img
                src={gifUrl}
                alt="Velora Women's Fashion"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;

/**
 * Helper component for New Arrivals section that conditionally shows arrows
 * based on measured visible count (same logic as categories for consistency).
 *
 * Keeps Home file tidy. You can move this into its own file if desired.
 */
function ArrivalsWithConditionalArrows({
  items = [],
  arrivalScrollRef,
  ItemComponent,
}) {
  const wrapRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [itemW, setItemW] = useState(300);
  const [showArrows, setShowArrows] = useState(false);

  useEffect(() => {
    if (!wrapRef.current) return;

    let resizeTimeout = null;
    const measure = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const containerWidth = wrap.clientWidth;
      const firstItem = wrap.querySelector("[data-arrival-item]");
      let effectiveItemWidth = itemW;
      if (firstItem) {
        const rect = firstItem.getBoundingClientRect();
        effectiveItemWidth = Math.round(rect.width);
      }
      const count = Math.max(
        1,
        Math.floor(containerWidth / effectiveItemWidth)
      );
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

    // initial measure
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
        <div className="absolute inset-y-0 flex items-center justify-between px-2 pointer-events-none">
          <button
            onClick={() =>
              arrivalScrollRef.current?.scrollBy({
                left: -getScrollDistance(),
                behavior: "smooth",
              })
            }
            className="hidden md:flex pointer-events-auto bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow"
            aria-label="Scroll arrivals left"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={() =>
              arrivalScrollRef.current?.scrollBy({
                left: getScrollDistance(),
                behavior: "smooth",
              })
            }
            className="hidden md:flex pointer-events-auto bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow"
            aria-label="Scroll arrivals right"
          >
            <ChevronRight size={28} />
          </button>
        </div>
      )}

      <div ref={wrapRef} className="w-full">
        <div
          ref={arrivalScrollRef}
          className="flex gap-6 overflow-x-auto scroll-smooth pb-4 no-scrollbar"
        >
          {items.map((product) => (
            <div key={product.id} data-arrival-item>
              <ItemComponent product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
