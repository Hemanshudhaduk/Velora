import Header from "@/components/Header";
import Footer from "@/components/Footer";
import sustainabilityImage from "@/assets/sustainability-image.jpg";
import heroImage from "@/assets/hero-image.jpg";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <img
            src={heroImage}
            alt="About Kohan"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/20" />
          <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
            <h1 className="text-5xl md:text-6xl font-light tracking-wide text-white mb-4">
              About Kohan
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-light">
              Redefining fashion through conscious design
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="container mx-auto px-6 py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-light mb-8">Our Story</h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Founded in 2019, Kohan was born from a simple belief: fashion should be beautiful, 
              timeless, and kind to our planet. We started with a single question—what if we could 
              create clothing that looks good, feels good, and does good?
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Today, we're a team of designers, makers, and dreamers committed to proving that 
              style and sustainability aren't mutually exclusive. Every piece we create tells a 
              story of ethical manufacturing, premium materials, and timeless design.
            </p>
          </div>
        </section>

        {/* Our Values */}
        <section className="bg-muted/30 py-24">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-light text-center mb-16">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">🌱</span>
                </div>
                <h3 className="text-xl font-medium mb-4">Sustainable Materials</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We exclusively use organic cotton, recycled cashmere, hemp, and other 
                  eco-friendly fabrics that minimize environmental impact.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-xl font-medium mb-4">Ethical Manufacturing</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every piece is made in fair-wage facilities where workers are treated with 
                  dignity and respect. We know our factories personally.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">♾️</span>
                </div>
                <h3 className="text-xl font-medium mb-4">Timeless Design</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We create classic pieces that transcend trends. Our designs are meant to be 
                  worn and loved for years, not just seasons.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sustainability Commitment */}
        <section className="container mx-auto px-6 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl md:text-4xl font-light mb-6">
                Our Sustainability Promise
              </h2>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">100% Sustainable Materials</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Every fabric we use—from organic cotton to recycled cashmere—is chosen 
                    for its minimal environmental footprint.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Carbon Neutral Shipping</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    We offset 100% of our shipping emissions through verified carbon 
                    reduction projects around the world.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Plastic-Free Packaging</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    All orders ship in recyclable paper packaging. No plastic, no waste.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Take-Back Program</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    When you're done with your Kohan pieces, send them back. We'll recycle 
                    or repurpose them, keeping textiles out of landfills.
                  </p>
                </div>
              </div>
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

        {/* Manufacturing */}
        <section className="bg-muted/30 py-24">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-light text-center mb-8">
                Where We Make Our Clothes
              </h2>
              <p className="text-lg text-muted-foreground text-center mb-12 leading-relaxed">
                We partner with a small number of carefully selected factories in Portugal and 
                Turkey—regions known for their textile expertise and commitment to fair labor practices.
              </p>
              
              <div className="space-y-8">
                <div className="bg-background rounded-lg p-8">
                  <h3 className="text-xl font-medium mb-3">Porto, Portugal</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Our primary knits and sweaters are made in a family-run factory that's been 
                    operating for three generations. Workers receive above-market wages and full benefits.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Certifications:</strong> Fair Trade, GOTS Organic, SA8000
                  </p>
                </div>
                
                <div className="bg-background rounded-lg p-8">
                  <h3 className="text-xl font-medium mb-3">Istanbul, Turkey</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Our woven garments are crafted in a certified facility that specializes in 
                    organic cotton and linen production. Regular third-party audits ensure 
                    ethical standards are maintained.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Certifications:</strong> GOTS Organic, OEKO-TEX, BSCI
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="container mx-auto px-6 py-24">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-light mb-6">
              Join Us in Making Fashion Better
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Every purchase you make is a vote for a more sustainable, ethical fashion industry. 
              Thank you for choosing to dress consciously.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/women"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-smooth"
              >
                Shop Women
              </a>
              <a
                href="/men"
                className="inline-flex items-center justify-center px-8 py-4 border border-foreground/20 rounded-lg font-medium hover:bg-foreground/5 transition-smooth"
              >
                Shop Men
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
