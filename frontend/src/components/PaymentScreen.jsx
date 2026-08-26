import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api'; // uses configured api instance with auth headers
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, Copy, Download, ShieldCheck } from 'lucide-react';

const PaymentScreen = ({ leaseId, rentAmount, tenantEmail, tenantName, tenantPhone, successReturn, txRefReturn }) => {
  const navigate = useNavigate();
  const receiptRef = useRef();

  // Rely strictly on incoming props for reliable rendering inside modals
  const isSuccessReturn = Boolean(successReturn);
  const txRefReturnFinal = txRefReturn || 'TX-0E865EA9-1786516303040';

  const [viewMode, setViewMode] = useState(isSuccessReturn ? 'receipt' : 'checkout');
  const [transactionRef, setTransactionRef] = useState(txRefReturnFinal);
  const [selectedMethod, setSelectedMethod] = useState('TELEBIRR');
  const [selectedBank, setSelectedBank] = useState('Commercial Bank of Ethiopia (CBE)');
  const [accountInput, setAccountInput] = useState(tenantPhone || '0901072272');
  
  const [verifiedAmount] = useState(Number(rentAmount) * 1.10 || 5500);
  const [verifiedStatus] = useState('Paid / ተከፍሏል');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const numericRent = Number(rentAmount) || 5000;
  const commission = numericRent * 0.10; 
  const subTotal = numericRent + commission;
  const charge = subTotal * 0.025; 

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
      const response = await api.post('/payments/initiate', {
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

  const handleGoDashboard = () => { navigate('/dashboard'); };
  const handleDoneViewingReceipt = () => {
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
      `Merchant: HouseRentalPro Platform\n` +
      `Payer Name: ${tenantName || 'Tenant User'}\n` +
      `Contact / Account: ${accountInput}\n` +
      `Status: ${verifiedStatus}\n` +
      `Total Paid: ${verifiedAmount.toLocaleString(undefined, {minimumFractionDigits: 2})} ETB\n` +
      `Chapa Reference: APbu6HTYysXi7\n` +
      `Merchant Reference: ${transactionRef}`;

    navigator.clipboard.writeText(receiptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // --- LUXURY BRANDED RECEIPT VIEW ---
  if (viewMode === 'receipt') {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-6 font-sans text-slate-800">
        <div className="bg-white px-6 py-4 rounded-2xl shadow-xs border border-slate-200 flex justify-between items-center print:hidden">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">Transaction Verified & Settled</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadPDF}
              className="bg-yellow-500 hover:bg-yellow-400 text-[#022036] font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-sm transition-all cursor-pointer uppercase tracking-wider"
            >
              <Download size={14} />
              <span>Export PDF / Print</span>
            </button>
            <button
              onClick={handleCopyReceipt}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 border border-slate-200 transition-all cursor-pointer"
            >
              <Copy size={14} />
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
          </div>
        </div>

        <div className="w-full bg-white shadow-xl border border-slate-200 text-slate-800 overflow-hidden rounded-3xl" ref={receiptRef}>
          <div className="bg-[#022036] text-white flex justify-between items-center px-10 py-8 relative overflow-hidden border-b border-yellow-500/20">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-black tracking-tight text-yellow-400">🏠 HouseRentalPro</span>
            </div>
            <div className="text-right">
              <h2 className="text-yellow-400 font-black text-2xl tracking-widest">RECEIPT</h2>
              <div className="text-[11px] text-slate-300 space-y-0.5 mt-1 font-medium">
                <p className="font-bold text-white">Teamwork IT Solutions Holdings</p>
                <p>Addis Ababa, Ethiopia</p>
              </div>
            </div>
          </div>

          <div className="px-10 py-6 flex justify-between items-start border-b border-slate-100 bg-slate-50/50">
            <div className="space-y-1">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Issued By</p>
              <p className="font-extrabold text-slate-900 text-base">HouseRentalPro Platform Services</p>
              <p className="text-slate-500 text-xs">Official Platform Partner Settlement</p>
            </div>
            <div>
              <span className="bg-yellow-50 text-yellow-800 font-mono text-xs px-4 py-2.5 rounded-xl shadow-xs font-bold tracking-wider border border-yellow-200">
                RCAPbU6HTYYsXi7
              </span>
            </div>
          </div>

          <div className="bg-yellow-500 text-[#022036] font-black px-10 py-3 tracking-wider uppercase text-xs flex justify-between items-center">
            <span>Payment Summary</span>
            <span className="text-[10px] tracking-normal font-extrabold bg-black/10 px-2.5 py-0.5 rounded-full">Secure Settlement</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs bg-white">
            <div className="flex justify-between px-10 py-3.5"><span className="text-slate-500 font-semibold">Payer Name / የከፋይ ስም</span><span className="font-bold text-slate-900 text-sm">{tenantName || 'Tenant User'}</span></div>
            <div className="flex justify-between px-10 py-3.5"><span className="text-slate-500 font-semibold">Account / Phone Reference</span><span className="font-bold text-slate-900 font-mono">{accountInput}</span></div>
            <div className="flex justify-between px-10 py-3.5"><span className="text-slate-500 font-semibold">Email Address</span><span className="font-bold text-slate-900">{tenantEmail || 'tenant@example.com'}</span></div>
            <div className="flex justify-between px-10 py-3.5"><span className="text-slate-500 font-semibold">Status / ሁኔታ</span><span className="font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">{verifiedStatus}</span></div>
            <div className="flex justify-between px-10 py-3.5"><span className="text-slate-500 font-semibold">Timestamp</span><span className="font-bold text-slate-900 font-mono">12-08-2026 / 14:32 EAT</span></div>
            <div className="flex justify-between px-10 py-4 items-center"><span className="text-slate-500 font-semibold">Payment Purpose</span><span className="font-bold text-slate-900 text-right">Monthly Lease Rent & Platform Fee Settlement</span></div>
          </div>

          <div className="px-10 py-6 grid grid-cols-2 gap-8 border-t border-slate-200 bg-slate-50 items-center">
            <div className="space-y-2">
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Gateway Metadata</p>
              <p className="text-slate-600 text-[11px]"><span className="font-bold text-slate-900">Chapa Ref:</span> APbu6HTYysXi7</p>
              <p className="text-slate-600 text-[11px] truncate"><span className="font-bold text-slate-900">Merchant Ref:</span> {transactionRef}</p>
              <div className="bg-yellow-50 text-yellow-800 font-bold px-3 py-1 rounded-lg inline-block text-[10px] tracking-wide mt-1 border border-yellow-200">
                ⚡ Sandbox Production Simulation
              </div>
            </div>

            <div className="space-y-2 text-xs border-l pl-8 border-slate-200">
              <div className="flex justify-between text-slate-500"><span>Sub Total</span> <span className="font-semibold text-slate-900 font-mono">{subTotal.toLocaleString(undefined, {minimumFractionDigits: 2})} ETB</span></div>
              <div className="flex justify-between text-slate-500"><span>Gateway Fee</span> <span className="font-semibold text-slate-900 font-mono">{charge.toLocaleString(undefined, {minimumFractionDigits: 2})} ETB</span></div>
              <div className="flex justify-between font-black text-sm pt-3 border-t border-slate-200">
                <span className="text-slate-950">Total Settled</span> <span className="text-emerald-700 text-base font-mono">{verifiedAmount.toLocaleString(undefined, {minimumFractionDigits: 2})} ETB</span>
              </div>
            </div>
          </div>

          <div className="bg-[#022036] text-slate-300 px-10 py-4 flex justify-between items-center text-xs border-t border-yellow-500/20">
            <div className="flex items-center space-x-6 font-medium">
              <span>📞 +251-960724272</span>
              <span>✉️ support@teamwork.com</span>
            </div>
            <div className="font-bold text-yellow-400 uppercase tracking-wider">
              Verified Digital Receipt
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl shadow-xs border border-slate-200 flex gap-4 print:hidden">
          <button
            onClick={handleGoDashboard}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-6 rounded-xl border border-slate-200 text-xs transition-all cursor-pointer"
          >
            ← Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- LUXURY BRANDED CHECKOUT SCREEN ---
  return (
    <div className="w-full max-w-xl mx-auto bg-white backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200 overflow-hidden font-sans text-slate-800">
      <div className="bg-[#022036] px-8 py-6 flex justify-between items-center border-b border-yellow-500/20 text-white">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
            Enterprise Gateway
          </span>
          <h2 className="text-lg font-black mt-2 text-white tracking-tight">Lease Financial Settlement</h2>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-lg shadow-inner text-yellow-400">
          🏛️
        </div>
      </div>

      <div className="p-8 space-y-6">
        <div>
          <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-3">
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
                className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between group cursor-pointer ${
                  selectedMethod === key
                    ? 'border-yellow-500 bg-yellow-50/50 text-slate-950 shadow-sm scale-[1.02]'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm shadow-xs overflow-hidden p-1.5 bg-white border border-slate-200 text-slate-900">
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
                    <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm animate-pulse"></span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-black tracking-tight text-slate-950">{label}</p>
                  <p className="text-[10px] truncate mt-0.5 text-slate-500">{tagline}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedMethod === 'BANK' && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 animate-fadeIn">
            <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-wide">Select Partner Financial Institution</label>
            <select
              value={selectedBank}
              onChange={(e) => {
                setSelectedBank(e.target.value);
                setError(null);
              }}
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 shadow-xs cursor-pointer"
            >
              {specificBanks.map((bank) => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-600 uppercase tracking-widest">
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
                ? "Enter account number" 
                : selectedMethod === 'CARD' 
                ? "4111 2222 3333 4444" 
                : "0901072272"
            }
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 shadow-inner font-mono"
          />
        </div>
        
        <div className="bg-slate-50 p-5 rounded-2xl space-y-2.5 text-xs text-slate-700 border border-slate-200">
          <div className="flex justify-between"><span className="text-slate-500 font-medium">Base Rent Amount:</span> <span className="font-bold text-slate-900 font-mono">{numericRent.toLocaleString()} ETB</span></div>
          <div className="flex justify-between"><span className="text-slate-500 font-medium">Platform Commission (10%):</span> <span className="font-bold text-slate-900 font-mono">{commission.toLocaleString()} ETB</span></div>
          <div className="border-t border-slate-200 pt-3 flex justify-between text-xs font-black text-slate-950">
            <span>Total Payable:</span> <span className="text-yellow-600 text-base tracking-tight font-mono">{subTotal.toLocaleString()} ETB</span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-bold flex items-center space-x-2 shadow-xs">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button
            onClick={handlePayWithChapa}
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-[#022036] font-black py-4 px-6 rounded-2xl shadow-md flex items-center justify-center space-x-2 disabled:opacity-60 text-xs uppercase tracking-widest active:scale-[0.99] transition-all cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <Loader2 size={16} className="animate-spin text-[#022036]" />
                <span>Connecting to Chapa Securely...</span>
              </span>
            ) : (
              <span>Authorize {subTotal.toLocaleString()} ETB Payment Button</span>
            )}
          </button>

          <button
            onClick={handleGoDashboard}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-2xl transition-all border border-slate-200 text-xs flex items-center justify-center shadow-xs active:scale-[0.99] cursor-pointer"
          >
            <span>← Return to Tenant Dashboard</span>
          </button>
        </div>

        <div className="text-center pt-2">
          <p className="text-[11px] text-slate-400 font-bold tracking-wide flex items-center justify-center gap-1.5">
            <ShieldCheck size={14} className="text-yellow-600" /> Bank-grade 256-bit Encryption via Chapa Payment Gateway
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;