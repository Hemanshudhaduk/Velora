import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";

const Header = () => {
  const { totalItems } = useCart();

  return (
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
            <Link to="/#mission" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
              About
            </Link>
            <Link to="/#mission" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
              Sustainability
            </Link>
          </div>

          <Button variant="ghost" size="sm" className="relative">
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {totalItems}
              </span>
            )}
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
