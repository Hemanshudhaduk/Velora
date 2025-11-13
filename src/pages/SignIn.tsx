// src/pages/SignIn.tsx
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/assets/logo-gold.svg";

export default function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  const validate = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    setError(null);
    return true;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message ?? "Sign in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Visual */}
        <div className="hidden md:flex flex-col items-center justify-center p-8 rounded-xl bg-amber-50 border border-amber-100 shadow-lg">
          <img src={Logo} alt="Velora" className="w-56 h-56 mb-4" />
          <h2 className="text-2xl font-semibold text-amber-700">Velora</h2>
          <p className="text-center text-gray-600 mt-2">White & Gold collection — sign in to continue shopping premium styles.</p>
        </div>

        {/* Form */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Sign in to Velora</h3>
            <div className="text-sm text-gray-500">New here? <button onClick={() => navigate("/signup")} className="text-amber-600 ml-2">Create account</button></div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {error && <div className="text-sm text-red-600">{error}</div>}

            <div>
              <label className="text-sm font-medium">Email</label>
              <input required value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full mt-1 border px-3 py-2 rounded-md focus:ring-2 focus:ring-amber-100" />
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>
              <div className="relative mt-1">
                <input required value={password} onChange={(e) => setPassword(e.target.value)} type={show ? "text" : "password"} className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-amber-100" />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="mt-1" />
                <span>Remember me</span>
              </label>
              <button type="button" className="text-amber-600">Forgot?</button>
            </div>

            <div>
              <button disabled={busy} className="w-full py-2 rounded-md bg-amber-500 text-white font-medium hover:opacity-95">
                {busy ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
