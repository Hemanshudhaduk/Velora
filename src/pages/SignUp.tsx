// src/pages/SignUp.tsx
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/assets/logo-gold.svg";

export default function SignUp() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    accept: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // sanitize phone: remove all non-digits
  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D+/g, ""); // remove alphabets & symbols
    setForm((s) => ({ ...s, phone: digitsOnly }));
    // clear phone error as user types
    setErrors((e) => ({ ...e, phone: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!form.phone) e.phone = "Phone number is required";
    else if (!/^\d{10,15}$/.test(form.phone)) e.phone = "Enter 10 to 15 digits (numbers only)";
    if (form.password.length < 6) e.password = "Password must be 6+ chars";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    if (!form.accept) e.accept = "Please accept terms";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      // call signUp (mock or real)
      await signUp(form.name.trim(), form.email.trim(), form.password);
      setSuccess(true);
      setTimeout(() => navigate("/"), 1200);
    } catch (err: any) {
      setErrors({ general: err?.message || "Signup failed" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left visual */}
        <div className="hidden md:flex flex-col items-center justify-center p-8 rounded-xl bg-amber-50 border border-amber-100 shadow-lg">
          <img src={Logo} alt="Velora" className="w-36 h-36 mb-4" />
          <h2 className="text-2xl font-semibold text-amber-700">Welcome to Velora</h2>
          <p className="text-center text-gray-600 mt-2">Create an account to save favourites and get faster checkout on our white & gold collection.</p>
        </div>

        {/* Form */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Create your account</h3>
            <div className="text-sm text-gray-500">Already a member? <button onClick={() => navigate("/signin")} className="text-amber-600 ml-2">Sign in</button></div>
          </div>

          {success ? (
            <div className="p-6 bg-green-50 rounded-md text-center">
              <div className="text-green-700 font-semibold mb-2">Account created</div>
              <div className="text-sm text-green-600">You're signed in — redirecting…</div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              {errors.general && <div className="text-sm text-red-600">{errors.general}</div>}

              <div>
                <label className="text-sm font-medium">Full name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full mt-1 border px-3 py-2 rounded-md focus:ring-2 focus:ring-amber-100" />
                {errors.name && <div className="text-xs text-red-600 mt-1">{errors.name}</div>}
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" className="w-full mt-1 border px-3 py-2 rounded-md focus:ring-2 focus:ring-amber-100" />
                {errors.email && <div className="text-xs text-red-600 mt-1">{errors.email}</div>}
              </div>

              <div>
                <label className="text-sm font-medium">Phone (numbers only)</label>
                <input
                  value={form.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="Enter digits only, e.g. 919876543210"
                  className="w-full mt-1 border px-3 py-2 rounded-md focus:ring-2 focus:ring-amber-100"
                />
                {errors.phone && <div className="text-xs text-red-600 mt-1">{errors.phone}</div>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Password</label>
                  <div className="relative mt-1">
                    <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type={show ? "text" : "password"} className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-amber-100" />
                    <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                      {show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <div className="text-xs text-red-600 mt-1">{errors.password}</div>}
                </div>

                <div>
                  <label className="text-sm font-medium">Confirm password</label>
                  <div className="relative mt-1">
                    <input value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} type={showConfirm ? "text" : "password"} className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-amber-100" />
                    <button type="button" onClick={() => setShowConfirm((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirm && <div className="text-xs text-red-600 mt-1">{errors.confirm}</div>}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <input id="accept" type="checkbox" checked={form.accept} onChange={(e) => setForm({ ...form, accept: e.target.checked })} className="mt-1" />
                <label htmlFor="accept" className="text-sm text-gray-600">I agree to the <a className="text-amber-600" href="/terms">terms</a> & <a className="text-amber-600" href="/privacy">privacy policy</a>.</label>
              </div>
              {errors.accept && <div className="text-xs text-red-600">{errors.accept}</div>}

              <div>
                <button disabled={busy} className="w-full py-2 rounded-md bg-amber-500 text-white font-medium hover:opacity-95">
                  {busy ? "Creating account…" : "Get started"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
