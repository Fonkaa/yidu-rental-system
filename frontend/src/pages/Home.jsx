import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

import {
  Building2,
  Home,
  ShieldCheck,
  Users,
  ArrowRight,
  MapPin,
  BedDouble,
  Sofa,
  Sparkles,
  LogIn,
  UserPlus,
  CheckCircle2,
  ChevronRight,
  Server,
  Database,
  Smartphone,
  Compass,
  BarChart3,
  Search,
  RefreshCw,
  Shield,
  WalletCards,
  Check,
  ChevronLeft,
  ChevronDown,
  X,
  Mail,
  Phone,
  Layers,
  Zap,
  TrendingUp,
} from "lucide-react";

export default function PublicHome() {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  /* =========================================================
     HERO STATE
  ========================================================= */

  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
  });

  const [viewMode3D, setViewMode3D] = useState(true);

  const [activeTabRole, setActiveTabRole] = useState("tenant");

  const [activeMetricTab, setActiveMetricTab] = useState("yield");

  /* =========================================================
     PROPERTY STATE
  ========================================================= */

  const [properties, setProperties] = useState([]);

  const [loadingProperties, setLoadingProperties] = useState(false);

  const [propertyError, setPropertyError] = useState("");

  const [search, setSearch] = useState("");

  const [furnished, setFurnished] = useState("");

  const [sort, setSort] = useState("newest");

  const [minPrice, setMinPrice] = useState("");

  const [maxPrice, setMaxPrice] = useState("");

  const [rooms, setRooms] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 6;

  /* =========================================================
     PLATFORM STATS
  ========================================================= */

  const [systemStats, setSystemStats] = useState({
    totalListings: 142,
    activeTenants: 850,
    verifiedLandlords: 64,
    monthlyVolume: "12.4M ETB",
  });

  /* =========================================================
     MOUSE 3D EFFECT
  ========================================================= */

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!heroRef.current) return;

      const rect = heroRef.current.getBoundingClientRect();

      const x =
        (event.clientX - rect.left) / rect.width - 0.5;

      const y =
        (event.clientY - rect.top) / rect.height - 0.5;

      setMousePosition({
        x,
        y,
      });
    };

    const currentHero = heroRef.current;

    if (currentHero) {
      currentHero.addEventListener(
        "mousemove",
        handleMouseMove
      );
    }

    return () => {
      if (currentHero) {
        currentHero.removeEventListener(
          "mousemove",
          handleMouseMove
        );
      }
    };
  }, []);

  /* =========================================================
   LOAD APPROVED PROPERTIES
========================================================= */

useEffect(() => {
  loadProperties();
}, []);

