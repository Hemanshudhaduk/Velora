import { useState } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const ProductListing = () => {
  const { category } = useParams();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("all");

  const filteredProducts = products.filter((product) => {
    if (category === "women" && product.gender !== "women" && product.gender !== "unisex") return false;
    if (category === "men" && product.gender !== "men" && product.gender !== "unisex") return false;
    
    if (selectedSize && !product.sizes.includes(selectedSize)) return false;
    
    if (priceRange === "under-100" && product.price >= 100) return false;
    if (priceRange === "100-150" && (product.price < 100 || product.price > 150)) return false;
    if (priceRange === "over-150" && product.price <= 150) return false;
    
    return true;
  });

  const allSizes = ["XS", "S", "M", "L", "XL", "XXL"];
  
  const colors = [
    { name: "White", value: "#FFFFFF" },
    { name: "Black", value: "#000000" },
    { name: "Beige", value: "#F5F5DC" },
    { name: "Olive", value: "#6B7F39" },
    { name: "Navy", value: "#000080" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-6 py-12">
        <h1 className="text-4xl font-light mb-8 capitalize">
          {category === "women" ? "Women's" : "Men's"} Collection
        </h1>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-4 mb-12 pb-6 border-b border-border/40">
          <div className="relative">
            <Button variant="outline" className="gap-2">
              Size
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="relative">
            <Button variant="outline" className="gap-2">
              Color
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={priceRange === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setPriceRange("all")}
            >
              All Prices
            </Button>
            <Button
              variant={priceRange === "under-100" ? "default" : "outline"}
              size="sm"
              onClick={() => setPriceRange("under-100")}
            >
              Under $100
            </Button>
            <Button
              variant={priceRange === "100-150" ? "default" : "outline"}
              size="sm"
              onClick={() => setPriceRange("100-150")}
            >
              $100-$150
            </Button>
            <Button
              variant={priceRange === "over-150" ? "default" : "outline"}
              size="sm"
              onClick={() => setPriceRange("over-150")}
            >
              Over $150
            </Button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
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

        {filteredProducts.length === 0 && (
          <div className="text-center py-24">
            <p className="text-lg text-muted-foreground">No products match your filters.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSelectedSize("");
                setSelectedColor("");
                setPriceRange("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductListing;
