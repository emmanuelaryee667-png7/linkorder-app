import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, Plus, Clipboard, ExternalLink, RefreshCw, Landmark, Calendar, 
  User, ShoppingBag, ShieldCheck, Tag, LayoutDashboard, Layers, Coins, Settings as SettingsIcon, 
  ChevronRight, Sparkles, AlertCircle, Phone, Lock, Upload, LogOut, CheckCircle2, ArrowRight
} from "lucide-react";
import { DashboardData, Product, Order } from "../types";
import PaystackModal from "./PaystackModal";

const CURRENCIES = [
  { code: "GHS", symbol: "GH₵", rate: 1.0, label: "Ghanaian Cedi (₵)" },
  { code: "USD", symbol: "$", rate: 0.067, label: "US Dollar ($)" },
  { code: "EUR", symbol: "€", rate: 0.062, label: "Euro (€)" },
  { code: "GBP", symbol: "£", rate: 0.053, label: "British Pound (£)" },
];

interface DashboardProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export default function Dashboard({ slug, onNavigate }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [currencyCode, setCurrencyCode] = useState("GHS");

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authenticating, setAuthenticating] = useState(false);

  // Active navigation tab in Sleek Interface Sidebar
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders" | "settings">("dashboard");

  // Add Product form state
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductImage, setNewProductImage] = useState("");
  const [addingProduct, setAddingProduct] = useState(false);

  // Settings update form state
  const [settingsBusinessName, setSettingsBusinessName] = useState("");
  const [settingsPhone, setSettingsPhone] = useState("");
  const [settingsLogo, setSettingsLogo] = useState("");
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Withdrawal action state
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawnMsg, setWithdrawnMsg] = useState<string | null>(null);

  // Live Public Preview Phone Simulator States
  const [previewCustomerName, setPreviewCustomerName] = useState("Ama Serwaa");
  const [previewCustomerEmail, setPreviewCustomerEmail] = useState("ama@example.com");
  const [previewCustomerPhone, setPreviewCustomerPhone] = useState("+1 (555) 019-2831");
  const [previewSelectedProductId, setPreviewSelectedProductId] = useState<number | "">("");
  const [previewQuantity, setPreviewQuantity] = useState(1);
  const [isPreviewPaystackOpen, setIsPreviewPaystackOpen] = useState(false);
  const [previewSuccessMsg, setPreviewSuccessMsg] = useState(false);

  // Check login token on mount
  useEffect(() => {
    const token = localStorage.getItem(`LNK_TOKEN_${slug}`);
    if (token) {
      setIsAuthenticated(true);
    }
  }, [slug]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`/api/vendors/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("We couldn't find a storefront registered to this custom link.");
        }
        throw new Error("Failed to fetch dashboard metrics");
      }
      const resData: DashboardData = await response.json();
      setData(resData);
      
      // Seed settings state with existing details
      if (resData.vendor) {
        setSettingsBusinessName(resData.vendor.businessName);
        setSettingsPhone(resData.vendor.phone || "");
        setSettingsLogo(resData.vendor.logo || "");
      }

      // Select first product for phone simulator if none is selected
      if (resData.products && resData.products.length > 0 && !previewSelectedProductId) {
        setPreviewSelectedProductId(resData.products[0].id);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard data once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [slug, isAuthenticated]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput) return;
    setAuthenticating(true);
    setAuthError(null);

    try {
      const response = await fetch(`/api/vendors/${slug}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.error || "Incorrect secure access credentials.");
      }

      localStorage.setItem(`LNK_TOKEN_${slug}`, resJson.token);
      setIsAuthenticated(true);
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthenticating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(`LNK_TOKEN_${slug}`);
    setIsAuthenticated(false);
    setPasswordInput("");
    setData(null);
  };

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Convert uploaded product photo to Base64
  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image is too large. Please upload an image under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProductImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Convert settings logo upload to Base64
  const handleSettingsLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Logo is too large. Please upload an image under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettingsLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !newProductName || !newProductPrice) return;
    setAddingProduct(true);

    try {
      const res = await fetch("/api/products/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: data.vendor.id,
          productName: newProductName,
          productPrice: parseFloat(newProductPrice),
          image: newProductImage // Base64 data string
        }),
      });

      if (!res.ok) throw new Error("Failed to save offering");
      
      setNewProductName("");
      setNewProductPrice("");
      setNewProductImage("");
      await fetchDashboardData(); // Refresh list
    } catch (err) {
      console.error(err);
    } finally {
      setAddingProduct(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setUpdatingSettings(true);
    setSettingsSuccess(false);

    try {
      const res = await fetch(`/api/vendors/${slug}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: settingsBusinessName,
          phone: settingsPhone,
          logo: settingsLogo
        }),
      });

      if (!res.ok) throw new Error("Could not save settings profile.");
      
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.message || "An error occurred.");
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleWithdraw = async () => {
    if (!data || data.vendor.balance <= 0) return;
    setWithdrawing(true);

    try {
      const res = await fetch(`/api/vendors/${slug}/withdraw`, {
        method: "POST",
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Withdraw failed");

      setWithdrawnMsg(resData.message);
      await fetchDashboardData(); // Refresh balance
    } catch (err: any) {
      alert(err.message || "An error occurred during withdrawal simulation.");
    } finally {
      setWithdrawing(false);
    }
  };

  // Preview interactive order submission handler
  const handlePreviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewCustomerName || !previewCustomerEmail || !previewCustomerPhone || !previewSelectedProductId) {
      alert("Please fill in the simulator form first!");
      return;
    }
    setIsPreviewPaystackOpen(true);
  };

  // Callback on successful payment in interactive preview simulator
  const handlePreviewPaymentSuccess = async (reference: string) => {
    setIsPreviewPaystackOpen(false);
    if (!data || !previewSelectedProductId) return;

    try {
      const payload = {
        vendorId: data.vendor.id,
        customerName: previewCustomerName,
        customerEmail: previewCustomerEmail,
        customerPhone: previewCustomerPhone,
        productId: Number(previewSelectedProductId),
        quantity: previewQuantity,
        reference,
      };

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || "Failed to finalize preview order");

      setPreviewSuccessMsg(true);
      setTimeout(() => setPreviewSuccessMsg(false), 5000);
      
      // Reset simulator values or keep them clean
      setPreviewCustomerName("Ama Serwaa");
      setPreviewCustomerEmail("ama@example.com");
      setPreviewCustomerPhone("+1 (555) 728-1930");
      
      // Update merchant logs and ledger balance on screen instantly
      await fetchDashboardData();
    } catch (err: any) {
      alert("Order processed but server callback failed: " + err.message);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "L";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // RENDER LOGIN SCREEN IF NOT AUTHENTICATED
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex flex-col justify-between selection:bg-emerald-100">
        <header className="border-b border-slate-200 bg-white py-4.5">
          <div className="mx-auto max-w-lg px-6 flex items-center justify-between">
            <button
              onClick={() => onNavigate("/")}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-950 font-bold cursor-pointer transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>LinkOrder</span>
            </button>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              Verified Control Center
            </div>
          </div>
        </header>

        <main className="flex-grow flex items-center justify-center p-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden"
          >
            <div className="bg-slate-900 text-white p-6 sm:p-8 space-y-2 relative">
              <div className="absolute inset-y-0 right-0 w-1/4 bg-[radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.1),transparent_70%)]" />
              <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full inline-block">
                Secure Storefront Authorization
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-black tracking-tight leading-none text-white">
                Dashboard Log In
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Provide your custom storefront passcode to manage products, view client phone logs, and access real-time payout settings.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="p-6 sm:p-8 space-y-5">
              {authError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold border border-red-200">
                  ⚠️ {authError}
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Store ID Handle
                  </label>
                  <span className="text-[10px] text-emerald-600 font-mono font-bold">/{slug}</span>
                </div>
                <input
                  type="text"
                  disabled
                  value={slug}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Secure Password Key
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/15 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authenticating || !passwordInput}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-lg flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
              >
                {authenticating ? "Verifying..." : "Access Dashboard"}
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="text-center pt-2">
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                  First time visiting? Legacy store profiles are secured with the default passcode <span className="text-emerald-600 font-mono font-bold">admin</span>. Please change it inside Settings!
                </p>
              </div>
            </form>
          </motion.div>
        </main>

        <footer className="bg-white border-t border-slate-200 py-4 text-center text-[10px] text-slate-400 font-bold">
          Protected by LinkOrder Cryptographic Access Controls
        </footer>
      </div>
    );
  }

  // RENDER STANDARD LOADING SCREEN IF LOADING DB ATTACHMENTS
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex flex-col justify-center items-center py-20 text-center">
        <RefreshCw className="h-8 w-8 text-slate-850 animate-spin mb-4" />
        <h3 className="font-display font-medium text-slate-800 text-sm">Synchronizing Ledger Accounts...</h3>
      </div>
    );
  }

  // RENDER GENERIC ERROR SCREEN IF LOAD FAILED
  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center space-y-5">
          <div className="h-12 w-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="font-display font-bold text-lg text-slate-900">Dashboard Unresolved</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {error || "We could not fetch data for this storefront."}
          </p>
          <button
            onClick={() => onNavigate("/")}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Homepage
          </button>
        </div>
      </div>
    );
  }

  const { vendor, products: rawProducts, orders } = data;
  const currentCurrency = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];
  
  // Sort products to ensure stable layout order
  const products = [...rawProducts].sort((a, b) => b.id - a.id);

  // Compute stats in base currency (Cedis GHS)
  const totalReceivedVolume = orders.reduce((acc, curr) => acc + curr.totalPaid, 0);
  const totalProcessingFees = orders.reduce((acc, curr) => acc + curr.paystackFeePaid, 0);
  const totalPlatformCommissions = orders.reduce((acc, curr) => acc + curr.commissionPaid, 0);

  // Selected product's price for the interactive preview mock phone
  const getPreviewSelectedProductPrice = (): number => {
    if (!previewSelectedProductId) return 0;
    const prod = products.find((p) => p.id === Number(previewSelectedProductId));
    return prod ? prod.price : 0;
  };

  const previewUnitPrice = getPreviewSelectedProductPrice();
  const previewTotalAmount = previewUnitPrice * previewQuantity;

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 font-sans flex overflow-hidden">
      
      {/* Sleek Sidebar Left */}
      <aside className="w-64 bg-[#0F172A] flex flex-col shrink-0 hidden lg:flex">
        <div className="p-8 flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center gap-2 mb-12">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-slate-950 font-black text-lg">{currentCurrency.symbol}</span>
              </div>
              <span className="text-white font-black text-xl tracking-tight">LinkOrder</span>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors text-left text-xs font-bold uppercase tracking-wider ${
                  activeTab === "dashboard" ? "bg-white/10 text-white" : "text-slate-450 hover:text-white hover:bg-white/5"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                <span>Dashboard</span>
              </button>
              
              <button
                onClick={() => setActiveTab("products")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors text-left text-xs font-bold uppercase tracking-wider ${
                  activeTab === "products" ? "bg-white/10 text-white" : "text-slate-450 hover:text-white hover:bg-white/5"
                }`}
              >
                <Layers className="w-4 h-4 text-teal-400" />
                <span>Catalog Items</span>
              </button>

              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors text-left text-xs font-bold uppercase tracking-wider ${
                  activeTab === "orders" ? "bg-white/10 text-white" : "text-slate-450 hover:text-white hover:bg-white/5"
                }`}
              >
                <Coins className="w-4 h-4 text-blue-400" />
                <span>Orders Feed</span>
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors text-left text-xs font-bold uppercase tracking-wider ${
                  activeTab === "settings" ? "bg-white/10 text-white" : "text-slate-450 hover:text-white hover:bg-white/5"
                }`}
              >
                <SettingsIcon className="w-4 h-4 text-purple-400" />
                <span>Store Settings</span>
              </button>
            </nav>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700">
              <p className="text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-1">Global Payout Mode</p>
              <p className="text-slate-300 text-[11px] leading-relaxed">Direct deposit to International Bank or PayPal activated.</p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl cursor-pointer hover:bg-red-500/10 text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Sleek Header Bar */}
        <header className="h-20 bg-white border-b border-slate-200 px-6 sm:px-10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {vendor.logo ? (
              <div className="h-10 w-10 rounded-full border border-slate-200 overflow-hidden shrink-0 bg-white">
                <img src={vendor.logo} alt="" className="h-full w-full object-cover" />
              </div>
            ) : null}
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight leading-tight">{vendor.businessName}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-xs text-slate-500 font-medium tracking-tight">linkorder.com/{vendor.slug}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5">
            <select
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-450"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>

            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 transition-colors cursor-pointer"
            >
              {copied ? "Copied Link!" : "Copy Public Link"}
            </button>
            
            <a
              href={`/${vendor.slug}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors uppercase tracking-wider"
            >
              <span>View Buy Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => onNavigate("/")}
              className="px-3 py-2 text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Switch Portal</span>
            </button>

            <button
              onClick={handleLogout}
              className="lg:hidden p-2 text-red-500 hover:bg-red-50 rounded-xl border border-slate-200"
              title="Log Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Mobile Responsive Navigation Bar (Only visible if screen width < 1024px) */}
        <div className="lg:hidden flex bg-white border-b border-slate-200 px-4 py-2.5 gap-1.5 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "dashboard" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "products" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Offerings
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "orders" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Orders Logs
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "settings" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Settings
          </button>
        </div>

        {/* Scrollable Layout Body */}
        <div className="p-5 sm:p-8 lg:p-10 flex gap-8 flex-1 overflow-y-auto">
          
          {/* Main Panel Content Column */}
          <div className="flex-[1.5] space-y-8 flex flex-col">
            
            {/* Withdrawal Success Dialog Toast */}
            <AnimatePresence>
              {withdrawnMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                    <span>{withdrawnMsg}</span>
                  </div>
                  <button
                    onClick={() => setWithdrawnMsg(null)}
                    className="text-[10px] uppercase font-bold text-emerald-600 hover:text-emerald-800 px-2 py-1"
                  >
                    Dismiss
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TAB CONTENT: DASHBOARD OVERVIEW */}
            {activeTab === "dashboard" && (
              <div className="space-y-8 flex flex-col">
                
                {/* 2-Column Main Bento Row: Balance & Total Sales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left Bento: Available Balance */}
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-[24px] text-white shadow-lg shadow-emerald-200/50 flex flex-col justify-between">
                    <div>
                      <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-2">Available Balance</p>
                      <h2 className="text-3xl font-bold mb-4 tracking-tight">{currentCurrency.symbol}{(vendor.balance * currentCurrency.rate).toFixed(2)}</h2>
                    </div>
                    <button
                      onClick={handleWithdraw}
                      disabled={withdrawing || vendor.balance <= 0}
                      className="w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl font-bold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                    >
                      <Landmark className="w-4 h-4" />
                      {withdrawing ? "Processing..." : "Initiate Global Payout"}
                    </button>
                  </div>

                  {/* Right Bento: Total Orders Stats Card with Histograms */}
                  <div className="bg-white p-6 rounded-[24px] border border-slate-200 flex flex-col justify-between relative overflow-hidden">
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Sales Orders</p>
                      <h2 className="text-3xl font-bold text-slate-800 mb-1 tracking-tight">{orders.length}</h2>
                      <p className="text-emerald-500 text-xs font-bold">Gross Volume: {currentCurrency.symbol}{(totalReceivedVolume * currentCurrency.rate).toFixed(2)}</p>
                    </div>

                    {/* Styled Micro Histogram Graph Bars at bottom of total sales card */}
                    <div className="mt-6 flex gap-1 h-10 items-end">
                      {Array.from({ length: 14 }).map((_, i) => {
                        const hasOrders = orders.length > 0;
                        const heightFactor = hasOrders
                          ? Math.min(100, Math.max(15, (orders.filter(o => o.id % 5 === i % 5).length / orders.length) * 120))
                          : (15 + (Math.sin(i * 0.9) + 1) * 35);
                        return (
                          <div key={i} className="h-full w-full bg-slate-50 rounded-xs flex flex-col justify-end overflow-hidden">
                            <div 
                              className="bg-emerald-400 w-full transition-all duration-700" 
                              style={{ height: `${heightFactor}%` }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Flat Splits Overview Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="bg-white border border-slate-200 rounded-[20px] p-5 shadow-xs">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                      Gross Volume
                    </p>
                    <p className="font-display text-lg font-bold text-slate-800">
                      {currentCurrency.symbol}{(totalReceivedVolume * currentCurrency.rate).toFixed(2)}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      From {orders.length} total orders
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-[20px] p-5 shadow-xs">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                      Processing fees (1.95%)
                    </p>
                    <p className="font-display text-lg font-bold text-slate-800">
                      {currentCurrency.symbol}{(totalProcessingFees * currentCurrency.rate).toFixed(2)}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      Secure global routing splits
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-[20px] p-5 shadow-xs">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                      Platform cut (3.0%)
                    </p>
                    <p className="font-display text-lg font-bold text-slate-800">
                      {currentCurrency.symbol}{(totalPlatformCommissions * currentCurrency.rate).toFixed(2)}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      LinkOrder maintenance split
                    </p>
                  </div>
                </div>

                {/* Recent Incoming Orders Table Card */}
                <div className="bg-white rounded-[24px] border border-slate-200 flex flex-col overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">Recent Incoming Orders</h3>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-xs text-blue-650 font-bold cursor-pointer hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    {orders.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-xs">No orders received yet. Use the simulator to test.</div>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-3">Customer Contact</th>
                            <th className="px-6 py-3">Item Ordered</th>
                            <th className="px-6 py-3">Revenue Splits</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs divide-y divide-slate-100 font-medium text-slate-600">
                          {orders.slice(0, 5).map((order) => {
                            const netEarnings = order.totalPaid - order.paystackFeePaid - order.commissionPaid;
                            return (
                              <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                  <span className="font-bold text-slate-800 block text-sm">{order.customerName}</span>
                                  <span className="text-[10px] text-slate-400 block mt-0.5">{order.customerEmail}</span>
                                  {order.customerPhone && (
                                    <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">{order.customerPhone}</span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-slate-700 font-semibold block">{order.productName}</span>
                                  <span className="text-[10px] text-slate-400 block mt-0.5">Qty: {order.quantity}</span>
                                </td>
                                <td className="px-6 py-4 font-mono">
                                  <span className="font-bold text-slate-800 block">Total: {currentCurrency.symbol}{(order.totalPaid * currentCurrency.rate).toFixed(2)}</span>
                                  <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Net: {currentCurrency.symbol}{(netEarnings * currentCurrency.rate).toFixed(2)}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  {order.customerPhone ? (
                                    <a
                                      href={`tel:${order.customerPhone}`}
                                      className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-850 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors"
                                    >
                                      <Phone className="h-3 w-3" />
                                      Call Client
                                    </a>
                                  ) : (
                                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                      PAID
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: PRODUCTS CATALOG */}
            {activeTab === "products" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Form Adder (Left) */}
                <div className="md:col-span-5 bg-white border border-slate-200 rounded-[24px] p-6 shadow-xs space-y-5">
                  <h3 className="font-display font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Tag className="h-4 w-4 text-emerald-500" />
                    Add Offering
                  </h3>

                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider">
                        Product/Service Title
                      </label>
                      <input
                        type="text"
                        required
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                        placeholder="e.g. Premium Logo Pack"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-slate-800 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider">
                        Price (₵ GHS)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={newProductPrice}
                        onChange={(e) => setNewProductPrice(e.target.value)}
                        placeholder="e.g. 150.00"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-slate-800 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider">
                        Offering Image (Optional)
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center justify-center gap-2 border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 px-4 py-2.5 rounded-xl cursor-pointer text-xs text-slate-600 transition-colors">
                          <Upload className="h-3.5 w-3.5 text-slate-400" />
                          <span>Choose File</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProductImageUpload}
                            className="hidden"
                          />
                        </label>
                        {newProductImage ? (
                          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                            <CheckCircle2 className="h-4 w-4" />
                            Loaded
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">Max size 2MB</span>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={addingProduct || !newProductName || !newProductPrice}
                      className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer uppercase tracking-wider"
                    >
                      <Plus className="h-4 w-4" />
                      {addingProduct ? "Saving..." : "Save Product"}
                    </button>
                  </form>
                </div>

                {/* Offerings list (Right) */}
                <div className="md:col-span-7 bg-white border border-slate-200 rounded-[24px] p-6 shadow-xs space-y-4">
                  <h3 className="font-display font-bold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                    Current Catalog Offerings
                  </h3>

                  <div className="divide-y divide-slate-100 overflow-hidden">
                    {products.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No services configured yet.</p>
                    ) : (
                      products.map((product) => (
                        <div key={product.id} className="py-4 flex items-center justify-between text-xs hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                          <div className="flex items-center gap-3">
                            {product.image ? (
                              <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-white">
                                <img src={product.image} alt="" className="h-full w-full object-cover" />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
                                <ShoppingBag className="h-4.5 w-4.5 text-slate-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900 text-sm leading-snug">{product.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">ID: #{product.id}</p>
                            </div>
                          </div>
                          <span className="font-display font-black text-slate-800 bg-slate-100 px-3 py-1.5 rounded-md">
                            {currentCurrency.symbol}{(product.price * currentCurrency.rate).toFixed(2)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: ORDERS FEED */}
            {activeTab === "orders" && (
              <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-xs space-y-4">
                <h3 className="font-display font-bold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                  Incoming Orders & Sales Feed
                </h3>

                <div className="overflow-x-auto">
                  {orders.length === 0 ? (
                    <div className="text-center py-12 space-y-2">
                      <p className="text-2xl">📥</p>
                      <p className="text-xs font-semibold text-slate-600">No client orders placed yet.</p>
                      <p className="text-[10px] text-slate-400 max-w-[250px] mx-auto">
                        Share your payment link across all your social media bio pages to start collecting instant sales.
                      </p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="p-4 font-semibold">Customer info</th>
                          <th className="p-4 font-semibold">Item Ordered</th>
                          <th className="p-4 font-semibold text-right">Revenue Split ({currentCurrency.code})</th>
                          <th className="p-4 text-right font-semibold">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {orders.map((order) => {
                          const netEarnings = order.totalPaid - order.paystackFeePaid - order.commissionPaid;
                          return (
                            <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4">
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <User className="h-3.5 w-3.5 text-slate-400" />
                                  {order.customerName}
                                </div>
                                <div className="text-[11px] text-slate-400 font-semibold truncate max-w-[140px] mt-0.5 ml-5">
                                  {order.customerEmail}
                                </div>
                                {order.customerPhone && (
                                  <div className="text-[11px] text-emerald-600 font-bold mt-0.5 ml-5 flex items-center gap-1">
                                    <Phone className="h-2.5 w-2.5" />
                                    <a href={`tel:${order.customerPhone}`} className="hover:underline">{order.customerPhone}</a>
                                  </div>
                                )}
                              </td>
                              <td className="p-4">
                                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                                  <ShoppingBag className="h-3.5 w-3.5 text-slate-400" />
                                  {order.productName}
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5 ml-5">
                                  Qty: {order.quantity} × {currentCurrency.symbol}{((order.totalPaid / order.quantity) * currentCurrency.rate).toFixed(2)}
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <span className="font-display font-black text-slate-900 block text-base">
                                  {currentCurrency.symbol}{(order.totalPaid * currentCurrency.rate).toFixed(2)}
                                </span>
                                <div className="text-[9px] text-slate-500 leading-normal mt-0.5 font-bold uppercase tracking-wide">
                                  Net: <strong className="text-emerald-600">{currentCurrency.symbol}{(netEarnings * currentCurrency.rate).toFixed(2)}</strong>
                                  <span className="mx-1">|</span>
                                  Platform: {currentCurrency.symbol}{(order.commissionPaid * currentCurrency.rate).toFixed(2)}
                                  <span className="mx-1">|</span>
                                  Fee: {currentCurrency.symbol}{(order.paystackFeePaid * currentCurrency.rate).toFixed(2)}
                                </div>
                              </td>
                              <td className="p-4 text-right text-[11px] text-slate-400 font-medium">
                                <div className="flex items-center justify-end gap-1 font-semibold text-slate-600">
                                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                  {order.date.split(",")[0]}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">{order.date.split(",")[1]?.trim()}</div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: STORE SETTINGS */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                
                {/* Store Profile Customization (Name, Phone, Logo) */}
                <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-xs space-y-5">
                  <h3 className="font-display font-bold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                    Customize Brand & Payout Profile
                  </h3>

                  <form onSubmit={handleUpdateSettings} className="space-y-4">
                    {settingsSuccess && (
                      <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200">
                        ✓ Store profile customizations updated successfully!
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider">
                          Business Public Name
                        </label>
                        <input
                          type="text"
                          required
                          value={settingsBusinessName}
                          onChange={(e) => setSettingsBusinessName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-slate-800 transition-colors font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider">
                          Store Contact Phone Number
                        </label>
                        <input
                          type="tel"
                          required
                          value={settingsPhone}
                          onChange={(e) => setSettingsPhone(e.target.value)}
                          placeholder="e.g. +1 (555) 019-2831"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-slate-800 transition-colors font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider">
                        Business Logo Image (JPEG/PNG, Max 2MB)
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center justify-center gap-2 border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 px-4 py-2.5 rounded-xl cursor-pointer text-xs text-slate-600 transition-colors">
                          <Upload className="h-3.5 w-3.5 text-slate-400" />
                          <span>Choose Logo File</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleSettingsLogoUpload}
                            className="hidden"
                          />
                        </label>
                        {settingsLogo ? (
                          <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-full overflow-hidden border border-slate-200 bg-white shrink-0">
                              <img src={settingsLogo} alt="Logo thumbnail" className="h-full w-full object-cover" />
                            </div>
                            <span className="text-[10px] text-emerald-600 font-bold">Logo Loaded</span>
                            <button
                              type="button"
                              onClick={() => setSettingsLogo("")}
                              className="text-[9px] text-red-500 font-bold hover:underline"
                            >
                              Clear
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">No logo currently uploaded</span>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={updatingSettings}
                      className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors uppercase tracking-wider cursor-pointer"
                    >
                      {updatingSettings ? "Saving Settings..." : "Save Customizations"}
                    </button>
                  </form>
                </div>

                <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-xs space-y-4">
                  <h3 className="font-display font-bold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                    Universal Copy URL settings
                  </h3>
                  <p className="text-xs text-slate-500">
                    Your customized storefront is instantly ready. Simply paste your unique checkout link in your social bio handles to start capturing sales.
                  </p>

                  <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Secure Direct Gateway Link</span>
                      <p className="text-xs font-mono text-emerald-600 font-bold truncate max-w-[320px]">
                        {window.location.origin}/{vendor.slug}
                      </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto shrink-0">
                      <button
                        onClick={handleCopyLink}
                        className="flex-1 sm:flex-none bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold py-2.5 px-4 rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Clipboard className="w-4 h-4 text-slate-400" />
                        {copied ? "Copied!" : "Copy Link"}
                      </button>
                      <a
                        href={`/${vendor.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 sm:flex-none bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        Test Live Gateway
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sleek Phone Mock Device Preview */}
          <div className="flex-1 max-w-[310px] hidden xl:flex flex-col shrink-0">
            <div className="w-full max-w-[280px] mx-auto h-[580px] bg-slate-900 border-[10px] border-slate-950 rounded-[44px] shadow-2xl relative overflow-hidden flex flex-col">
              
              {/* Phone Speaker Notch */}
              <div className="h-5 bg-slate-950 w-28 mx-auto rounded-b-2xl absolute top-0 left-1/2 -translate-x-1/2 z-10"></div>
              
              {/* Phone Content Screen */}
              <div className="bg-[#F8FAFC] p-4.5 pt-8 flex flex-col h-full overflow-hidden select-none">
                
                {/* Simulator Live Badge */}
                <div className="mx-auto flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-full text-[8px] font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                  <span>Sandbox Simulator</span>
                </div>

                {previewSuccessMsg ? (
                  /* Success Feedback inside Phone */
                  <div className="flex-1 flex flex-col justify-center items-center text-center p-2 space-y-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full border border-emerald-100 flex items-center justify-center shadow-inner">
                      <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <h5 className="font-bold text-slate-800 text-xs">Payment Cleared!</h5>
                    <p className="text-[9px] text-slate-400 leading-normal">
                      The transaction registered successfully. Your dashboard metrics have updated.
                    </p>
                  </div>
                ) : (
                  /* Live Form Preview */
                  <form onSubmit={handlePreviewSubmit} className="flex-col flex-1 flex overflow-hidden">
                    
                    {vendor.logo ? (
                      <div className="h-10 w-10 rounded-full overflow-hidden border border-slate-200 bg-white mx-auto mb-1 flex items-center justify-center shrink-0">
                        <img src={vendor.logo} alt="" className="h-full w-full object-cover" />
                      </div>
                    ) : null}
                    
                    <h4 className="text-center font-bold text-slate-850 text-xs leading-none truncate max-w-[150px] mx-auto">
                      {vendor.businessName}
                    </h4>
                    
                    <p className="text-[7.5px] text-center text-slate-400 mb-2.5 tracking-wider uppercase font-bold">
                      Verified Checkout
                    </p>

                    <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                      
                      {/* Name field */}
                      <div className="space-y-0.5">
                        <label className="text-[7px] font-bold text-slate-400 uppercase tracking-wide block">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={previewCustomerName}
                          onChange={(e) => setPreviewCustomerName(e.target.value)}
                          className="w-full h-7 bg-white border border-slate-200 rounded-lg px-2 text-[9px] focus:outline-none focus:border-slate-850 text-slate-800 font-medium"
                          placeholder="e.g. Ama Serwaa"
                        />
                      </div>

                      {/* Email field */}
                      <div className="space-y-0.5">
                        <label className="text-[7px] font-bold text-slate-400 uppercase tracking-wide block">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={previewCustomerEmail}
                          onChange={(e) => setPreviewCustomerEmail(e.target.value)}
                          className="w-full h-7 bg-white border border-slate-200 rounded-lg px-2 text-[9px] focus:outline-none focus:border-slate-850 text-slate-800 font-medium"
                          placeholder="ama@example.com"
                        />
                      </div>

                      {/* Phone field */}
                      <div className="space-y-0.5">
                        <label className="text-[7px] font-bold text-slate-400 uppercase tracking-wide block">
                          Your Phone Number
                        </label>
                        <input
                          type="tel"
                          required
                          value={previewCustomerPhone}
                          onChange={(e) => setPreviewCustomerPhone(e.target.value)}
                          className="w-full h-7 bg-white border border-slate-200 rounded-lg px-2 text-[9px] focus:outline-none focus:border-slate-850 text-slate-800 font-medium"
                          placeholder="e.g. +1 (555) 123-4567"
                        />
                      </div>

                      {/* Offer selection */}
                      <div className="space-y-0.5">
                        <label className="text-[7px] font-bold text-slate-400 uppercase tracking-wide block">
                          Select offering
                        </label>
                        {products.length === 0 ? (
                          <div className="p-2 bg-amber-50 text-[9px] text-amber-700 rounded-lg border border-amber-100">
                            No offerings available yet.
                          </div>
                        ) : (
                          <select
                            value={previewSelectedProductId}
                            onChange={(e) => setPreviewSelectedProductId(Number(e.target.value))}
                            className="w-full h-7 bg-white border border-slate-200 rounded-lg px-2 text-[9px] focus:outline-none focus:border-slate-850 text-slate-700 font-bold"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} — {currentCurrency.symbol}{(p.price * currentCurrency.rate).toFixed(2)}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Total and Processed notification */}
                      {products.length > 0 && (
                        <div className="p-2 bg-blue-50 border border-blue-100 rounded-xl">
                          <div className="flex justify-between items-center">
                            <span className="text-[8px] font-bold text-blue-900 uppercase">Total Due</span>
                            <span className="text-[11px] font-black text-blue-900">
                              {currentCurrency.symbol}{(previewTotalAmount * currentCurrency.rate).toFixed(2)}
                            </span>
                          </div>
                          <p className="text-[7px] text-blue-600 mt-0.5 leading-none font-bold">
                            Secured by LinkOrder
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-auto pt-2 shrink-0">
                      <button
                        type="submit"
                        disabled={products.length === 0}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold rounded-xl text-[9px] uppercase tracking-wider mb-1 cursor-pointer transition-colors"
                      >
                        Complete Payment
                      </button>
                      <div className="flex justify-center gap-1 py-0.5">
                         <div className="w-2.5 h-1 bg-slate-200 rounded-full"></div>
                         <div className="w-2.5 h-1 bg-slate-200 rounded-full"></div>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
            
            <p className="text-center text-slate-400 text-[10px] font-black mt-3 tracking-widest uppercase">
              Interactive Public Preview
            </p>
          </div>

        </div>
      </main>

      {/* Paystack simulator checkout modal for the interactive preview */}
      <PaystackModal
        isOpen={isPreviewPaystackOpen}
        onClose={() => setIsPreviewPaystackOpen(false)}
        amount={previewTotalAmount}
        customerEmail={previewCustomerEmail}
        vendorName={vendor.businessName}
        onSuccess={handlePreviewPaymentSuccess}
      />

    </div>
  );
}
