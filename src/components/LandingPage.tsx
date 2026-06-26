import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowRight, Flame, Shield, Sparkles, Smartphone, Percent, Share2, Globe, Lock, Phone, Upload, CheckCircle2, ShoppingCart, Coins } from "lucide-react";
import { Vendor } from "../types";

interface LandingPageProps {
  onNavigate: (path: string) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [logo, setLogo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showcaseVendors, setShowcaseVendors] = useState<Vendor[]>([]);

  // Auto-generate slug from business name
  const handleBusinessNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBusinessName(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // remove special characters
      .replace(/\s+/g, "-") // replace spaces with dashes
      .replace(/-+/g, "-"); // remove double dashes
    setSlug(generatedSlug);
  };

  // Clean custom slug input
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const clean = val.toLowerCase().replace(/[^a-z0-9-_]/g, "");
    setSlug(clean);
  };

  // Convert uploaded logo image to Base64
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Logo file is too large. Please upload an image under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Load registered vendors to show as live demo
  useEffect(() => {
    fetch("/api/vendors")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setShowcaseVendors(data);
        }
      })
      .catch((err) => console.error("Error loading showcase vendors:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !slug || !password || !phone) {
      setError("Please fill out all required credentials.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, slug, password, phone, logo }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to register vendor");
      }

      // Automatically store session flag in localStorage for seamless login redirect
      localStorage.setItem(`LNK_TOKEN_${slug}`, `LNK_SESSION_ACTIVE_${Date.now()}`);

      // Navigate directly to dashboard
      onNavigate(`/dashboard/${data.slug}`);
    } catch (err: any) {
      setError(err.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-900">
      
      {/* Dynamic Animated Backdrop Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] right-[5%] w-[450px] h-[450px] bg-teal-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 font-black font-display text-xl shadow-lg shadow-emerald-500/20">
              L
            </div>
            <div>
              <span className="font-display text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                LinkOrder
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow relative z-10">
        {/* Hero Section */}
        <div className="relative pt-12 pb-20 sm:pt-16 sm:pb-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Hero Left: Intro Text */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>The Universal Link for Instant Social Commerce & Direct Customer Checkout</span>
                </div>
                
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-[1.15]">
                  One link to showcase offerings, capture orders, and get paid{" "}
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400 bg-clip-text text-transparent">
                    instantly
                  </span>.
                </h1>
                
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">
                  Create your clean custom payment form, share it across all social handles, and let customers check out instantly. Zero configuration, simple automatic payouts.
                </p>

                {/* Features Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md pt-2">
                  <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                    <div className="bg-slate-800 p-2 rounded-lg text-emerald-400">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Accept All Payments</h4>
                      <p className="text-[11px] text-slate-400">Mobile Money & cards</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                    <div className="bg-slate-800 p-2 rounded-lg text-emerald-400">
                      <Percent className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">3% Flat Commission</h4>
                      <p className="text-[11px] text-slate-400">Transparent automatic splits</p>
                    </div>
                  </div>
                </div>

                {/* Constantly Moving Flow Diagram */}
                <div className="mt-8 bg-slate-900/40 border border-slate-800 p-5 rounded-2xl max-w-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-xl rounded-full" />
                  
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    Live Settle Pipeline Demo
                  </p>

                  <div className="relative flex items-center justify-between gap-2">
                    {/* Background track line */}
                    <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
                    
                    {/* Animated glowing path indicator */}
                    <motion.div 
                      className="absolute top-1/2 h-0.5 bg-emerald-400 -translate-y-1/2 z-0"
                      initial={{ left: "10%", width: "0%" }}
                      animate={{ 
                        left: ["10%", "10%", "50%", "90%"],
                        width: ["0%", "40%", "40%", "0%"]
                      }}
                      transition={{ 
                        duration: 3.5, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                    />

                    {/* Step 1: Social Bio link */}
                    <div className="z-10 bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-center w-1/3 flex flex-col items-center">
                      <div className="h-7 w-7 bg-emerald-500/15 rounded-lg flex items-center justify-center text-emerald-400 mb-1.5 border border-emerald-500/20">
                        <Globe className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] text-white font-bold leading-none">1. Paste Handle</span>
                      <span className="text-[8px] text-slate-550 mt-1">Bio Profile Link</span>
                    </div>

                    {/* Step 2: Buy page checkout */}
                    <div className="z-10 bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-center w-1/3 flex flex-col items-center relative">
                      {/* Active green indicator dot */}
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-400/50" />
                      <div className="h-7 w-7 bg-blue-500/15 rounded-lg flex items-center justify-center text-blue-400 mb-1.5 border border-blue-500/20">
                        <ShoppingCart className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] text-white font-bold leading-none">2. Client Buys</span>
                      <span className="text-[8px] text-slate-550 mt-1">Forms & Payouts</span>
                    </div>

                    {/* Step 3: Bank Payout */}
                    <div className="z-10 bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-center w-1/3 flex flex-col items-center">
                      <div className="h-7 w-7 bg-amber-500/15 rounded-lg flex items-center justify-center text-amber-400 mb-1.5 border border-amber-500/20">
                        <Coins className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] text-white font-bold leading-none">3. Direct Settle</span>
                      <span className="text-[8px] text-slate-550 mt-1">Automatic Splits</span>
                    </div>
                  </div>

                  {/* Constant moving message ticker */}
                  <div className="mt-4 bg-slate-950/50 border border-slate-800/50 rounded-lg p-2 overflow-hidden relative">
                    <motion.div 
                      className="whitespace-nowrap flex gap-8 text-[9px] text-slate-400 font-semibold font-mono"
                      animate={{ x: [0, -420] }}
                      transition={{ 
                        duration: 18, 
                        repeat: Infinity, 
                        ease: "linear" 
                      }}
                    >
                      <span>⚡ DIRECT SETTLEMENT: CLIENT PAYS GHS ₵450 → SPLIT: STORE GETS GHS ₵436.50 (97.0%) | PLATFORM GETS GHS ₵13.50 (3.0%)</span>
                      <span>⚡ DIRECT SETTLEMENT: CLIENT PAYS GHS ₵120 → SPLIT: STORE GETS GHS ₵116.40 (97.0%) | PLATFORM GETS GHS ₵3.60 (3.0%)</span>
                      <span>⚡ NO SET-UP COST • 24/7 AUTOMATIC CLEARING ENGINE • INSTANT PAYOUT DISPATCH</span>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Hero Right: Sign Up Card */}
              <div className="lg:col-span-5">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="bg-slate-950/70 backdrop-blur-md rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl relative"
                >
                  <div className="absolute top-0 right-10 -translate-y-1/2 bg-emerald-500 text-slate-950 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-emerald-500/20">
                    <Flame className="h-3 w-3 fill-slate-950" />
                    <span>Free Setup</span>
                  </div>

                  <h3 className="font-display text-xl font-black text-white mb-1.5">Launch Your Storefront</h3>
                  <p className="text-xs text-slate-400 mb-6">
                    Fill out your secure business credentials below to capture social media sales instantly.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 font-medium leading-relaxed">
                        ⚠️ {error}
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide">
                        Business Name
                      </label>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={handleBusinessNameChange}
                        placeholder="e.g. Ama Studio"
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide">
                        Custom Link Handle
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={slug}
                          onChange={handleSlugChange}
                          placeholder="ama-studio"
                          className="w-full pl-3.5 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all font-mono"
                        />
                      </div>
                      {slug && (
                        <p className="text-[10px] text-slate-500">
                          Your bio link: <span className="text-emerald-400 font-mono font-bold">/{slug}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide">
                        Security Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 h-3.5 w-3.5 text-slate-500" />
                        <input
                          type="password"
                          required
                          minLength={4}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min 4 characters to protect dashboard"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide">
                        Payout Contact Phone
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3 h-3.5 w-3.5 text-slate-500" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +1 (555) 019-2831"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                        />
                      </div>
                    </div>

                    {/* Logo upload (optional during signup) */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide">
                        Brand Logo (Optional)
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center justify-center gap-2 border border-dashed border-slate-700 bg-slate-900 hover:bg-slate-850 px-4 py-2.5 rounded-xl cursor-pointer text-[11px] text-slate-400 font-semibold transition-colors">
                          <Upload className="h-3.5 w-3.5" />
                          Upload File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                        {logo ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold">
                            <CheckCircle2 className="h-4 w-4" />
                            Logo Loaded
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500">JPEG/PNG, Max 2MB</span>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !businessName || !slug || !password || !phone}
                      className="w-full mt-2 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 disabled:opacity-50 text-slate-950 font-black py-3.5 px-4 rounded-xl text-xs shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-1.5 cursor-pointer transition-all uppercase tracking-wider"
                    >
                      {loading ? "Registering Store..." : "Create My Custom Payment Link"}
                      <ArrowRight className="h-4 w-4 stroke-[3]" />
                    </button>
                  </form>
                </motion.div>
              </div>

            </div>
          </div>
        </div>

        {/* Universal Social Sharing Banner - replaced listed social media fields with beautiful generic text */}
        <div className="bg-slate-950 py-16 border-t border-b border-slate-800/60 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                Zero Configuration Social Selling
              </span>
              <h2 className="font-display text-3xl font-black text-white sm:text-4xl">
                Built for All Social Media Handles
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                No complex catalog settings or tedious listed fields. Copy your custom storefront link and share it directly in your Instagram, TikTok, WhatsApp, Facebook, or Twitter bio handle. Let clients check out instantly with card or mobile wallet in one simple tab.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mb-5 border border-emerald-500/20">
                    <Globe className="h-5 w-5" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-white mb-2">Global Checkout</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Let buyers settle invoices in USD via Apple Pay, Google Pay, PayPal, or any major credit/debit card. No location barriers.
                  </p>
                </div>
                <div className="text-[10px] text-emerald-400/80 font-bold tracking-wider uppercase mt-6">
                  Universal Currency Settle
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mb-5 border border-emerald-500/20">
                    <Percent className="h-5 w-5" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-white mb-2">Automatic Split Fees</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Processing fee rules are calculated at checkout. There's no setup monthly subscription: platform fee is a simple 3.00% split.
                  </p>
                </div>
                <div className="text-[10px] text-emerald-400/80 font-bold tracking-wider uppercase mt-6">
                  Transparent Revenue Split
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mb-5 border border-emerald-500/20">
                    <Share2 className="h-5 w-5" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-white mb-2">One Unified Link</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Paste your link on your bio profiles. Keep conversation brief: send your LinkOrder gateway, secure the checkout, and dial customer phone lines on order clearance.
                  </p>
                </div>
                <div className="text-[10px] text-emerald-400/80 font-bold tracking-wider uppercase mt-6">
                  Social Conversion Booster
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Showcases Section */}
        {showcaseVendors.length > 0 && (
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-10">
              <div className="max-w-2xl">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Global Showcase Directory
                </span>
                <h2 className="font-display text-2xl font-bold text-white mt-1 mb-3">
                  Explore Active Global Social Storefronts
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm mb-6">
                  Click any verified brand storefront to view customer ordering flows or request securely verified backend dashboard panels.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {showcaseVendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {vendor.logo ? (
                        <div className="h-9 w-9 rounded-full overflow-hidden border border-slate-700 bg-white">
                          <img src={vendor.logo} alt="" className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-slate-800">
                          {/* Blank space */}
                        </div>
                      )}
                      <div>
                        <h4 className="font-display font-semibold text-sm text-white truncate max-w-[150px]">
                          {vendor.businessName}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">/{vendor.slug}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 border-t border-slate-800 pt-3 mt-1">
                      <button
                        onClick={() => onNavigate(`/${vendor.slug}`)}
                        className="flex-1 bg-slate-850 hover:bg-slate-800 text-emerald-400 text-xs font-bold py-1.5 px-3 rounded-lg border border-emerald-500/10 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        Buy Page
                      </button>
                      <button
                        onClick={() => onNavigate(`/dashboard/${vendor.slug}`)}
                        className="flex-1 bg-slate-850 hover:bg-slate-800 text-white text-xs font-bold py-1.5 px-3 rounded-lg border border-slate-750 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        Dashboard
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© 2026 LinkOrder. Empowering creators to sell anywhere on Earth.</p>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">SANDBOX MOCK SECURED TRANSACTION ENVIRONMENT</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
