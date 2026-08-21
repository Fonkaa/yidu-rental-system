import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  ArrowLeft,
  MapPin,
  BedDouble,
  Sofa,
  Tag,
  CheckCircle,
  Heart,
  Send,
  Navigation,
  Home,
  Image as ImageIcon,
  X,
  User,
  Mail,
  Phone,
  CreditCard,
  Users,
} from "lucide-react";

import api from "../../services/api";
import { getMyProfile } from "../../services/profileService";
import { createRentalRequest } from "../../services/rentalRequestService";

import "./PropertyDetails.css";

export default function PropertyDetails() {
  const { id } = useParams();

  // ======================================================
  // PROPERTY STATES
  // ======================================================

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeImage, setActiveImage] = useState(0);
  const [favorite, setFavorite] = useState(false);

  // ======================================================
  // RENTAL REQUEST STATES
  // ======================================================

  const [existingRentalRequest, setExistingRentalRequest] =
    useState(null);

  const [rentalRequestLoading, setRentalRequestLoading] =
    useState(false);

  const [showRequestForm, setShowRequestForm] =
    useState(false);

  const [requestLoading, setRequestLoading] =
    useState(false);

  const [requestSuccess, setRequestSuccess] =
    useState("");

  const [requestError, setRequestError] =
    useState("");

  // ======================================================
  // TENANT PROFILE STATES
  // ======================================================

  const [tenantProfile, setTenantProfile] =
    useState(null);

  const [profileLoading, setProfileLoading] =
    useState(false);

  // ======================================================
  // RENTAL REQUEST FORM
  // ======================================================

  const [requestForm, setRequestForm] = useState({
    message: "",
    proposedPrice: "",
    startDate: "",
    endDate: "",
  });

  // ======================================================
  // LOAD PROPERTY
  // ======================================================

  useEffect(() => {
    const loadProperty = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/properties/${id}`
        );

        console.log(
          "PROPERTY DETAILS:",
          response.data
        );

        const propertyData =
          response.data?.property ||
          response.data;

        if (!propertyData) {
          setError("Property not found");
          return;
        }

        setProperty(propertyData);
      } catch (err) {
        console.error(
          "LOAD PROPERTY DETAILS ERROR:",
          err
        );

        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Failed to load property details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProperty();
    } else {
      setError("Property ID is missing");
      setLoading(false);
    }
  }, [id]);

  // ======================================================
  // LOAD TENANT RENTAL REQUESTS
  // ======================================================

  const loadExistingRentalRequest = async () => {
    try {
      setRentalRequestLoading(true);

      const response = await api.get(
        "/rental-requests"
      );

      console.log(
        "TENANT RENTAL REQUESTS:",
        response.data
      );

      const requests =
        response.data?.requests ||
        response.data?.data ||
        [];

      if (!Array.isArray(requests)) {
        setExistingRentalRequest(null);
        return;
      }

      // Find request for the current property
      const currentPropertyRequest =
        requests.find((request) => {
          const requestPropertyId =
            request.propertyId ||
            request.property?.id;

          return (
            String(requestPropertyId) ===
            String(id)
          );
        });

      if (currentPropertyRequest) {
        console.log(
          "EXISTING RENTAL REQUEST:",
          currentPropertyRequest
        );
      } else {
        console.log(
          "NO EXISTING RENTAL REQUEST FOR THIS PROPERTY"
        );
      }

      setExistingRentalRequest(
        currentPropertyRequest || null
      );
    } catch (err) {
      console.error(
        "LOAD RENTAL REQUESTS ERROR:",
        err
      );

      /*
       * We don't block the property page if rental
       * requests cannot be loaded.
       *
       * The backend will still protect against
       * duplicate requests.
       */
    } finally {
      setRentalRequestLoading(false);
    }
  };

  // ======================================================
  // LOAD EXISTING REQUEST WHEN PROPERTY IS READY
  // ======================================================

  useEffect(() => {
    if (!property || !id) {
      return;
    }

    loadExistingRentalRequest();
  }, [property, id]);

  // ======================================================
  // LOAD TENANT PROFILE
  // ======================================================

  const loadTenantProfile = async () => {
    try {
      setProfileLoading(true);
      setRequestError("");

      const response = await getMyProfile();

      console.log(
        "TENANT PROFILE:",
        response
      );

      const profile =
        response?.user ||
        response?.data?.user ||
        response?.data ||
        response;

      if (!profile) {
        throw new Error(
          "Tenant profile not found"
        );
      }

      setTenantProfile(profile);
    } catch (err) {
      console.error(
        "LOAD TENANT PROFILE ERROR:",
        err
      );

      setTenantProfile(null);

      setRequestError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to load your profile"
      );
    } finally {
      setProfileLoading(false);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="property-loading">
        <div className="property-spinner" />

        <p>
          Loading property details...
        </p>
      </div>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
    return (
      <div className="property-error-page">
        <div className="property-error-card">

          <div className="error-icon">
            <Home size={28} />
          </div>

          <h2>
            Unable to load property
          </h2>

          <p>{error}</p>

          <Link
            to="/properties"
            className="back-button"
          >
            <ArrowLeft size={18} />
            Back to Properties
          </Link>

        </div>
      </div>
    );
  }

  // ======================================================
  // PROPERTY NOT FOUND
  // ======================================================

  if (!property) {
    return (
      <div className="property-error-page">
        <div className="property-error-card">

          <div className="error-icon">
            <Home size={28} />
          </div>

          <h2>
            Property not found
          </h2>

          <p>
            The property you are looking for does not
            exist or is no longer available.
          </p>

          <Link
            to="/properties"
            className="back-button"
          >
            <ArrowLeft size={18} />
            Back to Properties
          </Link>

        </div>
      </div>
    );
  }

  // ======================================================
  // PROPERTY DATA
  // ======================================================

  const images = Array.isArray(property.images)
    ? property.images
    : [];

  const locationName =
    property.location?.name ||
    property.location?.title ||
    property.location?.city ||
    property.locationName ||
    property.city ||
    "Addis Ababa";

  const categoryName =
    property.category?.name ||
    property.category?.title ||
    property.categoryName ||
    "Apartment";

  const title =
    property.titleEn ||
    property.title ||
    "Untitled Property";

  const description =
    property.descriptionEn ||
    property.description ||
    "No description available.";

  const rooms =
    property.rooms ??
    property.bedrooms ??
    0;

  const furnished =
    property.furnished === true;

  const price =
    Number(property.price || 0);

  const status =
    property.status ||
    property.listingStatus ||
    "AVAILABLE";

  const isAvailable =
    status === "AVAILABLE" ||
    status === "APPROVED";

  const landmark =
    property.landmarkDescription ||
    property.landmark ||
    "";

  const hasCoordinates =
    property.gpsLat !== null &&
    property.gpsLat !== undefined &&
    property.gpsLng !== null &&
    property.gpsLng !== undefined;

  // ======================================================
  // RENTAL REQUEST STATUS
  // ======================================================

  const rentalStatus =
    existingRentalRequest?.status ||
    null;

  const hasPendingRequest =
    rentalStatus === "PENDING";

  const hasApprovedRequest =
    rentalStatus === "APPROVED";

  const canRequestAgain =
    rentalStatus === "REJECTED" ||
    rentalStatus === "CANCELLED" ||
    !rentalStatus;

  // ======================================================
  // FAVORITE
  // ======================================================

  const handleFavorite = () => {
    setFavorite(
      (previous) => !previous
    );
  };

  // ======================================================
  // REQUEST BUTTON TEXT
  // ======================================================

  const getRequestButtonText = () => {
    if (rentalRequestLoading) {
      return "Checking Request...";
    }

    if (hasPendingRequest) {
      return "Request Pending";
    }

    if (hasApprovedRequest) {
      return "Rental Approved";
    }

    return "Request to Rent";
  };

  // ======================================================
  // REQUEST BUTTON ICON
  // ======================================================

  const getRequestButtonIcon = () => {
    if (
      hasPendingRequest ||
      hasApprovedRequest
    ) {
      return <CheckCircle size={19} />;
    }

    return <Send size={19} />;
  };

  // ======================================================
  // OPEN RENTAL REQUEST FORM
  // ======================================================

  const handleOpenRequestForm = async () => {
    setRequestSuccess("");
    setRequestError("");

    // ----------------------------------------------
    // Refresh existing request first
    // ----------------------------------------------

    await loadExistingRentalRequest();

    // ----------------------------------------------
    // Don't open form for pending request
    // ----------------------------------------------

    /*
     * We check the current state again by requesting
     * the latest rental requests directly.
     */

    try {
      const response = await api.get(
        "/rental-requests"
      );

      const requests =
        response.data?.requests ||
        response.data?.data ||
        [];

      const currentRequest =
        Array.isArray(requests)
          ? requests.find((request) => {
              const requestPropertyId =
                request.propertyId ||
                request.property?.id;

              return (
                String(requestPropertyId) ===
                String(property.id)
              );
            })
          : null;

      if (currentRequest) {
        setExistingRentalRequest(
          currentRequest
        );

        if (
          currentRequest.status ===
          "PENDING"
        ) {
          setRequestError(
            "You already have a pending rental request for this property."
          );

          return;
        }

        if (
          currentRequest.status ===
          "APPROVED"
        ) {
          setRequestError(
            "Your rental request for this property has already been approved."
          );

          return;
        }
      }
    } catch (err) {
      console.error(
        "CHECK EXISTING RENTAL REQUEST ERROR:",
        err
      );
    }

    // ----------------------------------------------
    // Load tenant profile
    // ----------------------------------------------

    setShowRequestForm(true);

    await loadTenantProfile();
  };

  // ======================================================
  // CLOSE RENTAL REQUEST
  // ======================================================

  const handleCloseRequestForm = () => {
    if (requestLoading) {
      return;
    }

    setShowRequestForm(false);
    setRequestError("");
  };

  // ======================================================
  // FORM INPUT
  // ======================================================

  const handleRequestInputChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setRequestForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  // ======================================================
  // SUBMIT RENTAL REQUEST
  // ======================================================

  const handleRentRequest = async (
    event
  ) => {
    event.preventDefault();

    if (requestLoading) {
      return;
    }

    // ----------------------------------------------
    // Check existing request before submitting
    // ----------------------------------------------

    if (
      existingRentalRequest?.status ===
      "PENDING"
    ) {
      setRequestError(
        "You already have a pending rental request for this property."
      );

      return;
    }

    if (
      existingRentalRequest?.status ===
      "APPROVED"
    ) {
      setRequestError(
        "Your rental request for this property has already been approved."
      );

      return;
    }

    // ----------------------------------------------
    // Profile must be loaded
    // ----------------------------------------------

    if (!tenantProfile) {
      setRequestError(
        "Your profile information could not be loaded. Please complete your profile first."
      );

      return;
    }

    // ----------------------------------------------
    // Start loading
    // ----------------------------------------------

    setRequestLoading(true);
    setRequestError("");
    setRequestSuccess("");

    try {
      const response =
        await createRentalRequest({
          propertyId: property.id,

          message:
            requestForm.message.trim(),

          proposedPrice:
            requestForm.proposedPrice
              ? Number(
                  requestForm.proposedPrice
                )
              : null,

          startDate:
            requestForm.startDate ||
            null,

          endDate:
            requestForm.endDate ||
            null,
        });

      console.log(
        "RENTAL REQUEST CREATED:",
        response
      );

      // --------------------------------------------
      // Update local request state immediately
      // --------------------------------------------

      const createdRequest =
        response?.request ||
        response?.data?.request ||
        null;

      if (createdRequest) {
        setExistingRentalRequest(
          createdRequest
        );
      } else {
        setExistingRentalRequest({
          propertyId: property.id,
          status: "PENDING",
        });
      }

      // --------------------------------------------
      // Success message
      // --------------------------------------------

      setRequestSuccess(
        "Rental request submitted successfully! Your request is now pending."
      );

      // --------------------------------------------
      // Clear form
      // --------------------------------------------

      setRequestForm({
        message: "",
        proposedPrice: "",
        startDate: "",
        endDate: "",
      });
    } catch (err) {
      console.error(
        "CREATE RENTAL REQUEST ERROR:",
        err
      );

      const backendError =
        err.response?.data;

      // --------------------------------------------
      // Handle duplicate request
      // --------------------------------------------

      if (
        err.response?.status === 409 ||
        backendError?.error ===
          "RENTAL_REQUEST_ALREADY_EXISTS"
      ) {
        setRequestError(
          backendError?.message ||
            "You have already submitted a rental request for this property."
        );

        // Refresh current request status
        await loadExistingRentalRequest();

        return;
      }

      // --------------------------------------------
      // Property unavailable
      // --------------------------------------------

      if (
        backendError?.error ===
        "PROPERTY_NOT_AVAILABLE"
      ) {
        setRequestError(
          backendError?.message ||
            "This property is currently not available for rental."
        );

        return;
      }

      // --------------------------------------------
      // Property not found
      // --------------------------------------------

      if (
        backendError?.error ===
        "PROPERTY_NOT_FOUND"
      ) {
        setRequestError(
          backendError?.message ||
            "Property not found."
        );

        return;
      }

      // --------------------------------------------
      // Already renting
      // --------------------------------------------

      if (
        backendError?.error ===
        "ALREADY_RENTING"
      ) {
        setRequestError(
          backendError?.message ||
            "You already have an active rental."
        );

        return;
      }

      // --------------------------------------------
      // Generic error
      // --------------------------------------------

      setRequestError(
        backendError?.message ||
          backendError?.error ||
          "Failed to submit rental request."
      );
    } finally {
      setRequestLoading(false);
    }
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <main className="property-page">

      {/* ========================================
          BACK BUTTON
      ======================================== */}

      <div className="property-container">

        <Link
          to="/properties"
          className="property-back"
        >
          <ArrowLeft size={18} />
          Back to Properties
        </Link>

      </div>

      {/* ========================================
          HEADER
      ======================================== */}

      <section className="property-container property-header">

        <div className="property-header-info">

          <div className="property-status">

            <CheckCircle size={15} />

            {isAvailable
              ? "Available Property"
              : status}

          </div>

          <h1>
            {title}
          </h1>

          <div className="property-location">

            <MapPin size={18} />

            <span>
              {locationName}
            </span>

          </div>

        </div>

        {/* FAVORITE */}

        <button
          type="button"
          className={`favorite-button ${
            favorite
              ? "favorite-active"
              : ""
          }`}
          onClick={handleFavorite}
          aria-label={
            favorite
              ? "Remove from favorites"
              : "Add to favorites"
          }
        >
          <Heart
            size={21}
            fill={
              favorite
                ? "currentColor"
                : "none"
            }
          />
        </button>

      </section>

      {/* ========================================
          IMAGE GALLERY
      ======================================== */}

      <section className="property-container">

        <div className="property-gallery">

          <div className="main-image">

            {images.length > 0 ? (
              <img
                src={
                  images[activeImage]?.url ||
                  images[activeImage]
                }
                alt={title}
              />
            ) : (
              <div className="no-image">

                <ImageIcon size={48} />

                <span>
                  No images available
                </span>

              </div>
            )}

            <div className="image-counter">

              <ImageIcon size={16} />

              {images.length > 0
                ? `${activeImage + 1} / ${images.length}`
                : "0 / 0"}

            </div>

          </div>

          {images.length > 1 && (
            <div className="image-thumbnails">

              {images.map(
                (image, index) => {

                  const imageUrl =
                    image?.url ||
                    image;

                  return (
                    <button
                      key={
                        image?.id ||
                        `${imageUrl}-${index}`
                      }
                      type="button"
                      className={`thumbnail ${
                        activeImage === index
                          ? "thumbnail-active"
                          : ""
                      }`}
                      onClick={() =>
                        setActiveImage(index)
                      }
                    >
                      <img
                        src={imageUrl}
                        alt={`${title} ${
                          index + 1
                        }`}
                      />
                    </button>
                  );
                }
              )}

            </div>
          )}

        </div>

      </section>

      {/* ========================================
          MAIN CONTENT
      ======================================== */}

      <section className="property-container property-layout">

        {/* LEFT */}

        <div className="property-main">

          {/* PROPERTY INFORMATION */}

          <div className="property-card">

            <h2>
              Property Information
            </h2>

            <div className="feature-grid">

              <div className="feature-item">

                <div className="feature-icon">
                  <BedDouble size={22} />
                </div>

                <div>
                  <span>
                    Rooms
                  </span>

                  <strong>
                    {rooms}
                  </strong>
                </div>

              </div>

              <div className="feature-item">

                <div className="feature-icon">
                  <Sofa size={22} />
                </div>

                <div>

                  <span>
                    Furnished
                  </span>

                  <strong>
                    {furnished
                      ? "Yes"
                      : "No"}
                  </strong>

                </div>

              </div>

              <div className="feature-item">

                <div className="feature-icon">
                  <Tag size={22} />
                </div>

                <div>

                  <span>
                    Category
                  </span>

                  <strong>
                    {categoryName}
                  </strong>

                </div>

              </div>

              <div className="feature-item">

                <div className="feature-icon success-icon">
                  <CheckCircle size={22} />
                </div>

                <div>

                  <span>
                    Status
                  </span>

                  <strong>
                    {status}
                  </strong>

                </div>

              </div>

            </div>

          </div>

          {/* DESCRIPTION */}

          <div className="property-card">

            <h2>
              Description
            </h2>

            <p className="description">
              {description}
            </p>

          </div>

          {/* LOCATION */}

          <div className="property-card">

            <h2>
              Location
            </h2>

            <div className="location-details">

              <div className="location-row">

                <MapPin size={20} />

                <div>

                  <span>
                    Location
                  </span>

                  <strong>
                    {locationName}
                  </strong>

                </div>

              </div>

              {landmark && (
                <div className="location-row">

                  <Navigation size={20} />

                  <div>

                    <span>
                      Landmark
                    </span>

                    <strong>
                      {landmark}
                    </strong>

                  </div>

                </div>
              )}

              {hasCoordinates && (
                <div className="location-row">

                  <MapPin size={20} />

                  <div>

                    <span>
                      Coordinates
                    </span>

                    <strong>
                      {property.gpsLat},{" "}
                      {property.gpsLng}
                    </strong>

                  </div>

                </div>
              )}

            </div>

          </div>

        </div>

        {/* ========================================
            RIGHT SIDEBAR
        ======================================== */}

        <aside className="property-sidebar">

          <div className="rent-card">

            <span className="rent-label">
              Monthly Rent
            </span>

            <div className="rent-price">

              {price.toLocaleString()}

              <small>
                {" "}ETB
              </small>

            </div>

            <span className="rent-period">
              per month
            </span>

            <div className="rent-divider" />

            {/* ====================================
                RENTAL REQUEST BUTTON
            ==================================== */}

            {!isAvailable ? (

              <button
                type="button"
                className="rent-button"
                disabled
              >
                <CheckCircle size={19} />
                Property Unavailable
              </button>

            ) : hasPendingRequest ? (

              <button
                type="button"
                className="rent-button"
                disabled
              >
                <CheckCircle size={19} />
                Request Pending
              </button>

            ) : hasApprovedRequest ? (

              <button
                type="button"
                className="rent-button"
                disabled
              >
                <CheckCircle size={19} />
                Rental Approved
              </button>

            ) : (

              <button
                type="button"
                className="rent-button"
                onClick={
                  handleOpenRequestForm
                }
                disabled={
                  rentalRequestLoading
                }
              >
                {getRequestButtonIcon()}
                {getRequestButtonText()}
              </button>

            )}

            {/* ====================================
                EXISTING REQUEST STATUS
            ==================================== */}

            {hasPendingRequest && (
              <div className="safe-message">

                <CheckCircle size={17} />

                <span>
                  Your rental request is
                  currently pending. The
                  landlord will review your
                  request.
                </span>

              </div>
            )}

            {hasApprovedRequest && (
              <div className="safe-message">

                <CheckCircle size={17} />

                <span>
                  Your rental request has
                  been approved.
                </span>

              </div>
            )}

            {/* FAVORITE */}

            <button
              type="button"
              className={`favorite-action ${
                favorite
                  ? "favorite-action-active"
                  : ""
              }`}
              onClick={handleFavorite}
            >
              <Heart
                size={19}
                fill={
                  favorite
                    ? "currentColor"
                    : "none"
                }
              />

              {favorite
                ? "Added to Favorites"
                : "Add to Favorites"}

            </button>

            {/* SAFE MESSAGE */}

            {!hasPendingRequest &&
              !hasApprovedRequest && (
                <div className="safe-message">

                  <CheckCircle size={17} />

                  <span>
                    {isAvailable
                      ? "This property has been approved and is available for rent."
                      : "This property is currently not available for rent."}
                  </span>

                </div>
              )}

          </div>

        </aside>

      </section>

      {/* ========================================
          RENTAL REQUEST MODAL
      ======================================== */}

      {showRequestForm && (

        <div className="rental-modal-overlay">

          <div className="rental-modal">

            {/* ====================================
                MODAL HEADER
            ==================================== */}

            <div className="rental-modal-header">

              <div>

                <h2>
                  Request to Rent
                </h2>

                <p>
                  Send a rental request for:
                  <strong>
                    {" "}{title}
                  </strong>
                </p>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={
                  handleCloseRequestForm
                }
                disabled={requestLoading}
                aria-label="Close"
              >
                <X size={22} />
              </button>

            </div>

            {/* ====================================
                TENANT INFORMATION
            ==================================== */}

            <div className="request-tenant-information">

              <div className="tenant-information-header">

                <div className="tenant-information-icon">
                  <User size={20} />
                </div>

                <div>

                  <h3>
                    Your Information
                  </h3>

                  <p>
                    This information will be
                    sent to the landlord with
                    your rental request.
                  </p>

                </div>

              </div>

              {profileLoading ? (

                <div className="tenant-profile-loading">

                  <div className="tenant-profile-spinner" />

                  <span>
                    Loading your information...
                  </span>

                </div>

              ) : tenantProfile ? (

                <div className="tenant-information-grid">

                  {/* FULL NAME */}

                  <div className="tenant-information-item">

                    <div className="tenant-information-item-icon">
                      <User size={17} />
                    </div>

                    <div>

                      <span>
                        Full Name
                      </span>

                      <strong>
                        {tenantProfile.fullName ||
                          "Not provided"}
                      </strong>

                    </div>

                  </div>

                  {/* EMAIL */}

                  <div className="tenant-information-item">

                    <div className="tenant-information-item-icon">
                      <Mail size={17} />
                    </div>

                    <div>

                      <span>
                        Email
                      </span>

                      <strong>
                        {tenantProfile.email ||
                          "Not provided"}
                      </strong>

                    </div>

                  </div>

                  {/* PHONE */}

                  <div className="tenant-information-item">

                    <div className="tenant-information-item-icon">
                      <Phone size={17} />
                    </div>

                    <div>

                      <span>
                        Phone
                      </span>

                      <strong>
                        {tenantProfile.phone ||
                          "Not provided"}
                      </strong>

                    </div>

                  </div>

                  {/* FAYDA */}

                  <div className="tenant-information-item">

                    <div className="tenant-information-item-icon">
                      <CreditCard size={17} />
                    </div>

                    <div>

                      <span>
                        Fayda Number
                      </span>

                      <strong>
                        {tenantProfile.faydaNumber ||
                          "Not provided"}
                      </strong>

                    </div>

                  </div>

                  {/* GENDER */}

                  <div className="tenant-information-item">

                    <div className="tenant-information-item-icon">
                      <User size={17} />
                    </div>

                    <div>

                      <span>
                        Gender
                      </span>

                      <strong>
                        {tenantProfile.gender ||
                          "Not provided"}
                      </strong>

                    </div>

                  </div>

                  {/* MARITAL STATUS */}

                  <div className="tenant-information-item">

                    <div className="tenant-information-item-icon">
                      <User size={17} />
                    </div>

                    <div>

                      <span>
                        Marital Status
                      </span>

                      <strong>
                        {tenantProfile.maritalStatus ||
                          "Not provided"}
                      </strong>

                    </div>

                  </div>

                  {/* FAMILY NUMBER */}

                  <div className="tenant-information-item">

                    <div className="tenant-information-item-icon">
                      <Users size={17} />
                    </div>

                    <div>

                      <span>
                        Family Members
                      </span>

                      <strong>
                        {tenantProfile.familyNumber ??
                          "Not provided"}
                      </strong>

                    </div>

                  </div>

                </div>

              ) : (

                <div className="request-profile-warning">

                  <User size={18} />

                  <span>
                    Your profile information
                    could not be loaded. Please
                    complete your profile before
                    submitting a rental request.
                  </span>

                </div>

              )}

            </div>

            {/* ====================================
                SUCCESS
            ==================================== */}

            {requestSuccess && (

              <div className="request-success">

                <CheckCircle size={18} />

                <span>
                  {requestSuccess}
                </span>

              </div>

            )}

            {/* ====================================
                ERROR
            ==================================== */}

            {requestError && (

              <div className="request-error">

                {requestError}

              </div>

            )}

            {/* ====================================
                FORM
            ==================================== */}

            {!requestSuccess && (

              <form
                onSubmit={handleRentRequest}
                className="rental-request-form"
              >

                {/* MESSAGE */}

                <div className="form-group">

                  <label htmlFor="message">
                    Message
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    value={
                      requestForm.message
                    }
                    onChange={
                      handleRequestInputChange
                    }
                    placeholder="Write a message to the landlord..."
                    rows="4"
                  />

                </div>

                {/* PROPOSED PRICE */}

                <div className="form-group">

                  <label htmlFor="proposedPrice">
                    Proposed Monthly Price (ETB)
                  </label>

                  <input
                    id="proposedPrice"
                    type="number"
                    name="proposedPrice"
                    value={
                      requestForm.proposedPrice
                    }
                    onChange={
                      handleRequestInputChange
                    }
                    placeholder={price}
                    min="0"
                  />

                </div>

                {/* DATES */}

                <div className="date-grid">

                  <div className="form-group">

                    <label htmlFor="startDate">
                      Start Date
                    </label>

                    <input
                      id="startDate"
                      type="date"
                      name="startDate"
                      value={
                        requestForm.startDate
                      }
                      onChange={
                        handleRequestInputChange
                      }
                    />

                  </div>

                  <div className="form-group">

                    <label htmlFor="endDate">
                      End Date
                    </label>

                    <input
                      id="endDate"
                      type="date"
                      name="endDate"
                      value={
                        requestForm.endDate
                      }
                      onChange={
                        handleRequestInputChange
                      }
                    />

                  </div>

                </div>

                {/* ACTIONS */}

                <div className="rental-form-actions">

                  <button
                    type="button"
                    className="cancel-request"
                    onClick={
                      handleCloseRequestForm
                    }
                    disabled={requestLoading}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="submit-request"
                    disabled={
                      requestLoading ||
                      profileLoading ||
                      !tenantProfile
                    }
                  >

                    <Send size={18} />

                    {requestLoading
                      ? "Submitting..."
                      : profileLoading
                      ? "Loading Profile..."
                      : "Submit Request"}

                  </button>

                </div>

              </form>

            )}

            {/* ====================================
                SUCCESS CLOSE
            ==================================== */}

            {requestSuccess && (

              <div className="rental-success-actions">

                <button
                  type="button"
                  className="submit-request"
                  onClick={() =>
                    setShowRequestForm(false)
                  }
                >
                  Done
                </button>

              </div>

            )}

          </div>

        </div>

      )}

    </main>
  );
}