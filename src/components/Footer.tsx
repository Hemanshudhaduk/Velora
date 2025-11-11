const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-background mt-24">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">KOHAN</h3>
            <p className="text-sm text-muted-foreground">
              Consciously crafted. Timelessly designed.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/women" className="hover:text-foreground transition-smooth">Women</a></li>
              <li><a href="/men" className="hover:text-foreground transition-smooth">Men</a></li>
              <li><a href="/women" className="hover:text-foreground transition-smooth">New Arrivals</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-4">About</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/about" className="hover:text-foreground transition-smooth">Our Story</a></li>
              <li><a href="/about" className="hover:text-foreground transition-smooth">Sustainability</a></li>
              <li><a href="/about" className="hover:text-foreground transition-smooth">Ethical Manufacturing</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-4">Help</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-smooth">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-foreground transition-smooth">Size Guide</a></li>
              <li><a href="#" className="hover:text-foreground transition-smooth">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/40 mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2024 Kohan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
