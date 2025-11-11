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

const Home = () => {
  const newArrivals = products.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <img
          src={heroImage}
          alt="Kohan Collection"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/10" />
        <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-light tracking-wide text-white mb-6">
            Consciously Crafted.<br />Timelessly Designed.
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 font-light">
            Sustainable fashion for modern living
          </p>
          <Button variant="hero" asChild>
            <Link to="/women">Shop New Arrivals</Link>
          </Button>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="container mx-auto px-6 py-24">
        <h2 className="text-3xl md:text-4xl font-light text-center mb-12">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link to="/women" className="group">
            <div className="aspect-[3/4] overflow-hidden rounded-lg mb-4">
              <img
                src={categoryWomen}
                alt="Womenswear"
                className="w-full h-full object-cover transition-smooth group-hover:scale-105"
              />
            </div>
            <h3 className="text-xl font-medium text-center group-hover:text-primary transition-smooth">
              Womenswear
            </h3>
          </Link>
          
          <Link to="/men" className="group">
            <div className="aspect-[3/4] overflow-hidden rounded-lg mb-4">
              <img
                src={categoryMen}
                alt="Menswear"
                className="w-full h-full object-cover transition-smooth group-hover:scale-105"
              />
            </div>
            <h3 className="text-xl font-medium text-center group-hover:text-primary transition-smooth">
              Menswear
            </h3>
          </Link>
          
          <Link to="/women" className="group">
            <div className="aspect-[3/4] overflow-hidden rounded-lg mb-4">
              <img
                src={categoryOuterwear}
                alt="Outerwear"
                className="w-full h-full object-cover transition-smooth group-hover:scale-105"
              />
            </div>
            <h3 className="text-xl font-medium text-center group-hover:text-primary transition-smooth">
              Outerwear
            </h3>
          </Link>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="bg-muted/30 py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-light text-center mb-12">New Arrivals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {newArrivals.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.colors[0].images[0]}
                category={product.category}
              />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" asChild>
              <Link to="/women">View All</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Brand Mission */}
      <section id="mission" className="container mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl md:text-4xl font-light mb-6">Our Commitment to Sustainability</h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              At Kohan, we believe that fashion should never come at the cost of our planet. 
              Every piece in our collection is thoughtfully designed using sustainable materials 
              and ethical manufacturing practices.
            </p>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              From organic cotton and recycled cashmere to innovative hemp blends, we're committed 
              to creating timeless pieces that you'll treasure for years to come.
            </p>
            <Button variant="outline" size="lg" asChild>
              <Link to="/#mission">Learn More</Link>
            </Button>
          </div>
          <div className="order-1 md:order-2">
            <div className="aspect-[4/3] overflow-hidden rounded-lg">
              <img
                src={sustainabilityImage}
                alt="Sustainable Materials"
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
