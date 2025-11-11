import { useState } from "react";
import { useParams } from "react-router-dom";
import { Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { products } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const { addItem } = useCart();

  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [mainImage, setMainImage] = useState(0);
  const [showModal, setShowModal] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Product not found</p>
      </div>
    );
  }

  const handleAddToBag = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      color: product.colors[selectedColor].name,
      size: selectedSize,
      image: product.colors[selectedColor].images[0],
    });

    setShowModal(true);
    toast.success("Added to bag!");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Images */}
          <div>
            {/* Main Image */}
            <div className="aspect-[3/4] overflow-hidden rounded-lg mb-4">
              <img
                src={product.colors[selectedColor].images[mainImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-3 gap-4">
              {product.colors[selectedColor].images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setMainImage(index)}
                  className={`aspect-[3/4] overflow-hidden rounded-lg transition-smooth ${
                    mainImage === index ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="lg:pl-8">
            <h1 className="text-3xl md:text-4xl font-light mb-4">{product.name}</h1>
            <p className="text-2xl font-medium mb-6">${product.price.toFixed(2)}</p>
            
            <div className="space-y-6">
              {/* Color Swatches */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Color: {product.colors[selectedColor].name}
                </label>
                <div className="flex gap-3">
                  {product.colors.map((color, index) => (
                    <button
                      key={color.name}
                      onClick={() => {
                        setSelectedColor(index);
                        setMainImage(0);
                      }}
                      className={`w-10 h-10 rounded-full border-2 transition-smooth ${
                        selectedColor === index
                          ? "ring-2 ring-offset-2 ring-primary"
                          : "border-border"
                      }`}
                      style={{ backgroundColor: color.value }}
                      aria-label={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div>
                <label className="block text-sm font-medium mb-3">Size</label>
                <div className="grid grid-cols-5 gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 px-4 border rounded-lg text-sm font-medium transition-smooth ${
                        selectedSize === size
                          ? "bg-foreground text-background"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add to Bag Button */}
              <Button
                size="lg"
                className="w-full"
                onClick={handleAddToBag}
              >
                Add to Bag
              </Button>

              {/* Product Details */}
              <div className="pt-6 border-t border-border/40 space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Fabric</h3>
                  <p className="text-sm text-muted-foreground">{product.fabric}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Fit & Care</h3>
                  <p className="text-sm text-muted-foreground">{product.fit}</p>
                </div>

                <div className="pt-4">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 mt-0.5 text-primary" />
                    <span>Free shipping on orders over $100</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
                    <Check className="h-4 w-4 mt-0.5 text-primary" />
                    <span>Free & easy returns within 30 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Success Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Added to Bag!</DialogTitle>
            <DialogDescription>
              {product.name} in {product.colors[selectedColor].name}, size {selectedSize} has been added to your bag.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
              Continue Shopping
            </Button>
            <Button onClick={() => setShowModal(false)} className="flex-1">
              View Bag
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ProductDetail;
