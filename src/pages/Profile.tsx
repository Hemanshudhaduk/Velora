// src/pages/Profile.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  MapPin,
  Save,
  Mail,
  Lock,
  User,
  Phone as PhoneIcon,
  Camera,
  X,
  Check,
  Plus,
  Home,
  Building2,
  Navigation,
  Search,
  ArrowLeft,
} from "lucide-react";

type User = {
  id: string;
  username?: string | null;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  profileImage?: string | null;
  role?: string | null;
  isVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type Address = {
  id: string;
  address_type?: "shipping" | "billing";
  addressType?: "shipping" | "billing";
  full_name?: string;
  fullName?: string;
  phone?: string;
  address_line1?: string;
  addressLine1?: string;
  address_line2?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  is_default?: boolean;
  isDefault?: boolean;
};

const API_BASE = (import.meta as any)?.env?.VITE_API_BASE_URL || "http://localhost:5000";
const API = (path: string) => `${API_BASE}${path}`;

const authFetch = async (url: string, opts: RequestInit = {}) => {
  const token = localStorage.getItem("velora_token");
  const headers: Record<string, string> = { ...((opts.headers as Record<string, string>) || {}) };

  if (!(opts.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, {
    credentials: "same-origin",
    ...opts,
    headers,
  });

  const text = await res.text().catch(() => "");
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { message: text };
  }

  if (!res.ok) {
    const err = new Error(json?.message || `Request failed ${res.status}`);
    (err as any).status = res.status;
    (err as any).body = json;
    throw err;
  }
  return json;
};

function resolveImageUrl(img?: string | null) {
  if (!img) return null;
  const trimmed = img.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    const urlMatch = trimmed.match(/\/uploads\/.+$/);
    if (urlMatch) {
      return `${API_BASE}${urlMatch[0]}`;
    }
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return `${API_BASE}${trimmed}`;
  }

  return `${API_BASE}/uploads/${trimmed}`;
}

function normalizeAddress(addr: any): Address {
  return {
    id: addr.id,
    address_type: addr.addressType || addr.address_type || "shipping",
    addressType: addr.addressType || addr.address_type || "shipping",
    full_name: addr.fullName || addr.full_name || "",
    fullName: addr.fullName || addr.full_name || "",
    phone: addr.phone || "",
    address_line1: addr.addressLine1 || addr.address_line1 || "",
    addressLine1: addr.addressLine1 || addr.address_line1 || "",
    address_line2: addr.addressLine2 || addr.address_line2 || "",
    addressLine2: addr.addressLine2 || addr.address_line2 || "",
    city: addr.city || "",
    state: addr.state || "",
    pincode: addr.pincode || "",
    country: addr.country || "India",
    is_default: addr.isDefault ?? addr.is_default ?? false,
    isDefault: addr.isDefault ?? addr.is_default ?? false,
  };
}