const loadProperties = async () => {
  try {
    setLoadingProperties(true);
    setPropertyError("");

    // =====================================================
    // IMPORTANT:
    // Get ONLY properties approved by Admin
    // =====================================================

    const response = await api.get(
      "/properties/approved?limit=50"
    );

    const data = response?.data;

    let list = [];

    if (Array.isArray(data)) {
      list = data;
    } else if (Array.isArray(data?.properties)) {
      list = data.properties;
    } else if (Array.isArray(data?.data)) {
      list = data.data;
    } else if (Array.isArray(data?.items)) {
      list = data.items;
    }

    // =====================================================
    // EXTRA SAFETY:
    // Only APPROVED properties are allowed on Home
    // =====================================================

    const approvedProperties = list
      .filter((property) => {
        return (
          String(property?.status || "").toUpperCase() ===
          "APPROVED"
        );
      })
      .sort((a, b) => {
        // Most recently approved property first
        const dateA = new Date(
          a?.publishedAt ||
            a?.createdAt ||
            0
        ).getTime();

        const dateB = new Date(
          b?.publishedAt ||
            b?.createdAt ||
            0
        ).getTime();

        return dateB - dateA;
      });

    // =====================================================
    // SAVE APPROVED PROPERTIES
    // =====================================================

    setProperties(approvedProperties);

    // =====================================================
    // UPDATE STATISTICS
    // =====================================================

    setSystemStats((previous) => ({
      ...previous,

      totalListings:
        approvedProperties.length ||
        previous.totalListings,
    }));
  } catch (error) {
    console.error(
      "Failed to load approved properties:",
      error
    );

    setPropertyError(
      error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Unable to load approved properties right now."
    );

    setProperties([]);
  } finally {
    setLoadingProperties(false);
  }
};
  /* =========================================================
     PROPERTY HELPERS
  ========================================================= */

  const getPropertyTitle = (property) => {
    return (
      property?.titleEn ||
      property?.title ||
      property?.name ||
      "Beautiful Rental Home"
    );
  };

  const getPropertyDescription = (property) => {
    return (
      property?.descriptionEn ||
      property?.description ||
      "A comfortable and modern property available for rental."
    );
  };

  const getPropertyPrice = (property) => {
    const price =
      property?.price ??
      property?.monthlyRent ??
      property?.rent ??
      0;

    return Number(price) || 0;
  };

  const getPropertyRooms = (property) => {
    return (
      property?.rooms ??
      property?.bedrooms ??
      property?.roomCount ??
      0
    );
  };

  const getPropertyLocation = (property) => {
    if (typeof property?.location === "string") {
      return property.location;
    }

    return (
      property?.location?.name ||
      property?.location?.title ||
      property?.locationName ||
      property?.district ||
      property?.subCity ||
      "Addis Ababa"
    );
  };

  const getPropertyImage = (property) => {
    const images =
      property?.images ||
      property?.photos ||
      property?.propertyImages ||
      [];

    if (Array.isArray(images) && images.length > 0) {
      const first = images[0];

      if (typeof first === "string") {
        return first;
      }

      return (
        first?.url ||
        first?.imageUrl ||
        first?.path ||
        first?.image ||
        ""
      );
    }

    return (
      property?.imageUrl ||
      property?.image ||
      property?.photo ||
      ""
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US").format(price);
  };

  const isFurnished = (property) => {
    return Boolean(
      property?.furnished ||
        property?.isFurnished ||
        property?.furnishing === "FURNISHED" ||
        property?.furnishing === "Furnished"
    );
  };

  const isVerified = (property) => {
    const status = String(
      property?.status || ""
    ).toUpperCase();

    return (
      status === "APPROVED" ||
      status === "AVAILABLE" ||
      status === "PUBLISHED" ||
      property?.verified === true
    );
  };

  /* =========================================================
     FILTER PROPERTIES
  ========================================================= */

  const filteredProperties = useMemo(() => {
    let result = [...properties];

    const keyword = search.trim().toLowerCase();

    if (keyword) {
      result = result.filter((property) => {
        const searchableText = [
          getPropertyTitle(property),
          getPropertyDescription(property),
          getPropertyLocation(property),
          property?.landmarkDescription,
          property?.address,
          property?.subCity,
          property?.district,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(keyword);
      });
    }

    if (furnished === "furnished") {
      result = result.filter((property) =>
        isFurnished(property)
      );
    }

    if (furnished === "unfurnished") {
      result = result.filter(
        (property) => !isFurnished(property)
      );
    }

    if (minPrice !== "") {
      const minimum = Number(minPrice);

      if (!Number.isNaN(minimum)) {
        result = result.filter(
          (property) =>
            getPropertyPrice(property) >= minimum
        );
      }
    }

    if (maxPrice !== "") {
      const maximum = Number(maxPrice);

      if (!Number.isNaN(maximum)) {
        result = result.filter(
          (property) =>
            getPropertyPrice(property) <= maximum
        );
      }
    }

    if (rooms !== "") {
      if (rooms === "5+") {
        result = result.filter(
          (property) => getPropertyRooms(property) >= 5
        );
      } else {
        result = result.filter(
          (property) =>
            getPropertyRooms(property) === Number(rooms)
        );
      }
    }

    result.sort((a, b) => {
      if (sort === "price-low") {
        return (
          getPropertyPrice(a) -
          getPropertyPrice(b)
        );
      }

      if (sort === "price-high") {
        return (
          getPropertyPrice(b) -
          getPropertyPrice(a)
        );
      }

      if (sort === "rooms") {
        return (
          getPropertyRooms(b) -
          getPropertyRooms(a)
        );
      }

      const dateA = new Date(
        a?.createdAt ||
          a?.publishedAt ||
          0
      ).getTime();

      const dateB = new Date(
        b?.createdAt ||
          b?.publishedAt ||
          0
      ).getTime();

      return dateB - dateA;
    });

    return result;
  }, [
    properties,
    search,
    furnished,
    sort,
    minPrice,
    maxPrice,
    rooms,
  ]);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredProperties.length / ITEMS_PER_PAGE
    )
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedProperties =
    filteredProperties.slice(
      (safePage - 1) * ITEMS_PER_PAGE,
      safePage * ITEMS_PER_PAGE
    );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    furnished,
    sort,
    minPrice,
    maxPrice,
    rooms,
  ]);

  /* =========================================================
     RESET FILTERS
  ========================================================= */

  const resetFilters = () => {
    setSearch("");
    setFurnished("");
    setSort("newest");
    setMinPrice("");
    setMaxPrice("");
    setRooms("");
    setCurrentPage(1);
  };

  /* =========================================================
     SCROLL TO PROPERTIES
  ========================================================= */

  const scrollToProperties = () => {
    document
      .getElementById("properties")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans overflow-x-hidden selection:bg-yellow-500 selection:text-[#022036]">

      {/* =====================================================
          AMBIENT BACKGROUND
      ===================================================== */}

      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/4 w-[700px] h-[700px] bg-yellow-500/10 rounded-full blur-[160px]" />

        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-[160px]" />

        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px]" />
      </div>


      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <div className="bg-[#022036] text-white border-b border-yellow-500/20">

        <div className="max-w-7xl mx-auto px-5 py-2.5 flex items-center justify-between">

          <div className="flex items-center gap-2">

            <span className="
              px-2.5 py-1
              rounded-md
              bg-yellow-500
              text-[#022036]
              text-[9px]
              font-black
              uppercase
              tracking-wider
            ">
              System Live
            </span>

            <span className="hidden sm:block text-[11px] text-slate-300">
              House Rental System • Smart House Rental Platform
            </span>

          </div>

          <div className="hidden md:flex items-center gap-5 text-[10px] text-slate-300">

            <span className="flex items-center gap-1.5">
              <ShieldCheck
                size={12}
                className="text-emerald-400"
              />
              Verified Rentals
            </span>

            <span className="flex items-center gap-1.5">
              <WalletCards
                size={12}
                className="text-yellow-400"
              />
              Chapa Payments
            </span>

          </div>

        </div>

      </div>


      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="
        sticky top-0 z-50
        bg-white/90
        backdrop-blur-xl
        border-b border-slate-200
      ">

        <div className="
          max-w-7xl mx-auto
          px-5 sm:px-6
          py-3.5
          flex
          items-center
          justify-between
        ">

        {/* LOGO */}
<button
  type="button"
  onClick={() =>
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }
  className="flex items-center gap-3"
>
  {/* Logo */}
  <div
    className="
      w-16 h-16
      flex items-center justify-center
      rounded-full
      border-4 border-black/5
      bg-white
      shadow-md
      overflow-hidden
      flex-shrink-0
    "
  >
    <img
      src="/download.png"
      alt="House Rental System"
      className="w-full h-full object-cover rounded-full"
    />
  </div>

  {/* Brand Name */}
  <div className="text-left">
    <strong className="block text-sm font-black text-[#022036]">
      House Rental System
    </strong>

    <span className="block text-[8px] uppercase tracking-[0.22em] text-slate-400 font-bold">
      House Rental System
    </span>
  </div>
</button>
          {/* DESKTOP NAV */}

          <div className="
            hidden lg:flex
            items-center
            gap-8
            text-xs
            font-bold
            text-slate-600
          ">

            <a
              href="#about"
              className="hover:text-yellow-600 transition-colors"
            >
              About
            </a>

            <a
              href="#features"
              className="hover:text-yellow-600 transition-colors"
            >
              Features
            </a>

            <a
              href="#services"
              className="hover:text-yellow-600 transition-colors"
            >
              Services
            </a>

            <a
              href="#technology"
              className="hover:text-yellow-600 transition-colors"
            >
              Technology
            </a>

            <button
              type="button"
              onClick={scrollToProperties}
              className="
                hover:text-yellow-600
                transition-colors
              "
            >
              Properties
            </button>

          </div>


          {/* NAV ACTIONS */}

          <div className="flex items-center gap-2">

            <Link
              to="/login"
              className="
                hidden sm:flex
                items-center gap-1.5
                px-4 py-2.5
                rounded-xl
                border border-slate-200
                bg-white
                text-slate-700
                text-xs
                font-bold
                hover:bg-slate-50
                transition-all
              "
            >
              <LogIn size={14} />
              Login
            </Link>

            <Link
              to="/register"
              className="
                flex items-center gap-1.5
                px-4 sm:px-5
                py-2.5
                rounded-xl
                bg-[#022036]
                text-white
                text-xs
                font-black
                hover:bg-[#063653]
                transition-all
                shadow-md
              "
            >
              <UserPlus size={14} />
              <span className="hidden sm:inline">
                Get Started
              </span>
              <ArrowRight size={13} />
            </Link>

          </div>

        </div>

      </nav>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        ref={heroRef}
        id="hero-section"
        className="
          relative
          min-h-[720px]
          lg:min-h-[800px]
          overflow-hidden
          bg-[#022036]
        "
      >

        {/* HERO IMAGE */}

        <div className="absolute inset-0">

          <img
            src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2200&q=85"
            alt="Modern house interior"
            className="w-full h-full object-cover"
            style={{
              transform: viewMode3D
                ? `scale(1.06) translate(${mousePosition.x * -8}px, ${mousePosition.y * -8}px)`
                : "scale(1)",
              transition:
                "transform 0.25s ease-out",
            }}
          />

          <div className="
            absolute inset-0
            bg-[#022036]/65
          " />

          <div className="
            absolute inset-0
            bg-gradient-to-r
            from-black/80
            via-black/50
            to-black/30
          " />

        </div>


        {/* HERO CONTENT */}

        <div className="
          relative z-10
          max-w-7xl mx-auto
          px-5 sm:px-6
          pt-24
          pb-20
          min-h-[720px]
          flex
          items-center
        ">

          <div className="w-full">

            {/* BADGE */}

            <div className="
              inline-flex
              items-center
              gap-2
              px-4 py-2
              rounded-full
              border border-white/30
              bg-white/10
              backdrop-blur-xl
              text-white
              text-[10px]
              font-bold
              uppercase
              tracking-[0.18em]
              mb-7
            ">

              <Sparkles
                size={14}
                className="text-yellow-400"
              />

              Smart House Rental Platform

            </div>


           {/* TITLE */}
<h1
  className="
    max-w-5xl
    text-5xl
    sm:text-6xl
    lg:text-[82px]
    leading-[0.95]
    tracking-[-0.035em]
    font-sans
    font-extrabold
    text-white
    mb-8
  "
>
  Discover
  <br />

  <span className="text-yellow-400">
    Your Perfect Home
  </span>

  <br />

  Rent With
  <span className="ml-3">
    Confidence.
  </span>
</h1>
            {/* DESCRIPTION */}

           


            {/* HERO BUTTONS */}

            <div className="flex flex-wrap gap-3 mb-12">

              <button
                type="button"
                onClick={scrollToProperties}
                className="
                  px-7 py-3.5
                  rounded-xl
                  bg-yellow-500
                  text-[#022036]
                  font-black
                  text-xs
                  uppercase
                  tracking-wider
                  flex items-center gap-2
                  hover:bg-yellow-400
                  hover:scale-[1.02]
                  transition-all
                  shadow-xl
                "
              >
                Explore Homes
                <ArrowRight size={15} />
              </button>

              <button
                type="button"
                onClick={() =>
                  setViewMode3D(!viewMode3D)
                }
                className="
                  px-7 py-3.5
                  rounded-xl
                  bg-white/10
                  backdrop-blur-xl
                  border border-white/30
                  text-white
                  font-bold
                  text-xs
                  flex items-center gap-2
                  hover:bg-white/20
                  transition-all
                "
              >
                <Layers size={15} />

                3D Perspective

                <span className="text-yellow-400">
                  {viewMode3D
                    ? "ON"
                    : "OFF"}
                </span>
              </button>

            </div>


            {/* HERO INFO */}

            <div className="
              grid
              grid-cols-1
              sm:grid-cols-3
              gap-6
              max-w-4xl
            ">

              <div className="
                border-t
                border-white/30
                pt-4
              ">

                <span className="
                  text-[9px]
                  text-white/50
                  uppercase
                  tracking-widest
                ">
                  Rental Period
                </span>

                <strong className="
                  block
                  text-sm
                  text-white
                  mt-1
                ">
                  Flexible Monthly
                </strong>

              </div>

              <div className="
                border-t
                border-white/30
                pt-4
              ">

                <span className="
                  text-[9px]
                  text-white/50
                  uppercase
                  tracking-widest
                ">
                  Location
                </span>

                <strong className="
                  block
                  text-sm
                  text-white
                  mt-1
                ">
                  Addis Ababa, Ethiopia
                </strong>

              </div>

              <div className="
                border-t
                border-white/30
                pt-4
              ">

                <span className="
                  text-[9px]
                  text-white/50
                  uppercase
                  tracking-widest
                ">
                  Security
                </span>

                <strong className="
                  block
                  text-sm
                  text-white
                  mt-1
                ">
                  Verified & Secure
                </strong>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          ABOUT
      ===================================================== */}

      <section
        id="about"
        className="max-w-7xl mx-auto px-6 py-24"
      >

        <div className="
          grid
          grid-cols-1
          lg:grid-cols-2
          gap-14
          items-center
        ">

          <div>

            <span className="
              text-xs
              uppercase
              tracking-[0.2em]
              font-black
              text-yellow-600
            ">
              About Yidu Housing
            </span>

            <h2 className="
              text-4xl
              sm:text-5xl
              font-black
              text-[#022036]
              mt-3
              leading-tight
            ">
              A smarter way to
              <br />
              find and manage
              <br />
              your next home.
            </h2>

            <p className="
              text-slate-500
              text-sm
              leading-7
              mt-6
              max-w-xl
            ">
              Yidu Housing connects tenants, landlords and
              administrators through one modern digital
              rental ecosystem. Search properties, compare
              homes, submit rental requests, communicate
              directly and manage rental operations from one
              platform.
            </p>

            <div className="
              grid
              grid-cols-2
              gap-4
              mt-8
            ">

              {[
                ["3D Tours", "Immersive property experience"],
                ["Verified", "Trusted rental listings"],
                ["Chapa", "Secure rent payments"],
                ["Analytics", "Real-time portfolio insights"],
              ].map(([title, desc]) => (
                <div
                  key={title}
                  className="
                    p-4
                    rounded-2xl
                    bg-white
                    border border-slate-200
                    shadow-sm
                  "
                >
                  <strong className="
                    block
                    text-sm
                    font-black
                    text-[#022036]
                  ">
                    {title}
                  </strong>

                  <span className="
                    block
                    text-[11px]
                    text-slate-400
                    mt-1
                  ">
                    {desc}
                  </span>
                </div>
              ))}

            </div>

          </div>


          <div className="relative">

            <div className="
              rounded-[2rem]
              overflow-hidden
              shadow-2xl
              border border-slate-200
            ">

              <img
                src="https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=85"
                alt="Modern rental home"
                className="
                  w-full
                  h-[500px]
                  object-cover
                "
              />

            </div>

            <div className="
              absolute
              -bottom-6
              -left-6
              bg-white
              border border-slate-200
              shadow-xl
              rounded-2xl
              p-5
              max-w-[230px]
            ">

              <div className="
                flex items-center gap-2
                text-emerald-600
                text-xs
                font-black
              ">
                <CheckCircle2 size={16} />
                Verified Platform
              </div>

              <p className="
                text-[11px]
                text-slate-500
                mt-2
                leading-5
              ">
                Designed to make property rental simpler,
                safer and more transparent.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FEATURES
      ===================================================== */}

      <section
        id="features"
        className="
          bg-[#022036]
          text-white
          py-24
        "
      >

        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-14">

            <span className="
              text-xs
              uppercase
              tracking-[0.2em]
              font-black
              text-yellow-400
            ">
              Powerful Features
            </span>

            <h2 className="
              text-4xl
              sm:text-5xl
              font-black
              mt-3
            ">
              Everything you need
              <br />
              for modern renting.
            </h2>

          </div>


          <div className="
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-4
            gap-5
          ">

            {[
              {
                icon: Compass,
                title: "Smart Property Search",
                desc: "Find homes using advanced location, price, room and furnishing filters.",
              },
              {
                icon: Layers,
                title: "3D Property Experience",
                desc: "Explore immersive property models before submitting your rental request.",
              },
              {
                icon: ShieldCheck,
                title: "Verified Rentals",
                desc: "Build trust with verified landlords and controlled listing approval.",
              },
              {
                icon: WalletCards,
                title: "Secure Payments",
                desc: "Process monthly rental payments securely through Chapa.",
              },
            ].map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="
                    p-7
                    rounded-3xl
                    bg-white/5
                    border border-white/10
                    hover:bg-white/10
                    transition-all
                  "
                >

                  <div className="
                    w-12 h-12
                    rounded-2xl
                    bg-yellow-500
                    text-[#022036]
                    flex items-center justify-center
                    mb-5
                  ">
                    <Icon size={23} />
                  </div>

                  <h3 className="
                    text-base
                    font-black
                  ">
                    {feature.title}
                  </h3>

                  <p className="
                    text-xs
                    text-slate-300
                    leading-6
                    mt-3
                  ">
                    {feature.desc}
                  </p>

                </div>
              );
            })}

          </div>

        </div>

      </section>


      {/* =====================================================
          ADVANCED PROPERTY EXPLORER
      ===================================================== */}

      <section
        id="properties"
        className="
          bg-slate-50
          border-y border-slate-200
        "
      >

        <div className="
          max-w-7xl
          mx-auto
          px-6
          py-24
        ">

          {/* HEADER */}

          <div className="text-center mb-12">

            <div className="
              inline-flex
              items-center
              gap-2
              px-4 py-2
              rounded-full
              bg-white
              border border-slate-200
              shadow-sm
              mb-5
            ">

              <Zap
                size={14}
                className="text-yellow-500"
              />

              <span className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.2em]
                text-[#022036]
              ">
                Lightning-Fast Advanced Explorer
              </span>

            </div>

            <h2 className="
              text-4xl
              sm:text-5xl
              font-black
              text-[#022036]
            ">
              Explore Available Properties
            </h2>

            <p className="
              text-sm
              text-slate-500
              max-w-2xl
              mx-auto
              mt-4
              leading-6
            ">
              Search verified rental homes using intelligent
              filters for price, rooms, location and
              furnishing.
            </p>

            <p className="
              text-xs
              text-slate-400
              mt-3
            ">
              Showing{" "}
              <strong className="text-[#022036]">
                {filteredProperties.length}
              </strong>{" "}
              verified database listings
              {" "}({ITEMS_PER_PAGE} listings per page).
            </p>

          </div>


          {/* MAIN EXPLORER */}

          <div className="
            bg-white
            border border-slate-200
            rounded-[2rem]
            shadow-xl
            overflow-hidden
          ">

            {/* SEARCH BAR HEADER */}

            <div className="
              bg-[#022036]
              px-6
              sm:px-8
              py-7
            ">

              <div className="
                flex
                flex-col
                lg:flex-row
                lg:items-center
                lg:justify-between
                gap-5
              ">

                <div>

                  <div className="
                    flex
                    items-center
                    gap-2
                  ">

                    <Search
                      size={20}
                      className="text-yellow-400"
                    />

                    <h3 className="
                      text-lg
                      font-black
                      text-white
                    ">
                      Find Your Perfect Home
                    </h3>

                  </div>

                  <p className="
                    text-xs
                    text-slate-300
                    mt-1
                  ">
                    Search by title, sub-city, district or
                    landmark.
                  </p>

                </div>


                <button
                  type="button"
                  onClick={resetFilters}
                  className="
                    self-start
                    lg:self-auto
                    px-5
                    py-2.5
                    rounded-xl
                    bg-white/10
                    border border-white/20
                    hover:bg-white/20
                    text-white
                    text-xs
                    font-bold
                    flex
                    items-center
                    gap-2
                    transition-all
                  "
                >

                  <RefreshCw size={14} />

                  Reset Filters

                </button>

              </div>

            </div>


            {/* FILTER AREA */}

            <div className="p-6 sm:p-8">

              <div className="
                grid
                grid-cols-1
                md:grid-cols-2
                lg:grid-cols-3
                gap-5
              ">

                {/* SEARCH */}

                <div className="lg:col-span-2">

                  <label className="
                    block
                    text-[10px]
                    font-black
                    text-[#022036]
                    uppercase
                    tracking-widest
                    mb-2
                  ">
                    Search Keyword / Location
                  </label>

                  <div className="relative">

                    <Search
                      size={17}
                      className="
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                      "
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                      placeholder="Search by title, sub-city, district, or landmark..."
                      className="
                        w-full
                        pl-11
                        pr-4
                        py-3.5
                        rounded-xl
                        border border-slate-200
                        bg-slate-50
                        text-sm
                        outline-none
                        focus:border-yellow-500
                        focus:ring-4
                        focus:ring-yellow-500/10
                        transition-all
                      "
                    />

                  </div>

                </div>


                {/* FURNISHED */}

                <div>

                  <label className="
                    block
                    text-[10px]
                    font-black
                    text-[#022036]
                    uppercase
                    tracking-widest
                    mb-2
                  ">
                    Furnished Status
                  </label>

                  <div className="relative">

                    <select
                      value={furnished}
                      onChange={(e) =>
                        setFurnished(e.target.value)
                      }
                      className="
                        appearance-none
                        w-full
                        px-4
                        py-3.5
                        pr-10
                        rounded-xl
                        border border-slate-200
                        bg-slate-50
                        text-sm
                        text-slate-700
                        outline-none
                        focus:border-yellow-500
                      "
                    >
                      <option value="">
                        All Furnishing
                      </option>

                      <option value="furnished">
                        Furnished
                      </option>

                      <option value="unfurnished">
                        Unfurnished
                      </option>

                    </select>

                    <ChevronDown
                      size={15}
                      className="
                        absolute
                        right-4
                        top-1/2
                        -translate-y-1/2
                        pointer-events-none
                        text-slate-400
                      "
                    />

                  </div>

                </div>


                {/* SORT */}

                <div>

                  <label className="
                    block
                    text-[10px]
                    font-black
                    text-[#022036]
                    uppercase
                    tracking-widest
                    mb-2
                  ">
                    Sort Results By
                  </label>

                  <div className="relative">

                    <select
                      value={sort}
                      onChange={(e) =>
                        setSort(e.target.value)
                      }
                      className="
                        appearance-none
                        w-full
                        px-4
                        py-3.5
                        pr-10
                        rounded-xl
                        border border-slate-200
                        bg-slate-50
                        text-sm
                        text-slate-700
                        outline-none
                        focus:border-yellow-500
                      "
                    >

                      <option value="newest">
                        Newest First
                      </option>

                      <option value="price-low">
                        Price: Low to High
                      </option>

                      <option value="price-high">
                        Price: High to Low
                      </option>

                      <option value="rooms">
                        Most Rooms
                      </option>

                    </select>

                    <ChevronDown
                      size={15}
                      className="
                        absolute
                        right-4
                        top-1/2
                        -translate-y-1/2
                        pointer-events-none
                        text-slate-400
                      "
                    />

                  </div>

                </div>


                {/* MIN PRICE */}

                <div>

                  <label className="
                    block
                    text-[10px]
                    font-black
                    text-[#022036]
                    uppercase
                    tracking-widest
                    mb-2
                  ">
                    Min Price (ETB)
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(e) =>
                      setMinPrice(e.target.value)
                    }
                    placeholder="e.g. 5000"
                    className="
                      w-full
                      px-4
                      py-3.5
                      rounded-xl
                      border border-slate-200
                      bg-slate-50
                      text-sm
                      outline-none
                      focus:border-yellow-500
                      focus:ring-4
                      focus:ring-yellow-500/10
                    "
                  />

                </div>


                {/* MAX PRICE */}

                <div>

                  <label className="
                    block
                    text-[10px]
                    font-black
                    text-[#022036]
                    uppercase
                    tracking-widest
                    mb-2
                  ">
                    Max Price (ETB)
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(e) =>
                      setMaxPrice(e.target.value)
                    }
                    placeholder="e.g. 50000"
                    className="
                      w-full
                      px-4
                      py-3.5
                      rounded-xl
                      border border-slate-200
                      bg-slate-50
                      text-sm
                      outline-none
                      focus:border-yellow-500
                      focus:ring-4
                      focus:ring-yellow-500/10
                    "
                  />

                </div>


                {/* ROOMS */}

                <div>

                  <label className="
                    block
                    text-[10px]
                    font-black
                    text-[#022036]
                    uppercase
                    tracking-widest
                    mb-2
                  ">
                    Number of Rooms
                  </label>

                  <div className="relative">

                    <select
                      value={rooms}
                      onChange={(e) =>
                        setRooms(e.target.value)
                      }
                      className="
                        appearance-none
                        w-full
                        px-4
                        py-3.5
                        pr-10
                        rounded-xl
                        border border-slate-200
                        bg-slate-50
                        text-sm
                        text-slate-700
                        outline-none
                        focus:border-yellow-500
                      "
                    >

                      <option value="">
                        Any Rooms
                      </option>

                      <option value="1">
                        1 Room
                      </option>

                      <option value="2">
                        2 Rooms
                      </option>

                      <option value="3">
                        3 Rooms
                      </option>

                      <option value="4">
                        4 Rooms
                      </option>

                      <option value="5+">
                        5+ Rooms
                      </option>

                    </select>

                    <ChevronDown
                      size={15}
                      className="
                        absolute
                        right-4
                        top-1/2
                        -translate-y-1/2
                        pointer-events-none
                        text-slate-400
                      "
                    />

                  </div>

                </div>

              </div>


              {/* ACTIVE FILTERS */}

              {(search ||
                furnished ||
                minPrice ||
                maxPrice ||
                rooms ||
                sort !== "newest") && (

                <div className="
                  flex
                  flex-wrap
                  items-center
                  gap-2
                  mt-6
                  pt-5
                  border-t border-slate-100
                ">

                  <span className="
                    text-[10px]
                    font-black
                    uppercase
                    tracking-widest
                    text-slate-400
                  ">
                    Active:
                  </span>

                  {search && (
                    <FilterBadge
                      label={`Search: ${search}`}
                      onRemove={() => setSearch("")}
                    />
                  )}

                  {furnished && (
                    <FilterBadge
                      label={
                        furnished === "furnished"
                          ? "Furnished"
                          : "Unfurnished"
                      }
                      onRemove={() =>
                        setFurnished("")
                      }
                    />
                  )}

                  {minPrice && (
                    <FilterBadge
                      label={`Min: ${formatPrice(
                        Number(minPrice)
                      )} ETB`}
                      onRemove={() =>
                        setMinPrice("")
                      }
                    />
                  )}

                  {maxPrice && (
                    <FilterBadge
                      label={`Max: ${formatPrice(
                        Number(maxPrice)
                      )} ETB`}
                      onRemove={() =>
                        setMaxPrice("")
                      }
                    />
                  )}

                  {rooms && (
                    <FilterBadge
                      label={`Rooms: ${rooms}`}
                      onRemove={() =>
                        setRooms("")
                      }
                    />
                  )}

                </div>
              )}


              {/* RESULTS HEADER */}

              <div className="
                mt-12
                mb-6
                flex
                flex-col
                sm:flex-row
                sm:items-center
                sm:justify-between
                gap-3
              ">

                <div>

                  <h3 className="
                    text-xl
                    font-black
                    text-[#022036]
                  ">
                    Available Homes
                  </h3>

                  <p className="
                    text-xs
                    text-slate-400
                    mt-1
                  ">
                    Showing{" "}
                    {filteredProperties.length === 0
                      ? 0
                      : (safePage - 1) *
                          ITEMS_PER_PAGE +
                        1}
                    -
                    {Math.min(
                      safePage * ITEMS_PER_PAGE,
                      filteredProperties.length
                    )}{" "}
                    of{" "}
                    {filteredProperties.length}{" "}
                    properties
                  </p>

                </div>


                <span className="
                  inline-flex
                  items-center
                  gap-1.5
                  self-start
                  sm:self-auto
                  px-3
                  py-1.5
                  rounded-full
                  bg-emerald-50
                  border border-emerald-200
                  text-emerald-700
                  text-[10px]
                  font-black
                ">

                  <span className="
                    w-1.5
                    h-1.5
                    rounded-full
                    bg-emerald-500
                  " />

                  LIVE DATABASE

                </span>

              </div>


              {/* ERROR */}

              {propertyError && (
                <div className="
                  mb-6
                  p-4
                  rounded-2xl
                  bg-red-50
                  border border-red-200
                  text-red-700
                  text-xs
                  flex
                  items-center
                  justify-between
                  gap-4
                ">

                  <span>
                    {propertyError}
                  </span>

                  <button
                    type="button"
                    onClick={loadProperties}
                    className="
                      px-4
                      py-2
                      rounded-lg
                      bg-red-600
                      text-white
                      font-bold
                    "
                  >
                    Retry
                  </button>

                </div>
              )}


              {/* LOADING */}

              {loadingProperties && (
                <div className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  lg:grid-cols-3
                  gap-6
                ">

                  {Array.from({
                    length: 6,
                  }).map((_, index) => (
                    <div
                      key={index}
                      className="
                        rounded-2xl
                        border border-slate-200
                        bg-white
                        overflow-hidden
                        animate-pulse
                      "
                    >

                      <div className="
                        h-56
                        bg-slate-200
                      " />

                      <div className="p-5 space-y-3">

                        <div className="
                          h-4
                          bg-slate-200
                          rounded
                          w-3/4
                        " />

                        <div className="
                          h-3
                          bg-slate-200
                          rounded
                          w-1/2
                        " />

                        <div className="
                          h-8
                          bg-slate-200
                          rounded
                        " />

                      </div>

                    </div>
                  ))}

                </div>
              )}


              {/* PROPERTY CARDS */}

              {!loadingProperties &&
                paginatedProperties.length > 0 && (

                  <div className="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    lg:grid-cols-3
                    gap-6
                  ">

                    {paginatedProperties.map(
                      (property, index) => (
                        <PropertyCard
                          key={
                            property?.id ||
                            property?._id ||
                            index
                          }
                          property={property}
                          getTitle={getPropertyTitle}
                          getPrice={getPropertyPrice}
                          getRooms={getPropertyRooms}
                          getLocation={
                            getPropertyLocation
                          }
                          getImage={getPropertyImage}
                          formatPrice={formatPrice}
                          isFurnished={
                            isFurnished
                          }
                          isVerified={isVerified}
                          navigate={navigate}
                        />
                      )
                    )}

                  </div>
                )}


              {/* EMPTY STATE */}

              {!loadingProperties &&
                paginatedProperties.length === 0 && (

                  <div className="
                    min-h-[320px]
                    flex
                    flex-col
                    items-center
                    justify-center
                    text-center
                    rounded-3xl
                    border-2
                    border-dashed
                    border-slate-200
                    bg-slate-50
                    px-6
                  ">

                    <div className="
                      w-16 h-16
                      rounded-2xl
                      bg-white
                      border border-slate-200
                      shadow-sm
                      flex
                      items-center
                      justify-center
                      mb-5
                    ">

                      <Home
                        size={28}
                        className="text-slate-400"
                      />

                    </div>

                    <h4 className="
                      text-lg
                      font-black
                      text-[#022036]
                    ">
                      No properties match your filter
                      criteria.
                    </h4>

                    <p className="
                      text-sm
                      text-slate-500
                      mt-2
                      max-w-md
                    ">
                      Try clearing or adjusting your
                      search filters to view more listings.
                    </p>

                    <button
                      type="button"
                      onClick={resetFilters}
                      className="
                        mt-5
                        px-5
                        py-2.5
                        rounded-xl
                        bg-[#022036]
                        text-white
                        text-xs
                        font-bold
                        hover:bg-[#063653]
                        transition-all
                        flex
                        items-center
                        gap-2
                      "
                    >

                      <RefreshCw size={14} />

                      Reset All Filters

                    </button>

                  </div>
                )}


              {/* PAGINATION */}

              {!loadingProperties &&
                filteredProperties.length > 0 && (

                  <div className="
                    mt-10
                    pt-6
                    border-t border-slate-100
                    flex
                    items-center
                    justify-center
                    gap-2
                  ">

                    <button
                      type="button"
                      disabled={safePage === 1}
                      onClick={() =>
                        setCurrentPage(
                          (page) =>
                            Math.max(
                              1,
                              page - 1
                            )
                        )
                      }
                      className="
                        w-10 h-10
                        rounded-xl
                        border border-slate-200
                        bg-white
                        flex
                        items-center
                        justify-center
                        disabled:opacity-40
                        disabled:cursor-not-allowed
                        hover:bg-slate-50
                      "
                    >
                      <ChevronLeft size={17} />
                    </button>


                    {Array.from({
                      length: totalPages,
                    }).map((_, index) => {
                      const page = index + 1;

                      if (
                        totalPages > 7 &&
                        page !== 1 &&
                        page !== totalPages &&
                        Math.abs(
                          page - safePage
                        ) > 1
                      ) {
                        return null;
                      }

                      return (
                        <button
                          type="button"
                          key={page}
                          onClick={() =>
                            setCurrentPage(page)
                          }
                          className={`
                            w-10
                            h-10
                            rounded-xl
                            text-xs
                            font-black
                            transition-all
                            ${
                              safePage === page
                                ? "bg-yellow-500 text-[#022036]"
                                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                            }
                          `}
                        >
                          {page}
                        </button>
                      );
                    })}


                    <button
                      type="button"
                      disabled={
                        safePage === totalPages
                      }
                      onClick={() =>
                        setCurrentPage(
                          (page) =>
                            Math.min(
                              totalPages,
                              page + 1
                            )
                        )
                      }
                      className="
                        w-10 h-10
                        rounded-xl
                        border border-slate-200
                        bg-white
                        flex
                        items-center
                        justify-center
                        disabled:opacity-40
                        disabled:cursor-not-allowed
                        hover:bg-slate-50
                      "
                    >
                      <ChevronRight size={17} />
                    </button>

                  </div>

                )}

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          SERVICES
      ===================================================== */}

      <section
        id="services"
        className="max-w-7xl mx-auto px-6 py-24"
      >

        <div className="text-center mb-14">

          <span className="
            text-xs
            uppercase
            tracking-[0.2em]
            font-black
            text-yellow-600
          ">
            Our Services
          </span>

          <h2 className="
            text-4xl
            sm:text-5xl
            font-black
            text-[#022036]
            mt-3
          ">
            One ecosystem.
            <br />
            Three powerful experiences.
          </h2>

        </div>


        <div className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-6
        ">

          {[
            {
              icon: Users,
              title: "For Tenants",
              desc: "Search homes, save favorites, communicate with landlords, submit rental requests and manage your lease.",
              color: "sky",
            },
            {
              icon: Building2,
              title: "For Landlords",
              desc: "Publish properties, manage listings, review tenant requests and monitor rental portfolio performance.",
              color: "yellow",
            },
            {
              icon: ShieldCheck,
              title: "For Administrators",
              desc: "Verify listings, manage users, moderate properties and maintain platform security.",
              color: "emerald",
            },
          ].map((service) => {

            const Icon = service.icon;

            return (
              <div
                key={service.title}
                className="
                  p-8
                  rounded-3xl
                  bg-white
                  border border-slate-200
                  shadow-sm
                  hover:shadow-xl
                  hover:-translate-y-1
                  transition-all
                "
              >

                <div className="
                  w-14 h-14
                  rounded-2xl
                  bg-[#022036]
                  text-yellow-400
                  flex items-center justify-center
                  mb-6
                ">
                  <Icon size={26} />
                </div>

                <h3 className="
                  text-xl
                  font-black
                  text-[#022036]
                ">
                  {service.title}
                </h3>

                <p className="
                  text-sm
                  text-slate-500
                  leading-6
                  mt-3
                ">
                  {service.desc}
                </p>

                <div className="
                  mt-6
                  pt-5
                  border-t border-slate-100
                  flex
                  items-center
                  gap-2
                  text-xs
                  font-bold
                  text-yellow-600
                ">
                  Learn more
                  <ArrowRight size={14} />
                </div>

              </div>
            );

          })}

        </div>

      </section>


      {/* =====================================================
          ANALYTICS
      ===================================================== */}

      <section
        id="analytics-section"
        className="
          bg-slate-100
          border-y border-slate-200
          py-24
        "
      >

        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-12">

            <span className="
              text-xs
              uppercase
              tracking-[0.2em]
              font-black
              text-yellow-600
            ">
              Real-Time Intelligence
            </span>

            <h2 className="
              text-4xl
              sm:text-5xl
              font-black
              text-[#022036]
              mt-3
            ">
              Platform Market Analytics
            </h2>

            <p className="
              text-sm
              text-slate-500
              max-w-xl
              mx-auto
              mt-3
            ">
              Understand property demand, rental yields and
              portfolio performance.
            </p>

          </div>


          {/* TABS */}

          <div className="
            flex
            justify-center
            flex-wrap
            gap-2
            mb-8
          ">

            {[
              {
                id: "yield",
                label: "Rental Yield",
              },
              {
                id: "demand",
                label: "Regional Demand",
              },
              {
                id: "occupancy",
                label: "Occupancy",
              },
            ].map((tab) => (

              <button
                type="button"
                key={tab.id}
                onClick={() =>
                  setActiveMetricTab(tab.id)
                }
                className={`
                  px-5
                  py-2.5
                  rounded-xl
                  text-xs
                  font-bold
                  transition-all
                  ${
                    activeMetricTab === tab.id
                      ? "bg-yellow-500 text-[#022036]"
                      : "bg-white text-slate-600 border border-slate-200"
                  }
                `}
              >
                {tab.label}
              </button>

            ))}

          </div>


          <div className="
            grid
            grid-cols-1
            lg:grid-cols-3
            gap-6
          ">

            {/* CHART */}

            <div className="
              lg:col-span-2
              bg-white
              rounded-3xl
              border border-slate-200
              p-8
            ">

              <div className="
                flex
                items-center
                justify-between
                mb-8
              ">

                <div>

                  <h3 className="
                    text-lg
                    font-black
                    text-[#022036]
                  ">
                    {activeMetricTab === "yield"
                      ? "Rental Yield by District"
                      : activeMetricTab ===
                        "demand"
                      ? "Tenant Demand Index"
                      : "Portfolio Occupancy"}
                  </h3>

                  <p className="
                    text-xs
                    text-slate-400
                    mt-1
                  ">
                    Platform analytics overview
                  </p>

                </div>

                <BarChart3
                  size={22}
                  className="text-yellow-500"
                />

              </div>


              <div className="space-y-5">

                {[
                  ["Bole", 88, "14.2%"],
                  ["Kazanchis", 76, "11.8%"],
                  ["CMC / Ayat", 64, "9.5%"],
                  ["Piassa / Arat Kilo", 81, "12.6%"],
                  ["Summit / Gurd Shola", 70, "10.2%"],
                ].map(
                  ([name, value, percentage]) => (

                    <div key={name}>

                      <div className="
                        flex
                        justify-between
                        mb-2
                        text-xs
                        font-bold
                      ">

                        <span className="text-slate-700">
                          {name}
                        </span>

                        <span className="text-yellow-600">
                          {percentage}
                        </span>

                      </div>

                      <div className="
                        h-3
                        rounded-full
                        bg-slate-100
                        overflow-hidden
                      ">

                        <div
                          className="
                            h-full
                            bg-[#022036]
                            rounded-full
                            transition-all
                            duration-1000
                          "
                          style={{
                            width: `${value}%`,
                          }}
                        />

                      </div>

                    </div>

                  )
                )}

              </div>


              <div className="
                grid
                grid-cols-3
                gap-3
                mt-10
                pt-6
                border-t border-slate-100
              ">

                <Metric
                  title="Average Rent"
                  value="18,500 ETB"
                />

                <Metric
                  title="Growth Rate"
                  value="+14.2% YoY"
                />

                <Metric
                  title="Avg. Liquidity"
                  value="14 Days"
                />

              </div>

            </div>


            {/* HEALTH */}

            <div className="
              bg-[#022036]
              text-white
              rounded-3xl
              p-8
            ">

              <div className="
                flex
                items-center
                gap-2
                mb-3
              ">

                <ActivityIcon />

                <h3 className="font-black">
                  Ecosystem Health
                </h3>

              </div>

              <p className="
                text-xs
                text-slate-300
                leading-6
              ">
                Platform performance indicators for
                verification, payments and lease operations.
              </p>


              <div className="space-y-5 mt-8">

                <HealthBar
                  label="Verified Landlord Trust"
                  value="99.1%"
                  width="99.1%"
                />

                <HealthBar
                  label="Payment Success"
                  value="100%"
                  width="100%"
                />

                <HealthBar
                  label="Lease Compliance"
                  value="92.4%"
                  width="92.4%"
                />

              </div>


              <div className="
                mt-8
                p-4
                rounded-2xl
                bg-yellow-500
                text-[#022036]
                text-xs
                font-bold
              ">

                <div className="
                  flex
                  items-center
                  gap-2
                ">
                  <Sparkles size={15} />

                  Built for transparent digital renting.

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          ROLE ECOSYSTEM
      ===================================================== */}

      <section
        id="ecosystem-roles"
        className="max-w-7xl mx-auto px-6 py-24"
      >

        <div className="text-center mb-12">

          <span className="
            text-xs
            uppercase
            tracking-[0.2em]
            font-black
            text-yellow-600
          ">
            Multi-Tier Architecture
          </span>

          <h2 className="
            text-4xl
            sm:text-5xl
            font-black
            text-[#022036]
            mt-3
          ">
            Designed for every role.
          </h2>

        </div>


        {/* ROLE TABS */}

        <div className="
          flex
          justify-center
          flex-wrap
          gap-2
          mb-10
        ">

          {[
            ["tenant", "Tenant"],
            ["landlord", "Landlord"],
            ["admin", "Administrator"],
          ].map(([id, label]) => (

            <button
              type="button"
              key={id}
              onClick={() =>
                setActiveTabRole(id)
              }
              className={`
                px-6
                py-3
                rounded-xl
                text-xs
                font-bold
                transition-all
                ${
                  activeTabRole === id
                    ? "bg-yellow-500 text-[#022036]"
                    : "bg-white text-slate-600 border border-slate-200"
                }
              `}
            >
              {label}
            </button>

          ))}

        </div>


        {/* ROLE CONTENT */}

        <div className="
          bg-white
          border border-slate-200
          rounded-[2rem]
          shadow-sm
          p-8
          sm:p-12
        ">

          {activeTabRole === "tenant" && (
            <RoleContent
              icon={Users}
              title="Tenant Portal"
              subtitle="Find, request and manage your next home."
              color="sky"
              button="Register as Tenant"
              items={[
                "Advanced property search",
                "3D property previews",
                "Favorites and saved homes",
                "Rental request tracking",
                "Direct landlord messaging",
                "Lease management",
              ]}
            />
          )}


          {activeTabRole === "landlord" && (
            <RoleContent
              icon={Building2}
              title="Landlord Hub"
              subtitle="Manage properties, tenants and rental performance."
              color="yellow"
              button="Register as Landlord"
              items={[
                "Property listing management",
                "Multiple property photos",
                "Tenant rental request review",
                "Portfolio analytics",
                "Rental income monitoring",
                "Listing expiry and renewal",
              ]}
            />
          )}


          {activeTabRole === "admin" && (
            <RoleContent
              icon={ShieldCheck}
              title="Admin Command Center"
              subtitle="Maintain platform trust, security and governance."
              color="emerald"
              button="Admin Sign In"
              items={[
                "Property approval and rejection",
                "User management",
                "Fayda verification control",
                "Platform monitoring",
                "Commission management",
                "System backup and oversight",
              ]}
            />
          )}

        </div>

      </section>


      {/* =====================================================
          TECHNOLOGY
      ===================================================== */}

      <section
        id="technology"
        className="
          bg-[#022036]
          text-white
          py-24
        "
      >

        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-14">

            <span className="
              text-xs
              uppercase
              tracking-[0.2em]
              font-black
              text-yellow-400
            ">
              System Engineering
            </span>

            <h2 className="
              text-4xl
              sm:text-5xl
              font-black
              mt-3
            ">
              Built with modern technology.
            </h2>

          </div>


          <div className="
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-4
            gap-5
          ">

            {[
              {
                icon: Smartphone,
                title: "React Frontend",
                desc: "Modern responsive interface with React, Vite, Tailwind CSS and Lucide icons.",
              },
              {
                icon: Server,
                title: "Node.js Backend",
                desc: "Express REST API with JWT authentication and secure middleware.",
              },
              {
                icon: Database,
                title: "PostgreSQL + Prisma",
                desc: "Reliable relational data management using PostgreSQL and Prisma ORM.",
              },
              {
                icon: Shield,
                title: "Secure Payments",
                desc: "Chapa integration for secure rental transactions and payment validation.",
              },
            ].map((tech) => {

              const Icon = tech.icon;

              return (
                <div
                  key={tech.title}
                  className="
                    p-7
                    rounded-3xl
                    bg-white/5
                    border border-white/10
                  "
                >

                  <div className="
                    w-12 h-12
                    rounded-2xl
                    bg-white
                    text-[#022036]
                    flex items-center justify-center
                    mb-5
                  ">
                    <Icon size={23} />
                  </div>

                  <h3 className="
                    font-black
                    text-base
                  ">
                    {tech.title}
                  </h3>

                  <p className="
                    text-xs
                    text-slate-300
                    leading-6
                    mt-3
                  ">
                    {tech.desc}
                  </p>

                </div>
              );

            })}

          </div>

        </div>

      </section>


           {/* =====================================================
          CTA
      ===================================================== */}

      <section className="
        max-w-7xl
        mx-auto
        px-6
        py-24
      ">

        <div className="
          relative
          overflow-hidden
          rounded-[2rem]
          bg-yellow-500
          p-8
          sm:p-12
          lg:p-16
        ">

          <div className="
            absolute
            -right-20
            -top-20
            w-72
            h-72
            rounded-full
            bg-white/20
            blur-3xl
          " />

          <div className="relative z-10 max-w-2xl">

            <span className="
              text-[10px]
              uppercase
              tracking-[0.2em]
              font-black
              text-[#022036]/70
            ">
              Start Today
            </span>

            <h2 className="
              text-4xl
              sm:text-5xl
              font-black
              text-[#022036]
              mt-2
            ">
              Ready to find your next home?
            </h2>

            <p className="
              text-sm
              text-[#022036]/70
              mt-4
              max-w-xl
              leading-6
            ">
              Search verified properties, connect with
              landlords and manage your rental journey from
              one powerful platform.
            </p>

            <div className="
              flex
              flex-wrap
              gap-3
              mt-7
            ">

              <button
                type="button"
                onClick={scrollToProperties}
                className="
                  px-6
                  py-3.5
                  rounded-xl
                  bg-[#022036]
                  text-white
                  text-xs
                  font-black
                  flex
                  items-center
                  gap-2
                  hover:bg-[#063653]
                  transition-all
                "
              >
                Explore Properties
                <ArrowRight size={15} />
              </button>

              <Link
                to="/register"
                className="
                  px-6
                  py-3.5
                  rounded-xl
                  bg-white
                  text-[#022036]
                  text-xs
                  font-black
                  flex
                  items-center
                  gap-2
                  hover:bg-slate-50
                  transition-all
                "
              >
                Create Account
                <UserPlus size={15} />
              </Link>

            </div>

          </div>

        </div>

      </section>
        

    


      {/*FOOTER */}

      <footer className="
        bg-[#022036]
        text-slate-300
        border-t border-white/10
      ">

        <div className="
          max-w-7xl
          mx-auto
          px-6
          py-16
        ">

          <div className="
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-4
            gap-10
            pb-12
          ">

            {/* BRAND */}

            <div>

              <div className="
                flex
                items-center
                gap-3
              ">

                <div className="
                  w-10 h-10
                  rounded-xl
                  bg-yellow-500
                  text-[#022036]
                  flex
                  items-center
                  justify-center
                ">
                  <Home size={20} />
                </div>

                <div>

                  <strong className="
                    block
                    text-white
                    text-sm
                    font-black
                  ">
                    house rental system
                  </strong>

                  <span className="
                    text-[8px]
                    uppercase
                    tracking-widest
                    text-slate-500
                  ">
                    House Rental System
                  </span>

                </div>

              </div>

              <p className="
                text-xs
                text-slate-400
                leading-6
                mt-5
              ">
                A modern digital house rental ecosystem
                connecting tenants, landlords and
                administrators.
              </p>

            </div>


            {/* NAVIGATION */}

            <div>

              <h4 className="
                text-xs
                uppercase
                tracking-widest
                font-black
                text-yellow-400
                mb-5
              ">
                Navigation
              </h4>

              <div className="
                space-y-3
                text-xs
              ">

                <a
                  href="#about"
                  className="block hover:text-white"
                >
                  About
                </a>

                <a
                  href="#features"
                  className="block hover:text-white"
                >
                  Features
                </a>

                <a
                  href="#services"
                  className="block hover:text-white"
                >
                  Services
                </a>

                <button
                  type="button"
                  onClick={scrollToProperties}
                  className="hover:text-white"
                >
                  Properties
                </button>

              </div>

            </div>


            {/* SECURITY */}

            <div>

              <h4 className="
                text-xs
                uppercase
                tracking-widest
                font-black
                text-yellow-400
                mb-5
              ">
                Security
              </h4>

              <div className="
                space-y-3
                text-xs
                text-slate-400
              ">

                <div className="flex gap-2">
                  <Check size={14} />
                  JWT Authentication
                </div>

                <div className="flex gap-2">
                  <Check size={14} />
                  Fayda Verification
                </div>

                <div className="flex gap-2">
                  <Check size={14} />
                  Chapa Payments
                </div>

                <div className="flex gap-2">
                  <Check size={14} />
                  PostgreSQL Database
                </div>

              </div>

            </div>


            {/* CONTACT */}

            <div>

              <h4 className="
                text-xs
                uppercase
                tracking-widest
                font-black
                text-yellow-400
                mb-5
              ">
                Contact
              </h4>

              <div className="
                space-y-4
                text-xs
                text-slate-400
              ">

                <div className="flex items-center gap-2">
                  <Mail size={14} />
                  abyueshetie346@gmail.com
                </div>

                <div className="flex items-center gap-2">
                  <Phone size={14} />
                  +251 79 45 0000
                </div>

                <div className="flex items-center gap-2">
                  <MapPin size={14} />
                  Addis Ababa, Ethiopia
                </div>

              </div>

            </div>

          </div>


          <div className="
            border-t border-white/10
            pt-7
            flex
            flex-col
            sm:flex-row
            items-center
            justify-between
            gap-3
            text-[10px]
            text-slate-500
          ">

            <span>
              © 2026 Yidu Housing. All rights reserved.
            </span>

            <span>
              Built with React • Node.js • Prisma • PostgreSQL
            </span>

          </div>

        </div>

      </footer>

    </div>
  );
}


/* =========================================================
   PROPERTY CARD
========================================================= */

function PropertyCard({
  property,
  getTitle,
  getPrice,
  getRooms,
  getLocation,
  getImage,
  formatPrice,
  isFurnished,
  isVerified,
  navigate,
}) {
  const title = getTitle(property);

  const price = getPrice(property);

  const rooms = getRooms(property);

  const location = getLocation(property);

  const image = getImage(property);

  const verified = isVerified(property);

  return (
    <article className="
      group
      bg-white
      rounded-2xl
      overflow-hidden
      border border-slate-200
      shadow-sm
      hover:shadow-xl
      hover:-translate-y-1
      transition-all
      duration-300
    ">

      {/* IMAGE */}

      <div className="
        relative
        h-56
        bg-slate-100
        overflow-hidden
      ">

        {image ? (
          <img
            src={image}
            alt={title}
            className="
              w-full
              h-full
              object-cover
              group-hover:scale-105
              transition-transform
              duration-500
            "
            onError={(event) => {
              event.currentTarget.style.display =
                "none";
            }}
          />
        ) : (
          <div className="
            w-full
            h-full
            flex
            items-center
            justify-center
            bg-slate-100
          ">

            <Home
              size={42}
              className="text-slate-300"
            />

          </div>
        )}


        {/* GRADIENT */}

        <div className="
          absolute
          inset-x-0
          bottom-0
          h-24
          bg-gradient-to-t
          from-black/60
          to-transparent
        " />


        {/* VERIFIED */}

        {verified && (
          <div className="
            absolute
            top-3
            left-3
            px-2.5
            py-1.5
            rounded-lg
            bg-emerald-500
            text-white
            text-[9px]
            font-black
            flex
            items-center
            gap-1
          ">

            <ShieldCheck size={12} />

            VERIFIED

          </div>
        )}


        {/* 3D */}

        <div className="
          absolute
          top-3
          right-3
          px-2.5
          py-1.5
          rounded-lg
          bg-black/40
          backdrop-blur-md
          border border-white/20
          text-white
          text-[9px]
          font-bold
          flex
          items-center
          gap-1
        ">

          <Layers size={11} />

          3D

        </div>


        {/* PRICE */}

        <div className="
          absolute
          bottom-4
          left-4
          text-white
        ">

          <span className="
            text-[9px]
            text-white/70
            uppercase
            tracking-widest
          ">
            Monthly Rent
          </span>

          <strong className="
            block
            text-xl
            font-black
          ">
            {formatPrice(price)} ETB
          </strong>

        </div>

      </div>


      {/* BODY */}

      <div className="p-5">

        <h3 className="
          text-base
          font-black
          text-[#022036]
          line-clamp-1
        ">
          {title}
        </h3>


        <div className="
          flex
          items-center
          gap-1.5
          mt-2
          text-xs
          text-slate-500
        ">

          <MapPin
            size={13}
            className="text-yellow-600"
          />

          <span className="line-clamp-1">
            {location}
          </span>

        </div>


        <div className="
          flex
          items-center
          gap-4
          mt-4
          pt-4
          border-t border-slate-100
          text-xs
          text-slate-500
        ">

          <span className="
            flex
            items-center
            gap-1.5
          ">
            <BedDouble size={14} />
            {rooms || 0} Rooms
          </span>

          <span className="
            flex
            items-center
            gap-1.5
          ">

            <Sofa size={14} />

            {isFurnished(property)
              ? "Furnished"
              : "Unfurnished"}

          </span>

        </div>


        <button
          type="button"
          onClick={() => {
            if (property?.id) {
              navigate(
                `/properties/${property.id}`
              );
            } else {
              navigate("/explore");
            }
          }}
          className="
            w-full
            mt-5
            py-3
            rounded-xl
            bg-[#022036]
            text-white
            text-xs
            font-black
            flex
            items-center
            justify-center
            gap-2
            hover:bg-[#063653]
            transition-all
          "
        >

          View Property

          <ArrowRight size={14} />

        </button>

      </div>

    </article>
  );
}


/* =========================================================
   FILTER BADGE
========================================================= */

function FilterBadge({ label, onRemove }) {
  return (
    <span className="
      inline-flex
      items-center
      gap-1.5
      px-3
      py-1.5
      rounded-lg
      bg-yellow-50
      border border-yellow-200
      text-yellow-800
      text-[10px]
      font-bold
    ">

      {label}

      <button
        type="button"
        onClick={onRemove}
        className="
          hover:text-red-600
          transition-colors
        "
      >
        <X size={12} />
      </button>

    </span>
  );
}


/* =========================================================
   METRIC
========================================================= */

function Metric({ title, value }) {
  return (
    <div className="
      p-4
      rounded-2xl
      bg-slate-50
      border border-slate-200
      text-center
    ">

      <span className="
        block
        text-[9px]
        uppercase
        tracking-widest
        font-black
        text-slate-400
      ">
        {title}
      </span>

      <strong className="
        block
        text-sm
        font-black
        text-[#022036]
        mt-1
      ">
        {value}
      </strong>

    </div>
  );
}


/* =========================================================
   HEALTH BAR
========================================================= */

function HealthBar({
  label,
  value,
  width,
}) {
  return (
    <div>

      <div className="
        flex
        items-center
        justify-between
        text-xs
        font-bold
        mb-2
      ">

        <span className="text-slate-300">
          {label}
        </span>

        <span className="text-yellow-400">
          {value}
        </span>

      </div>

      <div className="
        h-2
        rounded-full
        bg-white/10
        overflow-hidden
      ">

        <div
          className="
            h-full
            rounded-full
            bg-yellow-400
          "
          style={{
            width,
          }}
        />

      </div>

    </div>
  );
}


/* =========================================================
   ROLE CONTENT
========================================================= */

function RoleContent({
  icon: Icon,
  title,
  subtitle,
  button,
  items,
  color,
}) {
  const colorClasses = {
    sky: "bg-sky-50 text-sky-600 border-sky-200",
    yellow:
      "bg-yellow-50 text-yellow-600 border-yellow-200",
    emerald:
      "bg-emerald-50 text-emerald-600 border-emerald-200",
  };

  return (
    <div>

      <div className="
        flex
        flex-col
        md:flex-row
        md:items-center
        md:justify-between
        gap-5
        pb-7
        border-b border-slate-100
      ">

        <div className="
          flex
          items-center
          gap-4
        ">

          <div className={`
            w-14
            h-14
            rounded-2xl
            border
            flex
            items-center
            justify-center
            ${colorClasses[color]}
          `}>

            <Icon size={27} />

          </div>

          <div>

            <h3 className="
              text-2xl
              font-black
              text-[#022036]
            ">
              {title}
            </h3>

            <p className="
              text-xs
              text-slate-500
              mt-1
            ">
              {subtitle}
            </p>

          </div>

        </div>

        <Link
          to="/register"
          className="
            px-5
            py-2.5
            rounded-xl
            bg-[#022036]
            text-white
            text-xs
            font-black
            text-center
            hover:bg-[#063653]
            transition-all
          "
        >
          {button}
        </Link>

      </div>


      <div className="
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-3
        gap-4
        mt-8
      ">

        {items.map((item) => (

          <div
            key={item}
            className="
              p-5
              rounded-2xl
              bg-slate-50
              border border-slate-200
            "
          >

            <CheckCircle2
              size={18}
              className="text-emerald-500 mb-3"
            />

            <h4 className="
              text-sm
              font-black
              text-[#022036]
            ">
              {item}
            </h4>

          </div>

        ))}

      </div>

    </div>
  );
}


/* =========================================================
   ACTIVITY ICON
========================================================= */

function ActivityIcon() {
  return (
    <div className="
      w-9
      h-9
      rounded-xl
      bg-yellow-500
      text-[#022036]
      flex
      items-center
      justify-center
    ">
      <TrendingUp size={17} />
    </div>
  );
}