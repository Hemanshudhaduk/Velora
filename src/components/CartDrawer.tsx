import { Link } from "react-router-dom";
import { X, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CartDrawer = ({ open, onOpenChange }: CartDrawerProps) => {
  const { items, removeItem, updateQuantity, totalItems } = useCart();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 10;

  const handleUpdateQuantity = (id: string, color: string, size: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(id, color, size, newQuantity);
  };

  const handleRemoveItem = (id: string, color: string, size: string, name: string) => {
    removeItem(id, color, size);
    toast.success(`${name} removed from cart`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>Shopping Bag ({totalItems})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-6">Your bag is empty</p>
              <Button onClick={() => onOpenChange(false)} asChild>
                <Link to="/women">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-6 space-y-6">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.color}-${item.size}`}
                  className="flex gap-4"
                >
                  {/* Product Image */}
                  <Link
                    to={`/product/${item.id}`}
                    onClick={() => onOpenChange(false)}
                    className="flex-shrink-0 w-24 h-32 overflow-hidden rounded-lg bg-muted"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex justify-between mb-1">
                      <Link
                        to={`/product/${item.id}`}
                        onClick={() => onOpenChange(false)}
                        className="font-medium hover:text-primary transition-smooth truncate pr-2"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => handleRemoveItem(item.id, item.color, item.size, item.name)}
                        className="text-muted-foreground hover:text-foreground transition-smooth flex-shrink-0"
                        aria-label="Remove item"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      {item.color} • {item.size}
                    </p>

                    <div className="mt-auto flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.color, item.size, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 flex items-center justify-center border border-border rounded hover:bg-muted transition-smooth disabled:opacity-50"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.color, item.size, item.quantity + 1)
                          }
                          className="w-7 h-7 flex items-center justify-center border border-border rounded hover:bg-muted transition-smooth"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary & Checkout */}
            <div className="border-t border-border/40 pt-6 space-y-4">
              <div className="space-y-2">
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

                {shipping > 0 && subtotal < 100 && (
                  <p className="text-xs text-muted-foreground">
                    Add ${(100 - subtotal).toFixed(2)} more for free shipping
                  </p>
                )}
              </div>

              <Button size="lg" className="w-full" asChild>
                <Link to="/cart" onClick={() => onOpenChange(false)}>
                  View Bag & Checkout
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
