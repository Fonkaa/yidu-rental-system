import React, { useState, useEffect, useRef } from "react";
import api from "../services/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Loader2,
  CheckCircle,
  Copy,
  Download,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

const PaymentScreen = ({
  leaseId,
  rentalRequestId,
  rentAmount,
  tenantEmail,
  tenantName,
  tenantPhone,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const receiptRef = useRef();

  // ======================================================
  // GET REAL CHAPA TRANSACTION REFERENCE
  // ======================================================

  const urlTxRef =
    searchParams.get("tx_ref") ||
    searchParams.get("trx_ref") ||
    searchParams.get("reference");

  // ======================================================
  // STATE
  // ======================================================

  const [viewMode, setViewMode] = useState("checkout");

  const [transactionRef, setTransactionRef] =
    useState(urlTxRef || "");

  const [paymentStatus, setPaymentStatus] =
    useState("PENDING");

  const [paymentData, setPaymentData] =
    useState(null);

  const [selectedMethod, setSelectedMethod] =
    useState("TELEBIRR");

  const [selectedBank, setSelectedBank] =
    useState("Commercial Bank of Ethiopia (CBE)");

  const [accountInput, setAccountInput] =
    useState(tenantPhone || "");

  const [loading, setLoading] =
    useState(false);

  const [verifying, setVerifying] =
    useState(Boolean(urlTxRef));

  const [error, setError] =
    useState(null);

  const [copied, setCopied] =
    useState(false);

  // ======================================================
  // AMOUNT
  // ======================================================

  const numericRent =
    Number(rentAmount) || 5000;

  const commission =
    numericRent * 0.10;

  const subTotal =
    numericRent + commission;

  const charge =
    subTotal * 0.025;

  const verifiedAmount =
    Number(
      paymentData?.amount || subTotal
    );

  // ======================================================
  // PAYMENT METHODS
  // ======================================================

  const methodDetails = {
    TELEBIRR: {
      label: "Telebirr",
      logoUrl:
        "https://www.ethiotelecom.et/wp-content/uploads/2025/10/telebirr-logo-01.png",
      tagline:
        "Ethio Telecom Mobile Money",
      fallbackBadge: "⚡",
    },

    CBE_BIRR: {
      label: "CBE Birr",
      logoUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROYGQgVvScBI7pfAfj-bhlmOOWpOshV-TWViSzlXXcLJ_WsH3-MK-mDORFb7B5dl0&s=10&ec=121924532",
      tagline:
        "Commercial Bank of Ethiopia",
      fallbackBadge: "🏦",
    },

    BANK: {
      label: "Direct Bank",
      logoUrl: "",
      tagline:
        "Abyssinia, Dashen & Awash",
      fallbackBadge: "🏛️",
    },

    CARD: {
      label: "Cards",
      logoUrl: "",
      tagline:
        "Visa / Mastercard",
      fallbackBadge: "💳",
    },
  };

  const specificBanks = [
    "Commercial Bank of Ethiopia (CBE)",
    "Bank of Abyssinia",
    "Dashen Bank",
    "Oromia Bank",
    "Awash Bank",
    "Telebirr Mobile Wallet",
  ];

  // ======================================================
  // VERIFY PAYMENT AFTER RETURN FROM CHAPA
  // ======================================================

  useEffect(() => {
    if (!urlTxRef) {
      return;
    }

    let cancelled = false;

    const verifyReturnedPayment = async () => {
      try {
        setVerifying(true);
        setError(null);

        console.log(
          "Verifying returned Chapa payment:",
          urlTxRef
        );

        const response = await api.get(
          `/payments/verify/${encodeURIComponent(
            urlTxRef
          )}`
        );

        if (cancelled) {
          return;
        }

        console.log(
          "Payment verification response:",
          response.data
        );

        const result = response.data;

        if (
          result?.success === true &&
          result?.payment?.status === "SUCCESS"
        ) {
          setPaymentData(result.payment);
          setPaymentStatus("SUCCESS");
          setTransactionRef(urlTxRef);
          setViewMode("receipt");

          return;
        }

        if (
          result?.payment?.status === "PENDING"
        ) {
          setPaymentStatus("PENDING");

          setError(
            "Payment is still being processed by Chapa. Please wait a moment and try again."
          );

          return;
        }

        setPaymentStatus("FAILED");

        setError(
          result?.message ||
            result?.error ||
            "Payment verification failed."
        );
      } catch (err) {
        console.error(
          "PAYMENT VERIFICATION ERROR:",
          err
        );

        if (cancelled) {
          return;
        }

        setPaymentStatus("FAILED");

        setError(
          err.response?.data?.error ||
            "Unable to verify your payment with the server."
        );
      } finally {
        if (!cancelled) {
          setVerifying(false);
        }
      }
    };

    verifyReturnedPayment();

    return () => {
      cancelled = true;
    };
  }, [urlTxRef]);

  // ======================================================
  // PAY WITH CHAPA
  // ======================================================

  const handlePayWithChapa = async () => {
    setError(null);

    // ----------------------------------------------------
    // CHECK IDENTIFIER
    // ----------------------------------------------------

    if (!leaseId && !rentalRequestId) {
      setError(
        "Missing lease or rental request reference. Please go back and try again."
      );

      return;
    }

    // ----------------------------------------------------
    // VALIDATE ACCOUNT
    // ----------------------------------------------------

    const cleanedInput =
      accountInput.trim();

    if (
      selectedMethod === "TELEBIRR" ||
      selectedMethod === "CBE_BIRR"
    ) {
      const phoneRegex =
        /^(09|07|\+?251)\d{8,9}$/;

      if (!phoneRegex.test(cleanedInput)) {
        setError(
          "Please enter a valid Ethiopian phone number (e.g., 0911223344)."
        );

        return;
      }
    } else if (
      selectedMethod === "CARD"
    ) {
      const cardRegex =
        /^\d{16}$/;

      if (
        !cardRegex.test(
          cleanedInput.replace(/\s+/g, "")
        )
      ) {
        setError(
          "Please enter a valid 16-digit card number."
        );

        return;
      }
    } else if (
      selectedMethod === "BANK"
    ) {
      if (
        selectedBank ===
        "Commercial Bank of Ethiopia (CBE)"
      ) {
        if (
          !/^1000\d{9}$/.test(
            cleanedInput
          )
        ) {
          setError(
            "Invalid CBE account number. Must be 13 digits starting with 1000."
          );

          return;
        }
      } else {
        if (
          !/^\d{10,16}$/.test(
            cleanedInput
          )
        ) {
          setError(
            "Please enter a valid bank account number (10 to 16 digits)."
          );

          return;
        }
      }
    }

    // ----------------------------------------------------
    // START LOADING
    // ----------------------------------------------------

    setLoading(true);

    const finalLabel =
      selectedMethod === "BANK"
        ? selectedBank
        : methodDetails[
            selectedMethod
          ]?.label ||
          selectedMethod;

    localStorage.setItem(
      "active_payment_label",
      finalLabel
    );

    try {
      const response =
        await api.post(
          "/payments/initiate",
          {
            leaseId:
              leaseId || undefined,

            rentalRequestId:
              rentalRequestId ||
              undefined,

            amount:
              numericRent,

            email:
              tenantEmail,

            firstName:
              tenantName
                ?.split(" ")[0] ||
              "Tenant",

            lastName:
              tenantName
                ?.split(" ")
                .slice(1)
                .join(" ") ||
              "User",

            phoneNumber:
              cleanedInput,

            method:
              selectedMethod,

            specificBank:
              selectedMethod ===
              "BANK"
                ? selectedBank
                : null,
          }
        );

      console.log(
        "PAYMENT INITIALIZE RESPONSE:",
        response.data
      );

      const checkoutUrl =
        response.data?.data
          ?.checkout_url;

      const newTxRef =
        response.data?.data
          ?.tx_ref;

      if (
        response.data?.success &&
        checkoutUrl
      ) {
        if (newTxRef) {
          localStorage.setItem(
            "last_payment_tx_ref",
            newTxRef
          );
        }

        if (
          response.data?.data
            ?.leaseId
        ) {
          localStorage.setItem(
            "last_payment_lease_id",
            response.data.data.leaseId
          );
        }

        window.location.href =
          checkoutUrl;

        return;
      }

      throw new Error(
        response.data?.error ||
          "Failed to generate secure checkout redirect link."
      );
    } catch (err) {
      console.error(
        "Payment Error:",
        err
      );

      const serverMessage =
        err.response?.data?.error;

      setError(
        typeof serverMessage ===
          "string"
          ? serverMessage
          : err.message ||
              "An unexpected error occurred."
      );

      setLoading(false);
    }
  };

  // ======================================================
  // DASHBOARD
  // ======================================================

  const handleGoDashboard = () => {
    navigate("/dashboard");
  };

  // ======================================================
  // DOWNLOAD RECEIPT
  // ======================================================

  const handleDownloadPDF = () => {
    if (!receiptRef.current) {
      return;
    }

    const printContent =
      receiptRef.current.innerHTML;

    const originalContent =
      document.body.innerHTML;

    document.body.innerHTML = `
      <div
        style="
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          font-family: sans-serif;
        "
      >
        ${printContent}
      </div>
    `;

    window.print();

    document.body.innerHTML =
      originalContent;

    window.location.reload();
  };

  // ======================================================
  // COPY RECEIPT
  // ======================================================

  const handleCopyReceipt = () => {
    const receiptText =
      `OFFICIAL CHAPA RECEIPT\n` +
      `Merchant: HouseRentalPro Platform\n` +
      `Payer Name: ${
        tenantName ||
        "Tenant User"
      }\n` +
      `Contact / Account: ${
        accountInput
      }\n` +
      `Status: Payment Successful\n` +
      `Total Paid: ${verifiedAmount.toLocaleString(
        undefined,
        {
          minimumFractionDigits: 2,
        }
      )} ETB\n` +
      `Chapa Reference: ${
        transactionRef ||
        "N/A"
      }\n` +
      `Merchant Reference: ${
        transactionRef ||
        "N/A"
      }`;

    navigator.clipboard.writeText(
      receiptText
    );

    setCopied(true);

    setTimeout(
      () => setCopied(false),
      2500
    );
  };

  // ======================================================
  // VERIFYING SCREEN
  // ======================================================

  if (verifying) {
    return (
      <div className="w-full max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-[#022036] px-8 py-8 text-center text-white">
          <div className="w-16 h-16 mx-auto rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mb-5">
            <Loader2
              size={30}
              className="animate-spin text-yellow-400"
            />
          </div>

          <h2 className="text-xl font-black">
            Verifying Payment
          </h2>

          <p className="text-slate-300 text-sm mt-2">
            Chapa payment is being verified securely...
          </p>
        </div>

        <div className="p-8 text-center">
          <p className="text-xs text-slate-500 font-mono break-all">
            Transaction:
            <br />
            {urlTxRef}
          </p>
        </div>
      </div>
    );
  }

  // ======================================================
  // RECEIPT ONLY AFTER REAL SUCCESS
  // ======================================================

  if (
    viewMode === "receipt" &&
    paymentStatus === "SUCCESS"
  ) {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-6 font-sans text-slate-800">

        <div className="bg-white px-6 py-4 rounded-2xl shadow border border-slate-200 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <CheckCircle
              size={18}
              className="text-emerald-500"
            />

            <span className="text-xs font-bold text-emerald-700 tracking-wide uppercase">
              Payment Verified Successfully
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={
                handleDownloadPDF
              }
              className="bg-yellow-500 hover:bg-yellow-400 text-[#022036] font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2"
            >
              <Download size={14} />
              <span>
                Export PDF / Print
              </span>
            </button>

            <button
              onClick={
                handleCopyReceipt
              }
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 border border-slate-200"
            >
              <Copy size={14} />

              <span>
                {copied
                  ? "Copied!"
                  : "Copy Summary"}
              </span>
            </button>
          </div>
        </div>

        <div
          className="w-full bg-white shadow-xl border border-slate-200 overflow-hidden rounded-3xl"
          ref={receiptRef}
        >
          <div className="bg-[#022036] text-white flex justify-between items-center px-10 py-8 border-b border-yellow-500/20">
            <div>
              <span className="text-2xl font-black tracking-tight text-yellow-400">
                🏠 HouseRentalPro
              </span>
            </div>

            <div className="text-right">
              <h2 className="text-yellow-400 font-black text-2xl tracking-widest">
                RECEIPT
              </h2>

              <p className="text-[11px] text-slate-300">
                Teamwork IT Solutions Holdings
              </p>

              <p className="text-[11px] text-slate-300">
                Addis Ababa, Ethiopia
              </p>
            </div>
          </div>

          <div className="px-10 py-6 border-b border-slate-100 bg-slate-50/50">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
              Chapa Transaction Reference
            </p>

            <p className="font-extrabold text-slate-900 text-base font-mono mt-2 break-all">
              {transactionRef}
            </p>
          </div>

          <div className="bg-yellow-500 text-[#022036] font-black px-10 py-3 tracking-wider uppercase text-xs">
            Payment Summary
          </div>

          <div className="divide-y divide-slate-100 text-xs bg-white">

            <div className="flex justify-between px-10 py-3.5">
              <span className="text-slate-500 font-semibold">
                Payer Name
              </span>

              <span className="font-bold text-slate-900 text-sm">
                {tenantName ||
                  "Tenant User"}
              </span>
            </div>

            <div className="flex justify-between px-10 py-3.5">
              <span className="text-slate-500 font-semibold">
                Account / Phone
              </span>

              <span className="font-bold text-slate-900 font-mono">
                {accountInput ||
                  tenantPhone ||
                  "N/A"}
              </span>
            </div>

            <div className="flex justify-between px-10 py-3.5">
              <span className="text-slate-500 font-semibold">
                Email
              </span>

              <span className="font-bold text-slate-900">
                {tenantEmail ||
                  "N/A"}
              </span>
            </div>

            <div className="flex justify-between px-10 py-3.5">
              <span className="text-slate-500 font-semibold">
                Status
              </span>

              <span className="font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                PAID / ተከፍሏል
              </span>
            </div>

            <div className="flex justify-between px-10 py-4">
              <span className="text-slate-500 font-semibold">
                Payment Purpose
              </span>

              <span className="font-bold text-slate-900 text-right">
                Monthly Lease Rent & Platform Fee
              </span>
            </div>

          </div>

          <div className="px-10 py-6 border-t border-slate-200 bg-slate-50">
            <div className="flex justify-between text-slate-500">
              <span>
                Base Rent
              </span>

              <span className="font-semibold text-slate-900 font-mono">
                {numericRent.toLocaleString(
                  undefined,
                  {
                    minimumFractionDigits: 2,
                  }
                )}{" "}
                ETB
              </span>
            </div>

            <div className="flex justify-between text-slate-500 mt-2">
              <span>
                Platform Commission (10%)
              </span>

              <span className="font-semibold text-slate-900 font-mono">
                {commission.toLocaleString(
                  undefined,
                  {
                    minimumFractionDigits: 2,
                  }
                )}{" "}
                ETB
              </span>
            </div>

            <div className="flex justify-between font-black text-sm pt-4 mt-3 border-t border-slate-200">
              <span>
                Total Paid
              </span>

              <span className="text-emerald-700 text-base font-mono">
                {verifiedAmount.toLocaleString(
                  undefined,
                  {
                    minimumFractionDigits: 2,
                  }
                )}{" "}
                ETB
              </span>
            </div>
          </div>

          <div className="bg-[#022036] text-slate-300 px-10 py-4 flex justify-between items-center text-xs">
            <span>
              📞 +251-960724272
            </span>

            <span>
              ✉️ support@teamwork.com
            </span>

            <span className="font-bold text-yellow-400">
              VERIFIED PAYMENT
            </span>
          </div>
        </div>

        <button
          onClick={handleGoDashboard}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-6 rounded-xl border border-slate-200"
        >
          ← Return to Dashboard
        </button>
      </div>
    );
  }

  // ======================================================
  // PAYMENT FAILED / PENDING AFTER RETURN
  // ======================================================

  if (urlTxRef && paymentStatus !== "SUCCESS") {
    return (
      <div className="w-full max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">

        <div className="bg-[#022036] px-8 py-8 text-center text-white">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-5">
            <AlertCircle
              size={30}
              className="text-rose-400"
            />
          </div>

          <h2 className="text-xl font-black">
            Payment Not Verified
          </h2>

          <p className="text-slate-300 text-sm mt-2">
            {error ||
              "The payment could not be verified."}
          </p>
        </div>

        <div className="p-8 space-y-4">

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-[10px] uppercase font-black text-slate-400">
              Transaction Reference
            </p>

            <p className="font-mono text-xs font-bold text-slate-800 mt-2 break-all">
              {urlTxRef}
            </p>
          </div>

          <button
            onClick={() =>
              navigate(
                "/rental-requests"
              )
            }
            className="w-full bg-[#022036] text-white font-bold py-3.5 rounded-xl"
          >
            ← Back to Rental Requests
          </button>

        </div>
      </div>
    );
  }

  // ======================================================
  // CHECKOUT SCREEN
  // ======================================================

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden font-sans text-slate-800">

      <div className="bg-[#022036] px-8 py-6 flex justify-between items-center border-b border-yellow-500/20 text-white">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
            Secure Chapa Gateway
          </span>

          <h2 className="text-lg font-black mt-2">
            Lease Financial Settlement
          </h2>
        </div>

        <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-lg text-yellow-400">
          🏛️
        </div>
      </div>

      <div className="p-8 space-y-6">

        <div>
          <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-3">
            Select Payment Provider
          </label>

          <div className="grid grid-cols-2 gap-3.5">

            {Object.entries(
              methodDetails
            ).map(
              ([
                key,
                {
                  label,
                  logoUrl,
                  tagline,
                  fallbackBadge,
                },
              ]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedMethod(
                      key
                    );
                    setError(null);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                    selectedMethod === key
                      ? "border-yellow-500 bg-yellow-50/50 text-slate-950 shadow-sm scale-[1.02]"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">

                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm shadow-sm overflow-hidden p-1.5 bg-white border border-slate-200">

                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={label}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display =
                              "none";

                            const next =
                              e.currentTarget
                                .nextSibling;

                            if (next) {
                              next.style.display =
                                "flex";
                            }
                          }}
                        />
                      ) : null}

                      <span
                        className="text-lg"
                        style={{
                          display:
                            logoUrl
                              ? "none"
                              : "flex",
                        }}
                      >
                        {fallbackBadge}
                      </span>

                    </div>

                    {selectedMethod === key && (
                      <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm animate-pulse" />
                    )}

                  </div>

                  <div>
                    <p className="text-xs font-black text-slate-950">
                      {label}
                    </p>

                    <p className="text-[10px] truncate mt-0.5 text-slate-500">
                      {tagline}
                    </p>
                  </div>

                </button>
              )
            )}

          </div>
        </div>

        {selectedMethod === "BANK" && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-wide">
              Select Bank
            </label>

            <select
              value={selectedBank}
              onChange={(e) => {
                setSelectedBank(
                  e.target.value
                );

                setError(null);
              }}
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold"
            >
              {specificBanks.map(
                (bank) => (
                  <option
                    key={bank}
                    value={bank}
                  >
                    {bank}
                  </option>
                )
              )}
            </select>
          </div>
        )}

        <div className="space-y-2">

          <label className="block text-xs font-black text-slate-600 uppercase tracking-widest">
            {selectedMethod ===
            "BANK"
              ? `${selectedBank} Account Number`
              : selectedMethod ===
                "CARD"
              ? "Card Number"
              : "Mobile Wallet Phone Number"}
          </label>

          <input
            type="text"
            value={accountInput}
            onChange={(e) => {
              setAccountInput(
                e.target.value
              );
              setError(null);
            }}
            placeholder={
              selectedMethod ===
              "BANK"
                ? "Enter account number"
                : selectedMethod ===
                  "CARD"
                ? "4111 2222 3333 4444"
                : "0901072272"
            }
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 shadow-inner font-mono"
          />

        </div>

        <div className="bg-slate-50 p-5 rounded-2xl space-y-2.5 text-xs border border-slate-200">

          <div className="flex justify-between">
            <span className="text-slate-500">
              Base Rent Amount:
            </span>

            <span className="font-bold">
              {numericRent.toLocaleString()} ETB
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">
              Platform Commission (10%):
            </span>

            <span className="font-bold">
              {commission.toLocaleString()} ETB
            </span>
          </div>

          <div className="border-t border-slate-200 pt-3 flex justify-between text-xs font-black">
            <span>
              Total Payable:
            </span>

            <span className="text-yellow-600 text-base">
              {subTotal.toLocaleString()} ETB
            </span>
          </div>

        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-bold flex items-center gap-2">
            ⚠️
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-3 pt-2">

          <button
            onClick={
              handlePayWithChapa
            }
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-[#022036] font-black py-4 px-6 rounded-2xl shadow-md flex items-center justify-center space-x-2 disabled:opacity-60 text-xs uppercase tracking-widest"
          >
            {loading ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />

                <span>
                  Connecting to Chapa Securely...
                </span>
              </>
            ) : (
              <span>
                Pay{" "}
                {subTotal.toLocaleString()}{" "}
                ETB with Chapa
              </span>
            )}
          </button>

          <button
            onClick={
              handleGoDashboard
            }
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-2xl border border-slate-200 text-xs"
          >
            ← Return to Tenant Dashboard
          </button>

        </div>

        <div className="text-center pt-2">
          <p className="text-[11px] text-slate-400 font-bold tracking-wide flex items-center justify-center gap-1.5">
            <ShieldCheck
              size={14}
              className="text-yellow-600"
            />

            Secure payment via Chapa
          </p>
        </div>

      </div>
    </div>
  );
};

export default PaymentScreen;