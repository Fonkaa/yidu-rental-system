import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PaymentScreen = ({ leaseId, rentAmount, tenantEmail, tenantName, tenantPhone, successReturn, txRefReturn }) => {
  const navigate = useNavigate();
  const receiptRef = useRef();

  const queryParams = new URLSearchParams(window.location.search);
  const isSuccessReturn = successReturn || queryParams.get('success') === 'true';
  const txRefReturnFinal = txRefReturn || queryParams.get('tx_ref');

  const [viewMode, setViewMode] = useState(isSuccessReturn ? 'receipt' : 'checkout');
  const [transactionRef, setTransactionRef] = useState(txRefReturnFinal || 'TX-0E865EA9-1786516303040');
  const [selectedMethod, setSelectedMethod] = useState('TELEBIRR');
  const [selectedBank, setSelectedBank] = useState('Commercial Bank of Ethiopia (CBE)');
  const [accountInput, setAccountInput] = useState(tenantPhone || '0901072272');
  
  const [verifiedAmount, setVerifiedAmount] = useState(Number(rentAmount) * 1.10 || 5500);
  const [verifiedStatus, setVerifiedStatus] = useState('Paid / ተከፍሏል');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const numericRent = Number(rentAmount) || 5000;
  const commission = numericRent * 0.10; 
  const subTotal = numericRent + commission;
  const charge = subTotal * 0.025; 
  const total = subTotal + charge; 

  const methodDetails = {
    TELEBIRR: { 
      label: 'Telebirr', 
      logoUrl: 'https://www.ethiotelecom.et/wp-content/uploads/2025/10/telebirr-logo-01.png', 
      tagline: 'Ethio Telecom Mobile Money', 
      fallbackBadge: '⚡' 
    },
    CBE_BIRR: { 
      label: 'CBE Birr', 
      logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROYGQgVvScBI7pfAfj-bhlmOOWpOshV-TWViSzlXXcLJ_WsH3-MK-mDORFb7B5dl0&s=10&ec=121924532', 
      tagline: 'Commercial Bank of Ethiopia', 
      fallbackBadge: '🏦' 
    },
    BANK: { 
      label: 'Direct Bank', 
      logoUrl: '', 
      tagline: 'Abyssinia, Dashen & Awash', 
      fallbackBadge: '🏛️' 
    },
    CARD: { 
      label: 'Cards', 
      logoUrl: '', 
      tagline: 'Visa / Mastercard', 
      fallbackBadge: '💳' 
    },
  };

  const specificBanks = [
    "Commercial Bank of Ethiopia (CBE)",
    "Bank of Abyssinia",
    "Dashen Bank",
    "Oromia Bank",
    "Awash Bank",
    "Telebirr Mobile Wallet"
  ];

  useEffect(() => {
    if (isSuccessReturn && txRefReturnFinal) {
      setViewMode('receipt');
      setTransactionRef(txRefReturnFinal);
    }
  }, [isSuccessReturn, txRefReturnFinal]);

  const handlePayWithChapa = async () => {
    setError(null);
    const cleanedInput = accountInput.trim();

    if (selectedMethod === 'TELEBIRR' || selectedMethod === 'CBE_BIRR') {
      const phoneRegex = /^(09|07|\+?251)\d{8,9}$/;
      if (!phoneRegex.test(cleanedInput)) {
        setError("Please enter a valid Ethiopian phone number (e.g., 0911223344).");
        return;
      }
    } else if (selectedMethod === 'CARD') {
      const cardRegex = /^\d{16}$/;
      if (!cardRegex.test(cleanedInput.replace(/\s+/g, ''))) {
        setError("Please enter a valid 16-digit card number.");
        return;
      }
    } else if (selectedMethod === 'BANK') {
      if (selectedBank === "Commercial Bank of Ethiopia (CBE)") {
        if (!/^1000\d{9}$/.test(cleanedInput)) {
          setError("Invalid CBE account number. Must be 13 digits starting with 1000.");
          return;
        }
      } else if (selectedBank === "Bank of Abyssinia") {
        if (!/^(01|11)\d{11}$/.test(cleanedInput)) {
          setError("Invalid Abyssinia account number. Must be 13 digits starting with 01 or 11.");
          return;
        }
      } else if (selectedBank === "Dashen Bank") {
        if (!/^01\d{11}$/.test(cleanedInput)) {
          setError("Invalid Dashen Bank account number. Must be 13 digits starting with 01.");
          return;
        }
      } else if (selectedBank === "Oromia Bank") {
        if (!/^101\d{10}$/.test(cleanedInput)) {
          setError("Invalid Oromia Bank account number. Must be 13 digits starting with 101.");
          return;
        }
      } else if (selectedBank === "Awash Bank") {
        if (!/^013\d{10}$/.test(cleanedInput)) {
          setError("Invalid Awash Bank account number. Must be 13 digits starting with 013.");
          return;
        }
      } else {
        if (!/^\d{10,16}$/.test(cleanedInput)) {
          setError("Please enter a valid bank account number (10 to 16 digits).");
          return;
        }
      }
    }

    setLoading(true);

    const finalLabel = selectedMethod === 'BANK' ? selectedBank : (methodDetails[selectedMethod]?.label || selectedMethod);
    localStorage.setItem('active_payment_label', finalLabel);

    try {
      const response = await axios.post('http://localhost:5000/api/payments/initiate', {
        leaseId,
        amount: numericRent,
        email: tenantEmail,
        firstName: tenantName?.split(' ')[0] || 'Tenant',
        lastName: tenantName?.split(' ')[1] || 'User',
        phoneNumber: selectedMethod === 'BANK' || selectedMethod === 'CARD' ? '0901072272' : cleanedInput,
        method: selectedMethod,
        specificBank: selectedMethod === 'BANK' ? selectedBank : null
      });

      if (response.data?.success && response.data?.data?.checkout_url) {
        window.location.href = response.data.data.checkout_url;
      } else {
        throw new Error('Failed to generate secure checkout redirect link.');
      }
    } catch (err) {
      console.error('Payment Error:', err);
      const serverMessage = err.response?.data?.error;
      setError(typeof serverMessage === 'string' ? serverMessage : err.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  const handleGoHome = () => { navigate('/'); };
  const handleDoneViewingReceipt = () => {
    window.history.replaceState({}, document.title, window.location.pathname);
    setViewMode('checkout');
  };

  const handleDownloadPDF = () => {
    const printContent = receiptRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = `<div style="width: 100%; max-width: 800px; margin: 0 auto; font-family: sans-serif;">${printContent}</div>`;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const handleCopyReceipt = () => {
    const receiptText = `OFFICIAL CHAPA RECEIPT\n` +
      `Merchant: Executive Real Estate\n` +
      `Payer Name: ${tenantName || 'Abebe Kebede'}\n` +
      `Contact / Account: ${accountInput}\n` +
      `Status: ${verifiedStatus}\n` +
      `Total Paid: ${verifiedAmount.toLocaleString(undefined, {minimumFractionDigits: 2})} ETB\n` +
      `Chapa Reference: APbu6HTYysXi7\n` +
      `Merchant Reference: ${transactionRef}`;

    navigator.clipboard.writeText(receiptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // --- LUXURY RECEIPT VIEW ---
  if (viewMode === 'receipt') {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-6 font-sans">
        <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl shadow-stone-900/5 border border-stone-200/80 flex justify-between items-center print:hidden">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-stone-700 tracking-wide uppercase">Transaction Verified & Settled</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadPDF}
              className="bg-stone-900 hover:bg-stone-800 text-stone-100 font-medium px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-md transition-all active:scale-95"
            >
              <span>📥</span>
              <span>Export PDF / Print</span>
            </button>
            <button
              onClick={handleCopyReceipt}
              className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 border border-stone-200 transition-all active:scale-95"
            >
              <span>📋</span>
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
          </div>
        </div>

        <div className="w-full bg-white shadow-2xl shadow-stone-900/10 border border-stone-200/80 text-stone-900 overflow-hidden rounded-3xl" ref={receiptRef}>
          <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white flex justify-between items-center px-10 py-8 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#84CC16]/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-black italic tracking-tighter text-[#84CC16]">🌿 Chapa</span>
            </div>
            <div className="text-right">
              <h2 className="text-[#84CC16] font-black text-2xl tracking-widest">RECEIPT</h2>
              <div className="text-[11px] text-stone-300 space-y-0.5 mt-1 font-medium">
                <p className="font-bold text-white">Chapa Financial Technologies S.C</p>
                <p>TIN: 0071406415 | Addis Ababa, Ethiopia</p>
              </div>
            </div>
          </div>

          <div className="px-10 py-6 flex justify-between items-start border-b border-stone-100 bg-stone-50/50">
            <div className="space-y-1">
              <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Issued By</p>
              <p className="font-black text-stone-900 text-base">Executive Real Estate & Holdings</p>
              <p className="text-stone-500 text-xs">Official Platform Partner Settlement</p>
            </div>
            <div>
              <span className="bg-stone-900 text-[#84CC16] font-mono text-xs px-4 py-2.5 rounded-xl shadow-inner font-bold tracking-wider">
                RCAPbU6HTYYsXi7
              </span>
            </div>
          </div>

          <div className="bg-[#84CC16] text-stone-950 font-black px-10 py-3 tracking-wider uppercase text-xs flex justify-between items-center">
            <span>Payment Summary</span>
            <span className="text-[10px] tracking-normal font-bold bg-white/30 px-2.5 py-0.5 rounded-full">Secure Settlement</span>
          </div>

          <div className="divide-y divide-stone-100 text-xs">
            <div className="flex justify-between px-10 py-3.5 bg-white"><span className="text-stone-500 font-medium">Payer Name / የከፋይ ስም</span><span className="font-bold text-stone-900 text-sm">{tenantName || 'Abebe Kebede'}</span></div>
            <div className="flex justify-between px-10 py-3.5 bg-stone-50/50"><span className="text-stone-500 font-medium">Account / Phone Reference</span><span className="font-bold text-stone-900 font-mono">{accountInput}</span></div>
            <div className="flex justify-between px-10 py-3.5 bg-white"><span className="text-stone-500 font-medium">Email Address</span><span className="font-bold text-stone-900">{tenantEmail || 'fikiylkal@gmail.com'}</span></div>
            <div className="flex justify-between px-10 py-3.5 bg-stone-50/50"><span className="text-stone-500 font-medium">Status / ሁኔታ</span><span className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">{verifiedStatus}</span></div>
            <div className="flex justify-between px-10 py-3.5 bg-white"><span className="text-stone-500 font-medium">Timestamp</span><span className="font-bold text-stone-900 font-mono">12-08-2026 / 14:32 EAT</span></div>
            <div className="flex justify-between px-10 py-4 bg-stone-50/50 items-center"><span className="text-stone-500 font-medium">Payment Purpose</span><span className="font-bold text-stone-900 text-right">Monthly Lease Rent & Platform Fee Settlement</span></div>
          </div>

          <div className="px-10 py-6 grid grid-cols-2 gap-8 border-t border-stone-100 bg-white items-center">
            <div className="space-y-2">
              <p className="text-stone-400 font-bold text-[10px] uppercase tracking-wider">Gateway Metadata</p>
              <p className="text-stone-600 text-[11px]"><span className="font-bold text-stone-900">Chapa Ref:</span> APbu6HTYysXi7</p>
              <p className="text-stone-600 text-[11px] truncate"><span className="font-bold text-stone-900">Merchant Ref:</span> {transactionRef}</p>
              <div className="bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-lg inline-block text-[10px] tracking-wide mt-1">
                ⚡ Sandbox Production Simulation
              </div>
            </div>

            <div className="space-y-2 text-xs border-l pl-8 border-stone-100">
              <div className="flex justify-between text-stone-500"><span>Sub Total</span> <span className="font-semibold text-stone-900">{subTotal.toLocaleString(undefined, {minimumFractionDigits: 2})} ETB</span></div>
              <div className="flex justify-between text-stone-500"><span>Gateway Fee</span> <span className="font-semibold text-stone-900">{charge.toLocaleString(undefined, {minimumFractionDigits: 2})} ETB</span></div>
              <div className="flex justify-between font-black text-sm pt-3 border-t border-stone-200">
                <span className="text-stone-900">Total Settled</span> <span className="text-emerald-700 text-base">{verifiedAmount.toLocaleString(undefined, {minimumFractionDigits: 2})} ETB</span>
              </div>
            </div>
          </div>

          <div className="bg-stone-900 text-stone-300 px-10 py-4 flex justify-between items-center text-xs">
            <div className="flex items-center space-x-6 font-medium">
              <span>📞 +251-960724272</span>
              <span>✉️ support@chapa.co</span>
            </div>
            <div className="font-bold text-[#84CC16]">
              Verified Digital Receipt
            </div>
          </div>
        </div>

        <div className="p-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl shadow-stone-900/5 border border-stone-200/80 flex gap-4 print:hidden">
          <button
            onClick={handleDoneViewingReceipt}
            className="flex-1 bg-stone-900 hover:bg-stone-800 text-white font-medium py-3.5 px-6 rounded-xl shadow-md text-xs transition-all active:scale-[0.99]"
          >
            Initiate New Lease Payment
          </button>
          <button
            onClick={handleGoHome}
            className="flex-1 bg-white hover:bg-stone-50 text-stone-700 font-medium py-3.5 px-6 rounded-xl border border-stone-300 text-xs transition-all shadow-sm active:scale-[0.99]"
          >
            ← Return to Tenant Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- LUXURY CHECKOUT SCREEN ---
  return (
    <div className="w-full max-w-xl mx-auto bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-stone-900/10 border border-stone-200/80 overflow-hidden font-sans">
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 px-8 py-6 text-white flex justify-between items-center border-b border-stone-800">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#84CC16] bg-[#84CC16]/10 px-3 py-1 rounded-full border border-[#84CC16]/30">
            Enterprise Gateway
          </span>
          <h2 className="text-lg font-black mt-2 text-white tracking-tight">Lease Financial Settlement</h2>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-stone-800 border border-stone-700 flex items-center justify-center text-lg shadow-inner">
          🏛️
        </div>
      </div>

      <div className="p-8 space-y-6">
        <div>
          <label className="block text-xs font-black text-stone-500 uppercase tracking-widest mb-3">
            Select Payment Provider
          </label>
          <div className="grid grid-cols-2 gap-3.5">
            {Object.entries(methodDetails).map(([key, { label, logoUrl, tagline, fallbackBadge }]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelectedMethod(key);
                  setError(null);
                }}
                className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between group ${
                  selectedMethod === key
                    ? 'border-stone-900 bg-stone-900 text-white shadow-lg shadow-stone-900/10 scale-[1.02]'
                    : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100/80 text-stone-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm shadow-sm overflow-hidden p-1.5 transition-colors ${selectedMethod === key ? 'bg-white text-stone-900' : 'bg-white border border-stone-200'}`}>
                    {logoUrl ? (
                      <img 
                        src={logoUrl} 
                        alt={label} 
                        className="w-full h-full object-contain" 
                        onError={(e) => { 
                          e.target.onerror = null; 
                          e.target.style.display = 'none'; 
                          e.target.nextSibling.style.display = 'flex';
                        }} 
                      />
                    ) : null}
                    <span className="text-lg" style={{ display: logoUrl ? 'none' : 'flex' }}>{fallbackBadge}</span>
                  </div>
                  {selectedMethod === key && (
                    <span className="w-3 h-3 rounded-full bg-[#84CC16] shadow-sm animate-pulse"></span>
                  )}
                </div>
                <div>
                  <p className={`text-xs font-black tracking-tight ${selectedMethod === key ? 'text-white' : 'text-stone-900'}`}>{label}</p>
                  <p className={`text-[10px] truncate mt-0.5 ${selectedMethod === key ? 'text-stone-300' : 'text-stone-500'}`}>{tagline}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedMethod === 'BANK' && (
          <div className="bg-stone-900/5 p-4 rounded-2xl border border-stone-200 animate-fadeIn">
            <label className="block text-xs font-black text-stone-800 mb-2 uppercase tracking-wide">Select Partner Financial Institution</label>
            <select
              value={selectedBank}
              onChange={(e) => {
                setSelectedBank(e.target.value);
                setError(null);
              }}
              className="w-full bg-white border border-stone-300 rounded-xl p-3 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 shadow-sm"
            >
              {specificBanks.map((bank) => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-xs font-black text-stone-500 uppercase tracking-widest">
            {selectedMethod === 'BANK' 
              ? `${selectedBank} Account Number` 
              : selectedMethod === 'CARD' 
              ? 'Card Number (16 Digits)' 
              : 'Mobile Wallet Phone Number'}
          </label>
          <input
            type="text"
            value={accountInput}
            onChange={(e) => {
              setAccountInput(e.target.value);
              setError(null);
            }}
            placeholder={
              selectedMethod === 'BANK' 
                ? "Enter 13-digit account number" 
                : selectedMethod === 'CARD' 
                ? "4111 2222 3333 4444" 
                : "0901072272"
            }
            className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-3.5 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 shadow-inner"
          />
        </div>
        
        <div className="bg-stone-50 p-5 rounded-2xl space-y-2.5 text-xs text-stone-700 border border-stone-200/80">
          <div className="flex justify-between"><span className="text-stone-500 font-medium">Base Rent Amount:</span> <span className="font-bold text-stone-900">{numericRent.toLocaleString()} ETB</span></div>
          <div className="flex justify-between"><span className="text-stone-500 font-medium">Platform Commission (10%):</span> <span className="font-bold text-stone-900">{commission.toLocaleString()} ETB</span></div>
          <div className="border-t border-stone-200 pt-3 flex justify-between text-xs font-black text-stone-900">
            <span>Total Payable:</span> <span className="text-emerald-700 text-base tracking-tight">{subTotal.toLocaleString()} ETB</span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-bold flex items-center space-x-2 shadow-sm">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button
            onClick={handlePayWithChapa}
            disabled={loading}
            className="w-full bg-stone-900 hover:bg-stone-800 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-stone-900/10 flex items-center justify-center space-x-2 disabled:opacity-60 text-xs uppercase tracking-widest active:scale-[0.99] transition-all"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-[#84CC16] animate-ping"></span>
                <span>Connecting to Chapa Securely...</span>
              </span>
            ) : (
              <span>Authorize {subTotal.toLocaleString()} ETB Payment</span>
            )}
          </button>

          <button
            onClick={handleGoHome}
            className="w-full bg-white hover:bg-stone-50 text-stone-700 font-bold py-3 px-6 rounded-2xl transition-all border border-stone-200 text-xs flex items-center justify-center shadow-sm active:scale-[0.99]"
          >
            <span>← Return to Executive Dashboard</span>
          </button>
        </div>

        <div className="text-center pt-2">
          <p className="text-[11px] text-stone-400 font-bold tracking-wide">
            🔒 Bank-grade 256-bit Encryption via Chapa Payment Gateway
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;