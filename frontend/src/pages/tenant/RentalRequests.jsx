import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getRentalRequests,
  updateRentalRequestStatus,
} from "../../services/rentalRequestService";
import { useAuth } from "../../context/AuthContext";
import PaymentScreen from "../../components/PaymentScreen";
import api from "../../services/api";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  MapPin,
  User,
  CreditCard,
  Receipt,
  RotateCcw,
} from "lucide-react";

export default function RentalRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [activePaymentRequestId, setActivePaymentRequestId] = useState(null);
  const [activeReceiptRequestId, setActiveReceiptRequestId] = useState(null);
  const { user } = useAuth();

  const [searchParams] = useSearchParams();
  const successReturn = searchParams.get("success") === "true";
  const txRefReturn = searchParams.get("tx_ref");

  const isLandlord = user?.role === "LANDLORD" || user?.role === "ADMIN";

  useEffect(() => {
    loadRequests();
  }, []);

  // Verify return payment with backend and reload requests
  useEffect(() => {
    const verifyAndMarkPaid = async () => {
      if (successReturn && txRefReturn) {
        try {
          await api.get(`/payments/verify/${txRefReturn}`);
          loadRequests(); 
        } catch (err) {
          console.error("Verification call failed:", err);
        }
      }
    };
    verifyAndMarkPaid();
  }, [successReturn, txRefReturn]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getRentalRequests();
      const data = response?.requests || response?.data || response;

      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("LOAD RENTAL REQUESTS ERROR:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to load rental requests."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      setUpdatingId(id);

      const updatedResponse = await updateRentalRequestStatus(id, status);
      const updated = updatedResponse?.request || updatedResponse?.data || updatedResponse;

      setRequests((previous) =>
        previous.map((request) =>
          request.id === id ? { ...request, status: updated?.status || status } : request
        )
      );
    } catch (err) {
      console.error("UPDATE REQUEST STATUS ERROR:", err);
      alert(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to update rental request status."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const handleReapply = async (propertyId) => {
    try {
      setLoading(true);
      await api.post("/rental-requests", { propertyId, message: "Renewing lease for new period" });
      await loadRequests();
    } catch (err) {
      console.error("REAPPLY ERROR:", err);
      alert(err.response?.data?.message || "Failed to submit new rental request for this property.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const normalizedStatus = String(status || "").trim().toUpperCase();

    switch (normalizedStatus) {
      case "APPROVED":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-full font-bold">
            <CheckCircle2 size={13} /> Approved
          </span>
        );
      case "PENDING":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-full font-bold">
            <Clock size={13} /> Pending Review
          </span>
        );
      case "REJECTED":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-full font-bold">
            <XCircle size={13} /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full font-bold">
            {status || "PENDING"}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full bg-white text-slate-800 flex flex-col items-center justify-center gap-4 font-sans">
        <Loader2 size={40} className="animate-spin text-yellow-500" />
        <p className="text-sm text-slate-400 font-semibold">Loading rental requests...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-slate-50 text-slate-900 py-10 px-4 sm:px-8 relative overflow-y-auto font-sans selection:bg-yellow-500 selection:text-[#022036]">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto space-y-6 relative z-10 pb-16">
        
        <Link
          to={isLandlord ? "/landlord/properties" : "/dashboard"}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-950 bg-white border border-slate-200 px-4 py-2.5 rounded-xl transition-all shadow-xs"
        >
          <ArrowLeft size={16} />
          {isLandlord ? "Back to Landlord Dashboard" : "Back to Dashboard"}
        </Link>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#022036]">Rental Requests</h1>
            <p className="text-xs text-slate-500 mt-1 font-light">
              {isLandlord
                ? "Review and manage rental applications submitted by interested tenants."
                : "Track the status of your rental requests and proceed to secure lease payments upon approval."}
            </p>
          </div>

          <button
            type="button"
            onClick={loadRequests}
            className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-xs"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2 font-semibold">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24 px-6 bg-white border border-slate-200 rounded-3xl shadow-xs">
            <div className="w-16 h-16 bg-yellow-50 border border-yellow-200 rounded-full flex items-center justify-center text-yellow-600 mb-4 shadow-inner">
              <FileText size={28} />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-1">No Rental Requests</h3>
            <p className="text-slate-500 text-xs max-w-sm leading-relaxed mb-6 font-light">
              {isLandlord
                ? "You don't have any incoming rental applications for your properties yet."
                : "You haven't submitted any rental requests yet. Browse available listings and apply!"}
            </p>
            {!isLandlord && (
              <Link
                to="/properties"
                className="px-6 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-[#022036] font-extrabold text-xs uppercase tracking-wider shadow-sm"
              >
                Browse Properties
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => {
              const tenant = request.tenant;
              const property = request.property;
              const isApproved = String(request.status || "").trim().toUpperCase() === "APPROVED";
              const isPayingThisOne = activePaymentRequestId === request.id;
              const isViewingReceipt = activeReceiptRequestId === request.id;
              
              // Correctly evaluate paid status from database/backend record rather than URL query string
              const isPaid = request.isPaid || request.payment?.status === 'SUCCESS';

              return (
                <div
                  key={request.id}
                  className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <h2 className="text-lg font-black text-[#022036]">
                        {property?.titleEn || property?.title || "Property Listing"}
                      </h2>
                      <div className="flex items-center gap-1.5 text-xs text-yellow-600 font-semibold mt-1">
                        <MapPin size={14} />
                        <span>{property?.location?.city || "Addis Ababa"}</span>
                      </div>
                    </div>
                    <div>{getStatusBadge(request.status)}</div>
                  </div>

                  {isLandlord && tenant && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                      <h3 className="text-xs font-black text-yellow-700 uppercase tracking-wider flex items-center gap-2">
                        <User size={15} /> Tenant Profile Details
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-medium">
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">Full Name</span>
                          <strong className="text-slate-900">{tenant.fullName || "Not provided"}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">Email</span>
                          <strong className="text-slate-900 truncate block">{tenant.email || "Not provided"}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">Phone</span>
                          <strong className="text-slate-900 font-mono">{tenant.phone || "Not provided"}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">Fayda Number</span>
                          <strong className="text-slate-900 font-mono">{tenant.faydaNumber || "Not provided"}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-1">Message to Landlord</span>
                      <p className="text-slate-700 font-medium leading-relaxed">{request.message || "No message provided."}</p>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Proposed Monthly Price</span>
                        <strong className="text-yellow-600 text-sm font-mono font-black">
                          {request.proposedPrice
                            ? `${Number(request.proposedPrice).toLocaleString()} ETB`
                            : `${Number(property?.price || 0).toLocaleString()} ETB (Standard)`}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {!isLandlord && isApproved && (
                    <div className="pt-2">
                      {isPaid ? (
                        <div className="space-y-3">
                          <div className="w-full py-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs">
                            <CheckCircle2 size={16} /> Paid & Verified • Settled Successfully
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveReceiptRequestId(isViewingReceipt ? null : request.id)}
                              className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-400 text-[#022036] font-extrabold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all"
                            >
                              <Receipt size={16} /> {isViewingReceipt ? "Hide Receipt" : "View Digital Receipt"}
                            </button>
                          </div>

                          {isViewingReceipt && (
                            <div className="mt-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
                              <PaymentScreen
                                leaseId={request.leaseId || request.id}
                                rentAmount={request.proposedPrice || property?.price || 5000}
                                tenantEmail={tenant?.email || user?.email}
                                tenantName={tenant?.fullName || user?.fullName}
                                tenantPhone={tenant?.phone || user?.phone}
                                successReturn={true}
                                txRefReturn={txRefReturn || "TX-RECEIPT"}
                              />
                            </div>
                          )}
                        </div>
                      ) : !isPayingThisOne ? (
                        <button
                          type="button"
                          onClick={() => setActivePaymentRequestId(request.id)}
                          className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-[#022036] font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                        >
                          <CreditCard size={16} /> Proceed to Secure Lease Payment
                        </button>
                      ) : (
                        <div className="mt-4 p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
                          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <span className="text-xs font-bold text-yellow-600">Secure Chapa Checkout</span>
                            <button
                              type="button"
                              onClick={() => setActivePaymentRequestId(null)}
                              className="text-xs text-slate-500 hover:text-slate-950 cursor-pointer font-bold"
                            >
                              Close Checkout
                            </button>
                          </div>
                          <PaymentScreen
                            leaseId={request.leaseId || request.id}
                            rentAmount={request.proposedPrice || property?.price || 5000}
                            tenantEmail={tenant?.email || user?.email}
                            tenantName={tenant?.fullName || user?.fullName}
                            tenantPhone={tenant?.phone || user?.phone}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {isLandlord && String(request.status || "").trim().toUpperCase() === "PENDING" && (
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        disabled={updatingId === request.id}
                        onClick={() => handleStatusUpdate(request.id, "REJECTED")}
                        className="flex-1 py-3 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        {updatingId === request.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={16} />}
                        <span>Reject Request</span>
                      </button>

                      <button
                        type="button"
                        disabled={updatingId === request.id}
                        onClick={() => handleStatusUpdate(request.id, "APPROVED")}
                        className="flex-1 py-3 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        {updatingId === request.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={16} />}
                        <span>Approve Request</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}