import { Link } from "react-router-dom";
import { Minus, Plus, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const Cart = () => {
  const { items, removeItem, updateQuantity, clearCart, totalItems } = useCart();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const handleUpdateQuantity = (id: string, color: string, size: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(id, color, size, newQuantity);
  };

  const handleRemoveItem = (id: string, color: string, size: string, name: string) => {
    removeItem(id, color, size);
    toast.success(`${name} removed from cart`);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-24 px-6">
            <h1 className="text-3xl md:text-4xl font-light mb-4">Your Bag is Empty</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Add some beautiful pieces to get started
            </p>
            <Button variant="default" size="lg" asChild>
              <Link to="/women">Continue Shopping</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-light mb-8">Shopping Bag ({totalItems})</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.color}-${item.size}`}
                  className="flex gap-6 pb-6 border-b border-border/40"
                >
                  {/* Product Image */}
                  <Link
                    to={`/product/${item.id}`}
                    className="flex-shrink-0 w-32 h-40 overflow-hidden rounded-lg bg-muted"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-smooth"
                    />
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between mb-2">
                      <div>
                        <Link
                          to={`/product/${item.id}`}
                          className="text-lg font-medium hover:text-primary transition-smooth"
                        >
                          {item.name}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          Color: {item.color} • Size: {item.size}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id, item.color, item.size, item.name)}
                        className="text-muted-foreground hover:text-foreground transition-smooth"
                        aria-label="Remove item"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.color, item.size, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center border border-border rounded-lg hover:bg-muted transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.color, item.size, item.quantity + 1)
                          }
                          className="w-8 h-8 flex items-center justify-center border border-border rounded-lg hover:bg-muted transition-smooth"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <p className="text-lg font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear Cart Button */}
              <Button
                variant="ghost"
                onClick={() => {
                  clearCart();
                  toast.success("Cart cleared");
                }}
                className="text-muted-foreground hover:text-destructive"
              >
                Clear All Items
              </Button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-muted/30 rounded-lg p-6 sticky top-24">
                <h2 className="text-xl font-medium mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  
                  {shipping === 0 && (
                    <p className="text-xs text-primary">
                      ✓ You qualify for free shipping!
                    </p>
                  )}
                  
                  {shipping > 0 && subtotal < 100 && (
                    <p className="text-xs text-muted-foreground">
                      Add ${(100 - subtotal).toFixed(2)} more for free shipping
                    </p>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Tax</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="pt-4 border-t border-border/40">
                    <div className="flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="text-xl font-medium">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button size="lg" className="w-full mb-4">
                  Proceed to Checkout
                </Button>
                
                <Button variant="outline" size="lg" className="w-full" asChild>
                  <Link to="/women">Continue Shopping</Link>
                </Button>

                {/* Additional Info */}
                <div className="mt-6 pt-6 border-t border-border/40 space-y-3 text-xs text-muted-foreground">
                  <p>✓ Free & easy returns within 30 days</p>
                  <p>✓ Secure checkout</p>
                  <p>✓ Carbon-neutral shipping</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
