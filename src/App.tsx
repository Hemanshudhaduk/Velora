// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderSuccess from "./pages/OrderSuccess";
import ProductListing from "./pages/ProductListing";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ProfilePage from "./pages/Profile";
import CategoryProducts from "./pages/CategoryProducts";
import OrderDetail from "./pages/OrderDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <Toaster />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/order/success/:orderId" element={<OrderSuccess />} />
         <Route path="/order/detail/:orderId" element={<OrderDetail />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/:slug/:categoryId" element={<CategoryProducts />} />
        <Route path="/order/detail/:orderId" element={<OrderDetail />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/men" element={<ProductListing />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;