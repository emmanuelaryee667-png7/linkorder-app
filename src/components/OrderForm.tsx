import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RefreshCw, ArrowLeft, ShieldCheck, Mail, User, Phone, CheckCircle, ShoppingCart, Image as ImageIcon } from "lucide-react";
import { DashboardData, Product } from "../types";
import PaystackModal from "./PaystackModal";

const CURRENCIES = [
  { code: "GHS", symbol: "GH₵", rate: 1.0, label: "Ghanaian Cedi (₵)" },
  { code: "USD", symbol: "$", rate: 0.067, label: "US Dollar ($)" },
  { code: "EUR", symbol: "€", rate: 0.062, label: "Euro (€)" },
  { code: "GBP", symbol: "£", rate: 0.053, label: "British Pound (£)" },
];

interface OrderFormProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export default function OrderForm({ slug, onNavigate }: OrderFormProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number | "">("");
  const [quantity, setQuantity] = useState(1);
  const [currencyCode, setCurrencyCode] = useState("GHS");

  // Modal and checkout success state
  const [isPaystackOpen, setIsPaystackOpen] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [orderSummary, setOrderSummary] = useState<any>(null);

  const fetchVendorData = async () => {
    try {
      const response = await fetch(`/api/vendors/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("This retail checkout link does not exist or has been modified.");
        }
        throw new Error("Failed to load storefront details");
      }
      const resData: DashboardData = await response.json();
      setData(resData);
      
      // Auto-select first product if catalog exists
      if (resData.products && resData.products.length > 0) {
        setSelectedProductId(resData.products[0].id);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorData();
  }, [slug]);

  const handleQuantityChange = (val: number) => {
    if (val < 1) return;
    setQuantity(val);
  };

  const getSelectedProduct = (): Product | null => {
    if (!data || !selectedProductId) return null;
    return data.products.find((p) => p.id === Number(selectedProductId)) || null;
  };

  const handlePayInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !customerPhone || !selectedProductId) {
      alert("Please provide your name, email, phone number, and choose an offering.");
      return;
    }
    setIsPaystackOpen(true);
  };

  const handlePaymentSuccess = async (reference: string) => {
    setIsPaystackOpen(false);
    if (!data || !selectedProductId) return;

    try {
      const payload = {
        vendorId: data.vendor.id,
        customerName,
        customerEmail,
        customerPhone,
        productId: Number(selectedProductId),
        quantity,
        reference,
      };

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || "Failed to finalize order checkout");

      setOrderSummary(resData.order);
      setIsPaid(true);
    } catch (err: any) {
      alert("Transaction processed successfully, but server callback failed: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-20 text-center">
        <RefreshCw className="h-8 w-8 text-slate-800 animate-spin mb-4" />
        <h3 className="font-display font-medium text-slate-800 text-sm">Loading Secure Gateway...</h3>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-5">
          <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            🔍
          </div>
          <h2 className="font-display font-bold text-lg text-slate-900">Storefront Link Not Found</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {error || "We could not locate a storefront registered under this custom link."}
          </p>
          <button
            onClick={() => onNavigate("/")}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Homepage
          </button>
        </div>
      </div>
    );
  }

  const { vendor, products } = data;
  const currentProduct = getSelectedProduct();
  const unitPrice = currentProduct ? currentProduct.price : 0;
  const totalAmount = unitPrice * quantity;
  const currentCurrency = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 selection:bg-emerald-100 flex flex-col justify-between">
      {/* Header link back */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40 py-4">
        <div className="mx-auto max-w-lg px-6 flex items-center justify-between">
          <button
            onClick={() => onNavigate("/")}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-950 font-bold cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>LinkOrder</span>
          </button>
          
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            Secure Storefront Gateway
          </div>
        </div>
      </header>

      {/* Main section */}
      <main className="flex-grow flex items-center justify-center p-6 py-10 sm:py-16">
        <AnimatePresence mode="wait">
          {!isPaid ? (
            /* Checkout Form Card */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-md w-full bg-white rounded-[24px] border border-slate-200 shadow-xl overflow-hidden"
            >
              {/* Card top branding */}
              <div className="bg-[#0F172A] text-white p-6 sm:p-8 space-y-3.5 relative">
                <div className="absolute inset-y-0 right-0 w-1/4 bg-[radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.1),transparent_70%)]" />
                
                {/* Brand Logo if present */}
                {vendor.logo ? (
                  <div className="h-14 w-14 rounded-full border-2 border-emerald-500 overflow-hidden bg-white flex items-center justify-center">
                    <img src={vendor.logo} alt="Business logo" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full inline-block">
                    Verified Global Storefront
                  </span>
                )}
                
                <h2 className="font-display text-xl sm:text-2xl font-black tracking-tight leading-none text-white">
                  {vendor.businessName}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Provide your details below to place your order securely with <span className="text-slate-200 font-bold">{vendor.businessName}</span>.
                </p>
              </div>

              {/* Card form fields */}
              <form onSubmit={handlePayInitiate} className="p-6 sm:p-8 space-y-5">
                {/* Display Product Image Preview if uploaded */}
                {currentProduct && currentProduct.image && (
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative h-40">
                    <img 
                      src={currentProduct.image} 
                      alt={currentProduct.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-0.5 text-[9px] font-bold rounded-md">
                      Product Preview
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Ama Serwaa"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-slate-850 focus:ring-1 focus:ring-slate-800/10 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="ama@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-slate-850 focus:ring-1 focus:ring-slate-800/10 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Your Contact Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 019-2831"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-slate-850 focus:ring-1 focus:ring-slate-800/10 transition-colors"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    This phone number is requested so the merchant can contact you to update or coordinate shipping.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Select Product / Offering
                    </label>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Currency:</span>
                      <select
                        value={currencyCode}
                        onChange={(e) => setCurrencyCode(e.target.value)}
                        className="bg-transparent border-none text-[10px] text-slate-700 font-black focus:outline-none focus:ring-0 py-0 cursor-pointer"
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.code} ({c.symbol})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {products.length === 0 ? (
                    <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-800 border border-amber-100 font-medium">
                      This business hasn't added catalog items yet.
                    </div>
                  ) : (
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-850 focus:outline-none focus:border-slate-850 focus:ring-1 focus:ring-slate-800/10 transition-colors"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {currentCurrency.symbol}{(p.price * currentCurrency.rate).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {products.length > 0 && (
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                    <div className="space-y-0.5">
                      <span className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Quantity
                      </span>
                      <span className="block text-[10px] text-slate-400">Specify units needed</span>
                    </div>

                    <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-xs">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        className="px-3 py-1.5 hover:bg-slate-50 text-slate-500 font-bold border-r border-slate-100 text-xs transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-4 text-xs font-bold font-mono text-slate-800">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        className="px-3 py-1.5 hover:bg-slate-50 text-slate-500 font-bold border-l border-slate-100 text-xs transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Live Display Calculations */}
                <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Amount Due
                    </span>
                    <span className="text-[11px] text-slate-500 block font-mono">
                      {quantity} unit(s) × {currentCurrency.symbol}{(unitPrice * currentCurrency.rate).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-display font-black text-2xl text-emerald-600 block leading-none">
                      {currentCurrency.symbol}{(totalAmount * currentCurrency.rate).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={products.length === 0 || !customerName || !customerEmail || !customerPhone}
                  className="w-full bg-slate-900 hover:bg-slate-850 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-xs transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  <ShoppingCart className="h-4.5 w-4.5" />
                  Instant Secure Checkout
                </button>
              </form>
            </motion.div>
          ) : (
            /* Success confirmation screen */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10 text-center space-y-6"
            >
              <div className="flex justify-center">
                <div className="bg-emerald-50 rounded-full p-4 text-emerald-600 border border-emerald-100 shadow-inner">
                  <CheckCircle className="h-10 w-10 stroke-[2.5]" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="font-display font-extrabold text-2xl text-slate-900 leading-none">
                  Payment Authorized!
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed max-w-[280px] mx-auto">
                  Your payment of <strong className="text-slate-800">{currentCurrency.symbol}{(totalAmount * currentCurrency.rate).toFixed(2)}</strong> has cleared. Your order is logged and dispatched to <strong className="text-slate-800">{vendor.businessName}</strong>.
                </p>
              </div>

              {orderSummary && (
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 text-left text-xs space-y-2.5">
                  <p className="font-bold text-slate-700 border-b border-slate-200/60 pb-1 text-[10px] uppercase tracking-wider">
                    Receipt Details
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 text-slate-600 font-medium text-[11px]">
                    <span>Receipt No:</span>
                    <span className="text-right font-mono text-slate-900 font-bold">#{orderSummary.id}</span>
                    <span>Item:</span>
                    <span className="text-right text-slate-900 font-bold truncate max-w-[120px]">
                      {orderSummary.productName} (x{orderSummary.quantity})
                    </span>
                    <span>Total Paid:</span>
                    <span className="text-right text-emerald-600 font-bold">
                      {currentCurrency.symbol}{(orderSummary.totalPaid * currentCurrency.rate).toFixed(2)}
                    </span>
                    <span>Reference:</span>
                    <span className="text-right font-mono text-[10px] text-slate-500 truncate max-w-[120px]">
                      {orderSummary.paymentReference}
                    </span>
                    <span>Cleared Date:</span>
                    <span className="text-right text-slate-500 truncate max-w-[120px]">
                      {orderSummary.date}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2.5 pt-2">
                {/* Instant Dial action button so customer can call to check on order */}
                {vendor.phone && (
                  <a
                    href={`tel:${vendor.phone}`}
                    className="w-full flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold py-3 rounded-xl text-xs transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Call Store: {vendor.phone}</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsPaid(false);
                    setCustomerName("");
                    setCustomerEmail("");
                    setCustomerPhone("");
                    setQuantity(1);
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Submit Another Order
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Paystack checkout secure modal (Simulates live wallet/card authorization with dynamic currencies) */}
      <PaystackModal
        isOpen={isPaystackOpen}
        onClose={() => setIsPaystackOpen(false)}
        amount={totalAmount * currentCurrency.rate}
        customerEmail={customerEmail}
        vendorName={vendor.businessName}
        onSuccess={handlePaymentSuccess}
        currencySymbol={currentCurrency.symbol}
        currencyCode={currentCurrency.code}
      />

      {/* Footer bar */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1.5">
        <ShieldCheck className="h-4 w-4 text-emerald-500" />
        <span>Secured Checkout Platform — Standard Dynamic Split Payout Ledger</span>
      </footer>
    </div>
  );
}
