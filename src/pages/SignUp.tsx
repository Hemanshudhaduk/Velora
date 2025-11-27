// src/pages/SignUp.tsx
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import Logo from "@/assets/logo-gold.svg";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  process.env.REACT_APP_API_BASE_URL ||
  "https://clothing-store-server.vercel.app";

async function apiPost(path: string, body: any) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
}

export default function SignUp() {
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    accept: false,
  });

  const [errors, setErrors] = useState<any>({});
  const [busy, setBusy] = useState(false);

  const [stage, setStage] = useState<"signup" | "otp">("signup");
  const [otp, setOtp] = useState("");
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);

  const validateSignup = () => {
    const e: any = {};
    if (!/^[a-zA-Z0-9_]{3,50}$/.test(form.username))
      e.username = "Username must be 3–50 characters";

    if (!form.firstName.trim()) e.firstName = "First name required";
    if (!form.lastName.trim()) e.lastName = "Last name required";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Valid email required";

    if (!/^\d{10,15}$/.test(form.phone))
      e.phone = "Phone must be 10–15 digits";

    if (form.password.length < 6) e.password = "Password must be 6+ chars";
    if (form.password !== form.confirm)
      e.confirm = "Passwords do not match";

    if (!form.accept) e.accept = "Accept terms to continue";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // STEP 1 – SIGNUP
  const handleSignup = async (e: any) => {
    e.preventDefault();
    if (!validateSignup()) return;

    setBusy(true);
    try {
      await signUp({
        username: form.username.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });

      setStage("otp");
      setOtpMessage("OTP sent to your email.");
    } catch (err: any) {
      setErrors({ general: err.message });
    } finally {
      setBusy(false);
    }
  };

  // STEP 2 – VERIFY OTP
  const verifyOtp = async () => {
    if (!otp) return;

    setOtpBusy(true);
    try {
      const res = await apiPost("/api/auth/verify-email", {
        email: form.email.toLowerCase(),
        otp,
      });

      if (res?.data?.token) {
        localStorage.setItem("velora_token", res.data.token);
      }

      setOtpMessage("Verified! Redirecting...");
      setTimeout(() => navigate("/"), 1000);
    } catch (err: any) {
      setOtpMessage(err.message);
    } finally {
      setOtpBusy(false);
    }
  };

  const resendOtp = async () => {
    setOtpBusy(true);
    try {
      await apiPost("/api/auth/resend-otp", { email: form.email });
      setOtpMessage("OTP resent successfully.");
    } catch (err: any) {
      setOtpMessage(err.message);
    }
    setOtpBusy(false);
  };

  // Handle Google Sign Up
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setErrors({ general: "Google sign-up failed. Please try again." });
      return;
    }

    setBusy(true);
    setErrors({});
    try {
      await signInWithGoogle(credentialResponse.credential);
      navigate("/");
    } catch (err: any) {
      setErrors({ general: err.message || "Google sign-up failed" });
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleError = () => {
    setErrors({ general: "Google sign-up was cancelled or failed" });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <div className="flex flex-col items-center gap-3 mb-6">
            <img src={Logo} className="w-28 h-28" alt="Velora Logo" />
            <h3 className="text-2xl font-semibold">Create your Velora account</h3>
            <p className="text-sm text-gray-500 text-center">
              Sign up to save favourites, track orders and enjoy fast checkout.
            </p>
          </div>

          {stage === "signup" && (
            <>
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4 text-sm">
                  {errors.general}
                </div>
              )}

              {/* Google Sign Up Button */}
              <div className="mb-6">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text="signup_with"
                  width="100%"
                />
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
                </div>
              </div>

              <form onSubmit={handleSignup} className="space-y-3">

                {/* Username */}
                <div>
                  <label className="text-sm font-medium">Username</label>
                  <input
                    className="w-full mt-1 border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                    disabled={busy}
                  />
                  {errors.username && (
                    <div className="text-xs text-red-600 mt-1">{errors.username}</div>
                  )}
                </div>

                {/* Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">First Name</label>
                    <input
                      className="w-full mt-1 border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      value={form.firstName}
                      onChange={(e) =>
                        setForm({ ...form, firstName: e.target.value })
                      }
                      disabled={busy}
                    />
                    {errors.firstName && (
                      <div className="text-xs text-red-600 mt-1">
                        {errors.firstName}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Name</label>
                    <input
                      className="w-full mt-1 border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      value={form.lastName}
                      onChange={(e) =>
                        setForm({ ...form, lastName: e.target.value })
                      }
                      disabled={busy}
                    />
                    {errors.lastName && (
                      <div className="text-xs text-red-600 mt-1">
                        {errors.lastName}
                      </div>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    className="w-full mt-1 border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    disabled={busy}
                  />
                  {errors.email && (
                    <div className="text-xs text-red-600 mt-1">{errors.email}</div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <input
                    className="w-full mt-1 border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    disabled={busy}
                  />
                  {errors.phone && (
                    <div className="text-xs text-red-600 mt-1">{errors.phone}</div>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="text-sm font-medium">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      className="w-full mt-1 border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      disabled={busy}
                    />
                  </div>
                  {errors.password && (
                    <div className="text-xs text-red-600 mt-1">{errors.password}</div>
                  )}
                </div>

                {/* Confirm */}
                <div>
                  <label className="text-sm font-medium">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className="w-full mt-1 border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={form.confirm}
                    onChange={(e) =>
                      setForm({ ...form, confirm: e.target.value })
                    }
                    disabled={busy}
                  />
                  {errors.confirm && (
                    <div className="text-xs text-red-600 mt-1">{errors.confirm}</div>
                  )}
                </div>

                {/* Accept terms */}
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={form.accept}
                    onChange={(e) =>
                      setForm({ ...form, accept: e.target.checked })
                    }
                    disabled={busy}
                    className="mt-1"
                  />
                  <label className="text-sm text-gray-600">
                    I agree to the{" "}
                    <a href="/terms" className="text-amber-600 hover:text-amber-700">
                      Terms
                    </a>{" "}
                    &{" "}
                    <a href="/privacy" className="text-amber-600 hover:text-amber-700">
                      Privacy Policy
                    </a>
                  </label>
                </div>
                {errors.accept && (
                  <div className="text-xs text-red-600">{errors.accept}</div>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {busy ? "Creating..." : "Create Account"}
                </button>
              </form>
            </>
          )}

          {/* OTP SCREEN */}
          {stage === "otp" && (
            <div>
              <h4 className="text-lg text-center mb-3 text-amber-600">
                Verify Your Email
              </h4>

              {otpMessage && (
                <p className="text-center text-sm text-gray-600 mb-4">{otpMessage}</p>
              )}

              <input
                className="w-full mt-4 border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={otpBusy}
              />

              <div className="flex gap-3 mt-4">
                <button
                  disabled={otpBusy}
                  onClick={verifyOtp}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {otpBusy ? "Verifying..." : "Verify"}
                </button>

                <button
                  disabled={otpBusy}
                  onClick={resendOtp}
                  className="flex-1 border border-amber-500 text-amber-600 hover:bg-amber-50 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Resend OTP
                </button>
              </div>
            </div>
          )}

          <p className="text-center mt-4 text-sm text-gray-600">
            Already a member?{" "}
            <button 
              onClick={() => navigate("/signin")} 
              className="text-amber-600 hover:text-amber-700 font-medium"
              disabled={busy || otpBusy}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}