// src/components/Footer.tsx
import React, { useState } from "react";
// Adjust the import to match your project bundler:
// Option A (recommended if you have "@" alias): 
import Logo from "@/assets/logo-gold.svg";
// Option B (relative path example):
// import Logo from "../../assets/logo-gold.svg";

const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const year = new Date().getFullYear();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setMsg({ type: "error", text: "Please enter a valid email address." });
      return;
    }
    try {
      // TODO: wire to your newsletter API (Mailchimp/Sendinblue/own endpoint)
      // await fetch("/api/newsletter", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ email: trimmed }) });
      setMsg({ type: "success", text: "Thanks — you'll hear from us soon!" });
      setEmail("");
    } catch (err) {
      setMsg({ type: "error", text: "Subscription failed — please try again later." });
    }
  };

  return (
    <footer className="bg-white border-t border-gray-200 mt-24">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Social */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={Logo} alt="Velora" className="w-36 h-auto object-contain" />
            </div>
            <p className="text-sm text-gray-600">
              Velora — elegance & empowerment for women. Thoughtfully designed collections, responsibly made.
            </p>

            <div className="flex items-center gap-3 mt-2">
              {/* small accessible social icons */}
              <a aria-label="Velora Instagram" href="#" className="p-2 rounded-md hover:bg-gray-100" title="Instagram">
                <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 6.5A4.5 4.5 0 1 0 16.5 13 4.5 4.5 0 0 0 12 8.5zM18 7.2a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2z" />
                </svg>
              </a>
              <a aria-label="Velora Facebook" href="#" className="p-2 rounded-md hover:bg-gray-100" title="Facebook">
                <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2.2V12h2.2V9.7c0-2.2 1.3-3.4 3.3-3.4.96 0 1.96.17 1.96.17v2.1h-1.08c-1.07 0-1.4.66-1.4 1.33V12h2.38l-.38 2.9h-2v7A10 10 0 0 0 22 12z" />
                </svg>
              </a>
              <a aria-label="Velora Pinterest" href="#" className="p-2 rounded-md hover:bg-gray-100" title="Pinterest">
                <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 2a10 10 0 1 0 3.9 19.2c-.05-.82-.1-2.08.02-2.97.12-.9.78-5.74.78-5.74s-.2-.38-.2-.95c0-.9.52-1.58 1.17-1.58.55 0 .82.41.82.9 0 .55-.35 1.37-.53 2.13-.15.64.32 1.16.96 1.16 1.16 0 2.05-1.22 2.05-2.98 0-1.56-1.12-2.66-2.83-2.66-1.93 0-3.07 1.45-3.07 2.95 0 .58.22 1.2.5 1.54.06.07.07.13.05.2-.05.22-.16.7-.18.8-.03.16-.1.2-.24.12-.9-.42-1.46-1.77-1.46-2.85 0-2.32 1.69-4.46 4.88-4.46 2.56 0 4.53 1.83 4.53 4.28 0 2.56-1.61 4.63-3.86 4.63-.75 0-1.46-.38-1.7-.83l-.46 1.74c-.17.66-.64 1.48-.95 1.98A10 10 0 0 0 12 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="/women/tops" className="hover:text-gray-900">Tops & Blouses</a></li>
              <li><a href="/women/dresses" className="hover:text-gray-900">Dresses</a></li>
              <li><a href="/women/suits" className="hover:text-gray-900">Suits & Sets</a></li>
              <li><a href="/women/sarees" className="hover:text-gray-900">Sarees</a></li>
              <li><a href="/new-arrivals" className="hover:text-gray-900">New Arrivals</a></li>
            </ul>
          </div>

          {/* About / Support */}
          <div>
            <h4 className="text-sm font-semibold mb-4">About</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="/about" className="hover:text-gray-900">Our Story</a></li>
              <li><a href="/sustainability" className="hover:text-gray-900">Sustainability</a></li>
              <li><a href="/manufacturing" className="hover:text-gray-900">Ethical Manufacturing</a></li>
              <li><a href="/careers" className="hover:text-gray-900">Careers</a></li>
            </ul>
          </div>

          {/* Newsletter + Trust */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Join Velora</h4>
            <p className="text-sm text-gray-600 mb-3">
              Get early access, exclusive drops & member-only offers.
            </p>

            <form className="flex gap-2" onSubmit={handleSubscribe} aria-label="Subscribe to newsletter">
              <label htmlFor="footer-email" className="sr-only">Email</label>
              <input
                id="footer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-amber-200"
                aria-label="Email for newsletter"
              />
              <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded-md text-sm hover:bg-amber-700">
                Join
              </button>
            </form>

            {msg && <div className={`mt-3 text-sm ${msg.type === "success" ? "text-green-600" : "text-red-600"}`}>{msg.text}</div>}

            <div className="mt-6">
              <h5 className="text-sm font-medium mb-2">Payment</h5>
              <div className="flex gap-3 items-center">
                <div className="w-12 h-7 bg-gray-100 rounded-sm flex items-center justify-center text-xs">VISA</div>
                <div className="w-12 h-7 bg-gray-100 rounded-sm flex items-center justify-center text-xs">MC</div>
                <div className="w-12 h-7 bg-gray-100 rounded-sm flex items-center justify-center text-xs">UPI</div>
                <div className="w-12 h-7 bg-gray-100 rounded-sm flex items-center justify-center text-xs">AMEX</div>
              </div>

              <div className="mt-4">
                <h5 className="text-sm font-medium mb-2">Trust</h5>
                <div className="flex gap-3 items-center">
                  <div className="px-3 py-1 bg-green-50 text-green-700 rounded text-xs">Secure Checkout</div>
                  <div className="px-3 py-1 bg-gray-50 text-gray-700 rounded text-xs">Easy Returns</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* bottom */}
        <div className="mt-10 border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex gap-6 text-xs text-gray-600 flex-wrap justify-center md:justify-start">
            <a href="/terms" className="hover:text-gray-900">Terms</a>
            <a href="/privacy" className="hover:text-gray-900">Privacy</a>
            <a href="/sizing" className="hover:text-gray-900">Sizing & Fit</a>
            <a href="/store-locator" className="hover:text-gray-900">Store Locator</a>
            <a href="/corporate" className="hover:text-gray-900">Corporate Orders</a>
          </div>

          <div className="text-center md:text-right text-sm text-gray-500">
            <div>© {year} Velora. All rights reserved.</div>
            <div className="text-xs text-gray-400 mt-1">Designed for elegance & empowerment — womenswear</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
