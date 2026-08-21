
import { useEffect, useState } from "react";
import {
  getRentalRequests,
  updateRentalRequestStatus,
} from "../../services/rentalRequestService";

export default function RentalRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getRentalRequests();

      console.log("RENTAL REQUESTS:", data);

      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("LOAD RENTAL REQUESTS ERROR:", err);

      setError(
        err.response?.data?.error ||
          "Failed to load rental requests"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      setUpdatingId(id);

      const updated = await updateRentalRequestStatus(
        id,
        status
      );

      setRequests((previous) =>
        previous.map((request) =>
          request.id === id ? updated : request
        )
      );
    } catch (err) {
      console.error("UPDATE REQUEST STATUS ERROR:", err);

      alert(
        err.response?.data?.error ||
          "Failed to update rental request"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="rental-requests-page">
        <h1>Rental Requests</h1>
        <p>Loading rental requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rental-requests-page">
        <h1>Rental Requests</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="rental-requests-page">
      <div className="page-header">
        <div>
          <h1>Rental Requests</h1>
          <p>
            Review rental requests submitted by tenants.
          </p>
        </div>

        <button
          type="button"
          onClick={loadRequests}
          className="refresh-button"
        >
          Refresh
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <h2>No Rental Requests</h2>
          <p>
            You don't have any rental requests yet.
          </p>
        </div>
      ) : (
        <div className="rental-request-list">
          {requests.map((request) => {
            const tenant = request.tenant;
            const property = request.property;

            return (
              <div
                key={request.id}
                className="rental-request-card"
              >
                {/* PROPERTY */}
                <div className="request-property">
                  <h2>
                    {property?.titleEn ||
                      property?.title ||
                      "Property"}
                  </h2>

                  <span
                    className={`status status-${String(
                      request.status || ""
                    ).toLowerCase()}`}
                  >
                    {request.status || "PENDING"}
                  </span>
                </div>

                {/* TENANT INFORMATION */}
                <div className="tenant-section">
                  <h3>Tenant Information</h3>

                  <div className="tenant-grid">
                    <div className="tenant-field">
                      <span>Full Name</span>
                      <strong>
                        {tenant?.fullName || "Not provided"}
                      </strong>
                    </div>

                    <div className="tenant-field">
                      <span>Email</span>
                      <strong>
                        {tenant?.email || "Not provided"}
                      </strong>
                    </div>

                    <div className="tenant-field">
                      <span>Phone</span>
                      <strong>
                        {tenant?.phone || "Not provided"}
                      </strong>
                    </div>

                    <div className="tenant-field">
                      <span>Fayda Number</span>
                      <strong>
                        {tenant?.faydaNumber ||
                          "Not provided"}
                      </strong>
                    </div>

                    <div className="tenant-field">
                      <span>Gender</span>
                      <strong>
                        {tenant?.gender || "Not provided"}
                      </strong>
                    </div>

                    <div className="tenant-field">
                      <span>Marital Status</span>
                      <strong>
                        {tenant?.maritalStatus ||
                          "Not provided"}
                      </strong>
                    </div>

                    <div className="tenant-field">
                      <span>Family Members</span>
                      <strong>
                        {tenant?.familyNumber ??
                          "Not provided"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* RENTAL REQUEST INFORMATION */}
                <div className="request-section">
                  <h3>Rental Request</h3>

                  <div className="request-grid">
                    <div>
                      <span>Message</span>
                      <p>
                        {request.message ||
                          "No message provided"}
                      </p>
                    </div>

                    <div>
                      <span>Proposed Monthly Price</span>
                      <strong>
                        {request.proposedPrice
                          ? `${Number(
                              request.proposedPrice
                            ).toLocaleString()} ETB`
                          : "Not specified"}
                      </strong>
                    </div>

                    <div>
                      <span>Start Date</span>
                      <strong>
                        {request.startDate
                          ? new Date(
                              request.startDate
                            ).toLocaleDateString()
                          : "Not specified"}
                      </strong>
                    </div>

                    <div>
                      <span>End Date</span>
                      <strong>
                        {request.endDate
                          ? new Date(
                              request.endDate
                            ).toLocaleDateString()
                          : "Not specified"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}
                {request.status === "PENDING" && (
                  <div className="request-actions">
                    <button
                      type="button"
                      className="reject-button"
                      disabled={updatingId === request.id}
                      onClick={() =>
                        handleStatusUpdate(
                          request.id,
                          "REJECTED"
                        )
                      }
                    >
                      {updatingId === request.id
                        ? "Updating..."
                        : "Reject"}
                    </button>

                    <button
                      type="button"
                      className="approve-button"
                      disabled={updatingId === request.id}
                      onClick={() =>
                        handleStatusUpdate(
                          request.id,
                          "APPROVED"
                        )
                      }
                    >
                      {updatingId === request.id
                        ? "Updating..."
                        : "Approve"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
