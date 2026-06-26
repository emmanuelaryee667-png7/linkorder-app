import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, CreditCard, Smartphone, Loader2, CheckCircle2, Lock, ArrowRight, Wallet } from "lucide-react";

interface PaystackModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  customerEmail: string;
  vendorName: string;
  onSuccess: (reference: string) => void;
  currencySymbol?: string;
  currencyCode?: string;
}

type PaymentMethod = "card" | "wallet";
type WalletProvider = "apple" | "google" | "paypal";

export default function PaystackModal({
  isOpen,
  onClose,
  amount,
  customerEmail,
  vendorName,
  onSuccess,
  currencySymbol = "₵",
  currencyCode = "GHS",
}: PaystackModalProps) {
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [wallet, setWallet] = useState<WalletProvider>("apple");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [step, setStep] = useState<"input" | "processing" | "wallet_auth" | "otp_prompt" | "success">("input");
  const [cardOtp, setCardOtp] = useState("");

  useEffect(() => {
    if (isOpen) {
      setStep("input");
      setCardOtp("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleWalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("processing");
    setTimeout(() => {
      setStep("wallet_auth");
    }, 1500);
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCvv) return;
    setStep("processing");
    setTimeout(() => {
      setStep("otp_prompt");
    }, 1500);
  };

  const handleWalletAuthorize = () => {
    setStep("processing");
    setTimeout(() => {
      const mockRef = "LNK_WLT_" + Math.floor(Math.random() * 10000000 + 100000);
      setStep("success");
      setTimeout(() => {
        onSuccess(mockRef);
      }, 1500);
    }, 1800);
  };

  const handleOtpAuthorize = () => {
    if (cardOtp.length < 4) return;
    setStep("processing");
    setTimeout(() => {
      const mockRef = "LNK_CARD_" + Math.floor(Math.random() * 10000000 + 100000);
      setStep("success");
      setTimeout(() => {
        onSuccess(mockRef);
      }, 1500);
    }, 1800);
  };

  const getWalletStyle = (prov: WalletProvider) => {
    const isSelected = wallet === prov;
    return isSelected
      ? "border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold"
      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        id="pay-backdrop"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        id="pay-modal-box"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 p-4 text-white">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 font-bold text-white">
              {currencySymbol}
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold tracking-wide">SECURE LINKORDER GATEWAY</h3>
              <p className="text-[10px] text-slate-300">Securing dynamic checkout to {vendorName}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-slate-800 px-2.5 py-1 text-xs text-emerald-400">
            <Lock className="h-3 w-3" />
            <span>SECURE LIVE</span>
          </div>
        </div>

        {/* Transaction Summary Banner */}
        <div className="bg-slate-50 px-5 py-3 flex justify-between items-center text-xs text-slate-600 border-b border-slate-100">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Paying</p>
            <p className="font-medium text-slate-800 truncate max-w-[180px]">{customerEmail}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Amount</p>
            <p className="font-display font-black text-sm text-emerald-600">{currencySymbol}{amount.toFixed(2)}</p>
          </div>
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">
            {step === "input" && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* Tabs */}
                <div className="grid grid-cols-2 gap-2 mb-5">
                  <button
                    type="button"
                    onClick={() => setMethod("card")}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-xs font-semibold transition-colors ${
                      method === "card"
                        ? "border-emerald-500 bg-emerald-50/50 text-emerald-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    Credit / Debit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod("wallet")}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-xs font-semibold transition-colors ${
                      method === "wallet"
                        ? "border-emerald-500 bg-emerald-50/50 text-emerald-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Wallet className="h-4 w-4" />
                    Express Wallet
                  </button>
                </div>

                {method === "card" ? (
                  /* Global Credit Card Form */
                  <form onSubmit={handleCardSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Card Number
                      </label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) =>
                          setCardNumber(
                            e.target.value
                              .replace(/\D/g, "")
                              .replace(/(.{4})/g, "$1 ")
                              .trim()
                              .slice(0, 19)
                          )
                        }
                        placeholder="4000 1234 5678 9010"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) =>
                            setCardExpiry(
                              e.target.value
                                .replace(/\D/g, "")
                                .replace(/(.{2})/, "$1/")
                                .slice(0, 5)
                            )
                          }
                          placeholder="MM/YY"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          CVV Code
                        </label>
                        <input
                          type="password"
                          required
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                          placeholder="123"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!cardNumber || !cardExpiry || !cardCvv}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 uppercase tracking-wider"
                    >
                      Pay Securely {currencySymbol}{amount.toFixed(2)}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                ) : (
                  /* Express Wallets (Apple Pay, Google Pay, PayPal) */
                  <form onSubmit={handleWalletSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Select Instant Wallet Method
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setWallet("apple")}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${getWalletStyle(
                            "apple"
                          )}`}
                        >
                          <span className="font-bold">Apple Pay</span>
                          <span className="text-[8px] text-slate-400 mt-0.5">One-click TouchID</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setWallet("google")}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${getWalletStyle(
                            "google"
                          )}`}
                        >
                          <span className="font-bold text-slate-800">Google Pay</span>
                          <span className="text-[8px] text-slate-400 mt-0.5">Secure Google Pay</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setWallet("paypal")}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${getWalletStyle(
                            "paypal"
                          )}`}
                        >
                          <span className="font-bold text-blue-600">PayPal</span>
                          <span className="text-[8px] text-slate-400 mt-0.5">Instant Checkout</span>
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 uppercase tracking-wider"
                    >
                      Proceed with {wallet === "apple" ? "Apple Pay" : wallet === "google" ? "Google Pay" : "PayPal"}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                )}
              </motion.div>
            )}

            {step === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-10 text-center"
              >
                <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mb-4" />
                <h4 className="font-display font-medium text-slate-800 text-sm">
                  Connecting Global Gateway
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                  Configuring high-speed transaction ledger and calculating international splits...
                </p>
              </motion.div>
            )}

            {step === "wallet_auth" && (
              <motion.div
                key="wallet_auth"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-4 text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-emerald-50 rounded-full p-4 text-emerald-500 border border-emerald-100 flex items-center justify-center animate-pulse">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                </div>
                <h4 className="font-display font-bold text-slate-800 text-base">
                  Authorize {wallet.toUpperCase()} Transaction
                </h4>
                <p className="text-xs text-slate-500 mt-1 mb-5 px-4 leading-normal">
                  Press authorize below to simulate a secure token approval flow for <strong>{currencySymbol}{amount.toFixed(2)}</strong>.
                </p>

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setStep("input")}
                    className="w-1/3 border border-slate-200 text-slate-600 text-xs font-bold py-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleWalletAuthorize}
                    className="w-2/3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Approve Payment
                  </button>
                </div>
              </motion.div>
            )}

            {step === "otp_prompt" && (
              <motion.div
                key="otp_prompt"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-4 text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-50 rounded-full p-4 text-blue-500 border border-blue-100 flex items-center justify-center">
                    <ShieldCheck className="h-8 w-8 animate-bounce" />
                  </div>
                </div>
                <h4 className="font-display font-bold text-slate-800 text-base">
                  3D-Secure Fraud Prevention
                </h4>
                <p className="text-xs text-slate-500 mt-1 mb-4 px-4 leading-normal">
                  A simulated security code has been emitted to your credit card device. Input any mock 4-digit token to verify:
                </p>

                <div className="max-w-[200px] mx-auto bg-slate-100 rounded-xl p-4 border border-slate-200 mb-5">
                  <p className="text-[9px] text-slate-400 mb-1.5 font-bold uppercase tracking-wider">
                    SECURE ACCESS CODE
                  </p>
                  <input
                    type="text"
                    maxLength={4}
                    value={cardOtp}
                    onChange={(e) => setCardOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="1234"
                    className="w-full text-center tracking-widest text-lg font-bold px-3 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setStep("input")}
                    className="w-1/3 border border-slate-200 text-slate-600 text-xs font-bold py-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleOtpAuthorize}
                    disabled={cardOtp.length < 4}
                    className="w-2/3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Authorize Split Payout
                  </button>
                </div>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-10 text-center"
              >
                <div className="mb-4 text-emerald-500 bg-emerald-50 rounded-full p-3 border border-emerald-100">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
                <h4 className="font-display font-bold text-slate-800 text-lg">
                  Authorization Cleared!
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-[240px] leading-normal">
                  Your international payment is settled, and direct automated merchant payout shares are computed.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-5 py-4 flex items-center justify-center gap-2 border-t border-slate-100 text-[10px] text-slate-400 font-bold">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Secured International Multi-Merchant Gateway</span>
        </div>
      </motion.div>
    </div>
  );
}
