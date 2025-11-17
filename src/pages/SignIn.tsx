// src/pages/SignIn.tsx
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/assets/logo-gold.svg";

export default function SignIn() {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be 6+ characters");
      return false;
    }
    return true;
  };

  const submit = async (e: any) => {
    e.preventDefault();
    if (!validate()) return;

    setBusy(true);
    setError("");
    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  // Handle Google Login Success
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError("Google sign-in failed. Please try again.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      await signInWithGoogle(credentialResponse.credential);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  // Handle Google Login Error
  const handleGoogleError = () => {
    setError("Google sign-in was cancelled or failed");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-gray-200 p-8 rounded-xl shadow-lg">
        <div className="text-center mb-6">
          <img src={Logo} className="w-28 mx-auto" alt="Velora Logo" />
          <h2 className="text-xl font-semibold mt-2">Welcome Back</h2>
          <p className="text-gray-500 text-sm">
            Sign in to continue shopping with Velora
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Google Sign In Button */}
        <div className="mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            text="signin_with"
            width="100%"
          />
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              className="w-full border px-3 py-2 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                className="w-full border px-3 py-2 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShow(!show)}
                disabled={busy}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          New user?{" "}
          <button
            className="text-amber-600 hover:require is not defined-amber-700 font-medium"
            onClick={() => navigate("/signup")}
            disabled={busy}
          >
            Create account
          </button>
        </p>
      </div>
    </div>
  );
}