export default function ProfilePage(): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "addresses">("profile");

  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    phone: "",
    profileImageFile: null as File | null,
    profileImagePreview: "",
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    newEmail: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [addrModalOpen, setAddrModalOpen] = useState(false);
  const [editingAddr, setEditingAddr] = useState<Address | null>(null);
  const [addrForm, setAddrForm] = useState<Partial<Address>>({
    address_type: "shipping",
    country: "India",
  });

  // Map / pincode picker states
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapLocation, setMapLocation] = useState({ lat: 21.1702, lng: 72.8311 });
  const [searchQuery, setSearchQuery] = useState("");
  const [pincodeSearch, setPincodeSearch] = useState("");
  const [pincodeResults, setPincodeResults] = useState<any[] | null>(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState<string | null>(null);
  const [selectedPOIndex, setSelectedPOIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const lastPreviewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (lastPreviewUrlRef.current) {
        try {
          URL.revokeObjectURL(lastPreviewUrlRef.current);
        } catch {}
        lastPreviewUrlRef.current = null;
      }
    };
  }, []);

  const avatarFrom = (u: User | null) => {
    if (!u) return null;
    if (u.profileImage) {
      const resolved = resolveImageUrl(u.profileImage);
      if (resolved) return resolved;
    }
    const nameSource = u.username || `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "U";
    const initial = (nameSource.charAt(0) || "U").toUpperCase();
    const svg = encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect fill='#FDF6ED' width='100%' height='100%'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-family='Inter, Arial' font-size='90' fill='#B87333'>${initial}</text></svg>`
    );
    return `data:image/svg+xml;charset=UTF-8,${svg}`;
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await authFetch(API("/api/profile/me"), { method: "GET" });
        const userObj: any = data?.data?.user ?? data?.user ?? null;
        if (!userObj) throw new Error("Failed to load profile");
        setUser(userObj as User);

        const resolvedImage = resolveImageUrl(userObj.profileImage);
        setForm({
          username: userObj.username ?? "",
          firstName: userObj.firstName ?? "",
          lastName: userObj.lastName ?? "",
          phone: userObj.phone ?? "",
          profileImageFile: null,
          profileImagePreview: resolvedImage ?? "",
        });
        await loadAddresses();
      } catch (err: any) {
        console.error("Profile load error:", err);
        setError(err?.message || "Unable to load profile");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAddresses = async () => {
    setAddrLoading(true);
    try {
      const res = await authFetch(API("/api/address/list"), { method: "GET" });
      let list: any[] = [];

      if (!res) {
        list = [];
      } else if (Array.isArray(res)) {
        list = res;
      } else if (res.data) {
        if (Array.isArray(res.data)) list = res.data;
        else if (Array.isArray(res.data.addresses)) list = res.data.addresses;
      } else if (Array.isArray(res.addresses)) {
        list = res.addresses;
      } else {
        const maybe = Object.values(res).find((v) => Array.isArray(v));
        list = Array.isArray(maybe) ? maybe : [];
      }

      const normalized = list.map(normalizeAddress);
      setAddresses(normalized);
    } catch (err) {
      console.warn("Addresses load failed", err);
      setAddresses([]);
    } finally {
      setAddrLoading(false);
    }
  };

  const onSelectProfileImage = (file?: File | null) => {
    if (lastPreviewUrlRef.current) {
      try {
        URL.revokeObjectURL(lastPreviewUrlRef.current);
      } catch {}
      lastPreviewUrlRef.current = null;
    }
    if (!file) {
      const currentImage = resolveImageUrl(user?.profileImage ?? "");
      setForm((f) => ({ ...f, profileImageFile: null, profileImagePreview: currentImage ?? "" }));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    const url = URL.createObjectURL(file);
    lastPreviewUrlRef.current = url;
    setForm((f) => ({ ...f, profileImageFile: file, profileImagePreview: url }));
  };

  const handleSaveProfile = async () => {
    if (!form.username || form.username.trim().length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (!form.firstName || !form.lastName) {
      setError("First name and last name required");
      return;
    }
    if (form.phone && !/^\d{10,15}$/.test(form.phone)) {
      setError("Phone must be 10-15 digits");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("username", form.username);
      fd.append("firstName", form.firstName);
      fd.append("lastName", form.lastName);
      if (form.phone) fd.append("phone", form.phone);
      if (form.profileImageFile) fd.append("profileImage", form.profileImageFile);

      const token = localStorage.getItem("velora_token");
      const res = await fetch(API("/api/profile/update"), {
        method: "PUT",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: fd,
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Request failed ${res.status}`);
      }
      const json = await res.json();
      if (json?.data?.user) setUser(json.data.user);

      try {
        const refreshed = await authFetch(API("/api/profile/me"), { method: "GET" });
        const refreshedUser: any = refreshed?.data?.user ?? refreshed?.user ?? null;
        if (refreshedUser) {
          setUser(refreshedUser as User);
          const resolvedImage = resolveImageUrl(refreshedUser.profileImage);
          setForm((f) => ({ ...f, profileImageFile: null, profileImagePreview: resolvedImage ?? f.profileImagePreview }));
        }
      } catch {}

      alert("Profile updated successfully!");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSecurity = async () => {
    if (securityForm.newPassword && securityForm.newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload: any = {};
      if (securityForm.currentPassword && securityForm.newPassword) {
        payload.currentPassword = securityForm.currentPassword;
        payload.newPassword = securityForm.newPassword;
      }
      if (securityForm.newEmail) payload.newEmail = securityForm.newEmail;

      const json = await authFetch(API("/api/profile/update"), {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (json?.data?.emailChangeRequested) {
        setOtpMessage(json.message || "OTP sent to new email");
        setOtpModalOpen(true);
      }
      if (json?.data?.user) {
        setUser(json.data.user);
        setSecurityForm({ currentPassword: "", newPassword: "", newEmail: "" });
      }

      if (!json?.data?.emailChangeRequested) {
        alert("Security settings updated!");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyEmailChange = async () => {
    if (!otpCode || otpCode.length < 4) {
      setOtpMessage("Enter a valid OTP");
      return;
    }
    setOtpLoading(true);
    try {
      const json = await authFetch(API("/api/profile/verify-email-change"), {
        method: "POST",
        body: JSON.stringify({ otp: otpCode }),
      });
      setUser((u) => ({ ...(u as User), email: json?.data?.user?.email ?? (u as User).email }));
      setOtpMessage(json.message || "Email changed");
      setOtpModalOpen(false);
      setOtpCode("");
      alert("Email changed successfully!");
    } catch (err: any) {
      setOtpMessage(err?.message || "Verification failed");
    } finally {
      setOtpLoading(false);
    }
  };

  const openAddAddress = () => {
    setEditingAddr(null);
    setAddrForm({ address_type: "shipping", country: "India" });
    setAddrModalOpen(true);
  };

  const openEditAddress = (a: Address) => {
    setEditingAddr(a);
    setAddrForm({
      address_type: a.addressType || a.address_type || "shipping",
      full_name: a.fullName || a.full_name || "",
      phone: a.phone,
      address_line1: a.addressLine1 || a.address_line1 || "",
      address_line2: a.addressLine2 || a.address_line2 || "",
      city: a.city,
      state: a.state,
      pincode: a.pincode,
      country: a.country,
    });
    setAddrModalOpen(true);
  };

  const saveAddress = async () => {
    const required = ["full_name", "phone", "address_line1", "city", "state", "pincode", "country"];
    for (const k of required)
      if (!(addrForm as any)[k]) {
        setError("Please fill all address fields");
        return;
      }
    setError(null);

    const payload: any = {
      addressType: addrForm.address_type ?? "shipping",
      fullName: addrForm.full_name,
      phone: addrForm.phone,
      addressLine1: addrForm.address_line1,
      addressLine2: addrForm.address_line2 ?? "",
      city: addrForm.city,
      state: addrForm.state,
      pincode: addrForm.pincode,
      country: addrForm.country,
    };

    try {
      if (editingAddr) {
        await authFetch(API(`/api/address/${editingAddr.id}`), {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await authFetch(API("/api/address/add"), {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setAddrModalOpen(false);
      setShowMapPicker(false);
      await loadAddresses();
    } catch (err: any) {
      setError(err?.message || "Address save failed");
    }
  };

  const deleteAddress = async (id: string | undefined) => {
    if (!id) return;
    if (!confirm("Delete this address?")) return;
    try {
      await authFetch(API(`/api/address/${id}`), { method: "DELETE" });
      await loadAddresses();
    } catch (err: any) {
      setError(err?.message || "Delete failed");
    }
  };

  const setDefaultAddr = async (id: string | undefined) => {
    if (!id) return;
    try {
      await authFetch(API(`/api/address/${id}/set-default`), { method: "PATCH" });
      await loadAddresses();
    } catch (err: any) {
      setError(err?.message || "Set default failed");
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapLocation({ lat: latitude, lng: longitude });
          reverseGeocode(latitude, longitude);
        },
        () => {
          alert("Unable to get your location. Please enter manually.");
        }
      );
    } else {
      alert("Geolocation not supported in this browser.");
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data?.address) {
        setAddrForm((f) => ({
          ...f,
          address_line1: data.address.road || data.display_name?.split(",")[0] || f.address_line1,
          city: data.address.city || data.address.town || data.address.village || f.city,
          state: data.address.state || f.state,
          pincode: data.address.postcode || f.pincode,
          country: data.address.country || f.country || "India",
        }));
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (data && data[0]) {
        const { lat, lon } = data[0];
        setMapLocation({ lat: parseFloat(lat), lng: parseFloat(lon) });
        reverseGeocode(parseFloat(lat), parseFloat(lon));
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  // Pincode lookup (India - PostOffice API)
  const lookupPincode = async (pin?: string) => {
    const p = (pin ?? pincodeSearch ?? "").trim();
    if (!p || p.length < 4) {
      setPincodeError("Enter a valid pincode");
      setPincodeResults(null);
      return;
    }
    setPincodeLoading(true);
    setPincodeError(null);
    setPincodeResults(null);
    setSelectedPOIndex(null);

    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${encodeURIComponent(p)}`);
      const json = await res.json();
      if (!Array.isArray(json) || json.length === 0) {
        setPincodeError("No results");
        setPincodeResults(null);
      } else {
        const entry = json[0];
        if (entry.Status !== "Success" || !Array.isArray(entry.PostOffice) || entry.PostOffice.length === 0) {
          setPincodeError("No areas found for this pincode");
          setPincodeResults(null);
        } else {
          setPincodeResults(entry.PostOffice);
          setPincodeError(null);
        }
      }
    } catch (err) {
      console.error("Pincode lookup failed", err);
      setPincodeError("Lookup failed");
      setPincodeResults(null);
    } finally {
      setPincodeLoading(false);
    }
  };

  const applySelectedPostOffice = (idx?: number) => {
    const i = idx ?? selectedPOIndex;
    if (i == null || !pincodeResults || !Array.isArray(pincodeResults) || !pincodeResults[i]) {
      setError("Select an area first");
      return;
    }
    const po = pincodeResults[i];
    setAddrForm((f) => ({
      ...f,
      pincode: pincodeSearch || f.pincode || "",
      city: po.District || f.city || "",
      state: po.State || f.state || "",
      country: po.Country || f.country || "India",
      address_line2: [po.Name, po.Block, po.Division].filter(Boolean).join(", ") || f.address_line2,
    }));
    setShowMapPicker(false);
    setPincodeResults(null);
    setSelectedPOIndex(null);
    setPincodeSearch("");
  };

  const goToHome = () => {
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">Not authenticated</p>
          <p className="text-sm mt-2">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  const avatarSrc = form.profileImagePreview || avatarFrom(user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={goToHome}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all text-gray-700 hover:text-amber-600"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Home</span>
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-6 border border-amber-100">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-amber-200 shadow-lg bg-gray-100">
                <img
                  src={avatarSrc || ""}
                  alt="avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = avatarFrom(user) || "";
                  }}
                />
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-amber-500 text-white p-2 md:p-3 rounded-full shadow-lg hover:bg-amber-600 transition-all transform hover:scale-110"
              >
                <Camera size={18} className="md:w-5 md:h-5" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => onSelectProfileImage(e.target.files?.[0] ?? null)} className="hidden" />
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-amber-600 font-medium mt-1">@{user.username ?? "user"}</p>
              <p className="text-gray-500 text-sm mt-2 break-all">{user.email}</p>
              <div className="mt-3">
                {user.isVerified ? (
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    <Check size={16} /> Verified Account
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
                    Unverified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6 border border-amber-100">
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 py-3 px-4 md:px-6 rounded-xl font-medium transition-all ${
                activeTab === "profile" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <User className="inline mr-2" size={18} />
              Profile
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex-1 py-3 px-4 md:px-6 rounded-xl font-medium transition-all ${
                activeTab === "security" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Lock className="inline mr-2" size={18} />
              Security
            </button>
            <button
              onClick={() => setActiveTab("addresses")}
              className={`flex-1 py-3 px-4 md:px-6 rounded-xl font-medium transition-all ${
                activeTab === "addresses" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <MapPin className="inline mr-2" size={18} />
              Addresses
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-amber-100">
          {activeTab === "profile" && (
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-900">Profile Information</h2>
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline mr-2" size={16} />
                    Username
                  </label>
                  <input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" placeholder="Enter username" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <PhoneIcon className="inline mr-2" size={16} />
                    Phone Number
                  </label>
                  <input value={form.phone || ""} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "") }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" placeholder="Enter phone number" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" placeholder="Enter first name" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" placeholder="Enter last name" />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button onClick={handleSaveProfile} disabled={saving} className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Save className="inline mr-2" size={18} />
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-900">Security Settings</h2>
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline mr-2" size={16} />
                    Change Email
                  </label>
                  <input placeholder="newemail@example.com" value={securityForm.newEmail} onChange={(e) => setSecurityForm((f) => ({ ...f, newEmail: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" />
                  <p className="text-xs text-gray-500 mt-2">An OTP will be sent to verify the new email address</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Lock className="inline mr-2" size={16} />
                      Current Password
                    </label>
                    <div className="relative">
                      <input value={securityForm.currentPassword} onChange={(e) => setSecurityForm((f) => ({ ...f, currentPassword: e.target.value }))} type={showPassword ? "text" : "password"} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all pr-12" placeholder="Enter current password" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <div className="relative">
                      <input value={securityForm.newPassword} onChange={(e) => setSecurityForm((f) => ({ ...f, newPassword: e.target.value }))} type={showNewPassword ? "text" : "password"} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all pr-12" placeholder="Enter new password" />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-500">Password must be at least 8 characters long</p>
              </div>

              <div className="mt-8 flex justify-end">
                <button onClick={handleSaveSecurity} disabled={saving} className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Save className="inline mr-2" size={18} />
                  {saving ? "Saving..." : "Update Security"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "addresses" && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Saved Addresses</h2>
                <button onClick={openAddAddress} className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-all transform hover:scale-105">
                  <Plus className="inline mr-2" size={18} />
                  Add New Address
                </button>
              </div>

              {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}

              {addrLoading ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading addresses...</p>
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <MapPin className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-600 mb-2">No addresses saved yet</p>
                  <p className="text-sm text-gray-500">Add your first address to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {addresses.map((addr) => {
                    const name = addr.fullName || addr.full_name || "";
                    const line1 = addr.addressLine1 || addr.address_line1 || "";
                    const line2 = addr.addressLine2 || addr.address_line2 || "";
                    const type = addr.addressType || addr.address_type || "shipping";
                    const isDefault = addr.isDefault ?? addr.is_default ?? false;

                    return (
                      <div key={addr.id} className="p-6 border-2 border-gray-200 rounded-2xl hover:border-amber-300 transition-all bg-gradient-to-br from-white to-gray-50">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            {type === "shipping" ? <Home className="text-amber-600" size={20} /> : <Building2 className="text-amber-600" size={20} />}
                            <span className="font-semibold text-gray-900">{name}</span>
                          </div>
                          {isDefault && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">Default</span>}
                        </div>

                        <div className="space-y-1 text-sm text-gray-600 mb-4">
                          <p>{line1}</p>
                          {line2 && <p>{line2}</p>}
                          <p>
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p>{addr.country}</p>
                          <p className="flex items-center gap-1 text-gray-500">
                            <PhoneIcon size={14} /> {addr.phone}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {!isDefault && (
                            <button onClick={() => setDefaultAddr(addr.id)} className="flex-1 min-w-[120px] px-3 py-2 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-all text-sm font-medium">
                              Set Default
                            </button>
                          )}
                          <button onClick={() => openEditAddress(addr)} className="flex-1 min-w-[120px] px-3 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-all text-sm font-medium">
                            <Edit2 className="inline mr-1" size={14} />
                            Edit
                          </button>
                          <button onClick={() => deleteAddress(addr.id)} className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all text-sm font-medium">
                            <Trash2 className="inline" size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* OTP Modal */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-2">Verify Email Change</h3>
            <p className="text-sm text-gray-600 mb-4">{otpMessage || "Enter the OTP sent to your new email address"}</p>
            <input value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent mb-4" placeholder="Enter 6-digit OTP" maxLength={6} />
            <div className="flex gap-3">
              <button onClick={handleVerifyEmailChange} disabled={otpLoading} className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50">
                {otpLoading ? "Verifying..." : "Verify OTP"}
              </button>
              <button onClick={() => { setOtpModalOpen(false); setOtpCode(""); setOtpMessage(null); }} className="px-4 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address Modal */}
      {addrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl md:text-2xl font-bold">{editingAddr ? "Edit Address" : "Add New Address"}</h3>
              <div className="flex gap-2">
                <button onClick={() => { setAddrModalOpen(false); setEditingAddr(null); setShowMapPicker(false); }} className="px-3 py-1 rounded border">Close</button>
              </div>
            </div>

            {!showMapPicker ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
                    <select value={addrForm.address_type || "shipping"} onChange={(e) => setAddrForm((s) => ({ ...s, address_type: e.target.value as any }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                      <option value="shipping">Shipping Address</option>
                      <option value="billing">Billing Address</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input placeholder="John Doe" value={addrForm.full_name || ""} onChange={(e) => setAddrForm((s) => ({ ...s, full_name: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input placeholder="1234567890" value={addrForm.phone || ""} onChange={(e) => setAddrForm((s) => ({ ...s, phone: e.target.value.replace(/\D/g, "") }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                    <input placeholder="395009" value={addrForm.pincode || ""} onChange={(e) => setAddrForm((s) => ({ ...s, pincode: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
                  <input placeholder="House/Flat No., Building Name" value={addrForm.address_line1 || ""} onChange={(e) => setAddrForm((s) => ({ ...s, address_line1: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2 (Optional)</label>
                  <input placeholder="Street, Area, Landmark" value={addrForm.address_line2 || ""} onChange={(e) => setAddrForm((s) => ({ ...s, address_line2: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input placeholder="Surat" value={addrForm.city || ""} onChange={(e) => setAddrForm((s) => ({ ...s, city: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input placeholder="Gujarat" value={addrForm.state || ""} onChange={(e) => setAddrForm((s) => ({ ...s, state: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input placeholder="India" value={addrForm.country || "India"} onChange={(e) => setAddrForm((s) => ({ ...s, country: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                </div>

                <button onClick={() => setShowMapPicker(true)} className="w-full py-3 border-2 border-dashed border-amber-300 text-amber-600 rounded-xl hover:bg-amber-50 transition-all font-medium">
                  <Navigation className="inline mr-2" size={18} /> Use Map / Pincode Lookup to autofill
                </button>

                {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button onClick={saveAddress} className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-all">
                    <Save className="inline mr-2" size={18} /> Save Address
                  </button>
                  <button onClick={() => { setAddrModalOpen(false); setEditingAddr(null); }} className="px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-all">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Map Picker / Pincode UI */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="md:col-span-2 flex gap-2">
                    <input placeholder="Search for a location or address..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={(e) => e.key === "Enter" && searchLocation()} className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" />
                    <button onClick={searchLocation} className="px-4 md:px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all">
                      <Search size={18} />
                    </button>
                    <button onClick={handleUseCurrentLocation} className="px-4 md:px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all">
                      <Navigation size={18} />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <input placeholder="Enter pincode" value={pincodeSearch} onChange={(e) => setPincodeSearch(e.target.value.replace(/\D/g, ""))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" />
                    <button onClick={() => lookupPincode()} disabled={pincodeLoading} className="px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all">
                      {pincodeLoading ? "Searching..." : "Lookup"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-1 space-y-2">
                    <div className="text-sm text-gray-600">Lookup results</div>
                    <div className="p-3 bg-white border rounded-xl h-64 overflow-auto">
                      {pincodeLoading && <div className="text-sm text-gray-500">Loading areas...</div>}
                      {!pincodeLoading && pincodeError && <div className="text-sm text-red-600">{pincodeError}</div>}
                      {!pincodeLoading && !pincodeError && (!pincodeResults || pincodeResults.length === 0) && <div className="text-sm text-gray-500">No areas yet — try another pincode</div>}

                      {!pincodeLoading && pincodeResults && pincodeResults.length > 0 && (
                        <div className="space-y-2">
                          {pincodeResults.map((po: any, idx: number) => (
                            <label key={idx} className={`flex items-start gap-3 p-2 border rounded-md cursor-pointer ${selectedPOIndex === idx ? "border-amber-400 bg-amber-50" : "hover:bg-gray-50"}`}>
                              <input type="radio" name="po-select" checked={selectedPOIndex === idx} onChange={() => setSelectedPOIndex(idx)} className="mt-1" />
                              <div className="text-sm">
                                <div className="font-medium">{po.Name}</div>
                                <div className="text-xs text-gray-500">{po.Block ? po.Block + ", " : ""}{po.Division ? po.Division + ", " : ""}{po.District}</div>
                                <div className="text-xs text-gray-400">{po.State} • {po.Country}</div>
                              </div>
                            </label>
                          ))}

                          <div className="pt-2 flex gap-2">
                            <button onClick={() => applySelectedPostOffice(undefined)} disabled={selectedPOIndex == null} className="flex-1 px-3 py-2 bg-amber-500 text-white rounded-md disabled:opacity-50">
                              Apply selected area
                            </button>
                            <button onClick={() => {
                              if (pincodeResults && pincodeResults.length === 1) {
                                setSelectedPOIndex(0);
                                applySelectedPostOffice(0);
                                return;
                              }
                              if (pincodeResults && pincodeResults[0]) {
                                const po = pincodeResults[0];
                                setAddrForm((f) => ({ ...f, pincode: pincodeSearch || f.pincode || "", city: po.District || f.city, state: po.State || f.state, country: po.Country || f.country || "India" }));
                                setShowMapPicker(false);
                                setPincodeResults(null);
                                setPincodeSearch("");
                              }
                            }} className="px-3 py-2 border rounded-md">Autofill city/state</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 h-64 flex flex-col justify-between border-2 border-dashed border-amber-300">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <MapPin className="text-amber-500" size={18} />
                          <div>
                            <div className="font-medium text-gray-800">Map Preview</div>
                            <div className="text-xs text-gray-500">You can use search, current location or pincode results to fill fields</div>
                          </div>
                        </div>

                        <div className="text-sm text-gray-700">
                          Latitude: <span className="font-medium">{mapLocation.lat.toFixed(4)}</span> • Longitude: <span className="font-medium">{mapLocation.lng.toFixed(4)}</span>
                        </div>

                        <div className="mt-3 text-sm text-gray-600">
                          Selected address preview:
                          <div className="mt-2">
                            <div className="text-sm text-gray-800">{addrForm.address_line1 || "Address line 1"}</div>
                            <div className="text-xs text-gray-600">{addrForm.address_line2 || (selectedPOIndex != null && pincodeResults ? pincodeResults[selectedPOIndex].Name : "")}</div>
                            <div className="text-xs text-gray-600">{addrForm.city || ""}{addrForm.city ? ", " : ""}{addrForm.state || ""}{addrForm.pincode ? " - " + addrForm.pincode : ""}</div>
                            <div className="text-xs text-gray-600">{addrForm.country || "India"}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => { reverseGeocode(mapLocation.lat, mapLocation.lng); setShowMapPicker(false); }} className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-xl">
                          Use this location
                        </button>
                        <button onClick={() => setShowMapPicker(false)} className="px-4 py-3 border rounded-xl">Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
