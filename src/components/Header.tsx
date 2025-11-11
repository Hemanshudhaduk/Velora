import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Menu } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import CartDrawer from "./CartDrawer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  const { totalItems } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border/40">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-semibold tracking-wider text-foreground hover:opacity-80 transition-smooth">
              KOHAN
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/women" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
                Women
              </Link>
              <Link to="/men" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
                Men
              </Link>
              <Link to="/about" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
                About
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="relative"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {totalItems}
                  </span>
                )}
              </Button>

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col space-y-4 mt-8">
                    <Link
                      to="/women"
                      className="text-lg font-medium text-foreground hover:text-primary transition-smooth"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Women
                    </Link>
                    <Link
                      to="/men"
                      className="text-lg font-medium text-foreground hover:text-primary transition-smooth"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Men
                    </Link>
                    <Link
                      to="/about"
                      className="text-lg font-medium text-foreground hover:text-primary transition-smooth"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      About
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>
      </header>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
};

export default Header;
