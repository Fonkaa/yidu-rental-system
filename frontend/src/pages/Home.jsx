import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
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
  Lock,
  Cpu,
  BarChart3,
  Clock,
  MessageSquare,
  RefreshCw,
  TrendingUp,
  Percent,
  Activity,
  Layers,
  Award,
  Star,
  Compass,
  Globe,
  Eye,
  Zap,
  Check,
  ChevronRight,
  Play,
  Server,
  Database,
  Smartphone,
  Sliders,
  Filter,
  Search,
  Phone,
  Mail,
  HelpCircle,
  FileText,
  Settings,
  Maximize2,
  Building2,
} from "lucide-react";

export default function PublicHome() {
  const navigate = useNavigate();

  const [activeTabRole, setActiveTabRole] = useState("tenant");
  const [activeMetricTab, setActiveMetricTab] = useState("yield");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const heroRef = useRef(null);

  const [systemStats] = useState({
    totalListings: 142,
    activeTenants: 850,
    verifiedLandlords: 64,
    monthlyVolume: "12.4M ETB",
  });

  /* -------------------------------------------------------
     HERO MOUSE EFFECT
  ------------------------------------------------------- */

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;

      const rect = heroRef.current.getBoundingClientRect();

      const x =
        (e.clientX - rect.left) / rect.width - 0.5;

      const y =
        (e.clientY - rect.top) / rect.height - 0.5;

      setMousePosition({
        x,
        y,
      });
    };

    const hero = heroRef.current;

    if (hero) {
      hero.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (hero) {
        hero.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-slate-800 overflow-x-hidden">

      {/* =====================================================
          HERO
      ====================================================== */}

      <section
        ref={heroRef}
        id="hero-section"
        className="
          relative
          min-h-[760px]
          h-[92vh]
          max-h-[900px]
          overflow-hidden
          text-white
        "
      >

        {/* HERO IMAGE */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/images/house-hero.jpg')",
            transform: `
              scale(1.03)
              translate(
                ${mousePosition.x * -4}px,
                ${mousePosition.y * -4}px
              )
            `,
            transition: "transform 0.25s ease-out",
          }}
        />

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-black/40" />

        {/* LEFT DARK GRADIENT */}
        <div
          className="
            absolute
            inset-0
            bg-gradient-to-r
            from-black/70
            via-black/30
            to-black/10
          "
        />

        {/* BOTTOM GRADIENT */}
        <div
          className="
            absolute
            inset-x-0
            bottom-0
            h-72
            bg-gradient-to-t
            from-black/75
            via-black/25
            to-transparent
          "
        />

        {/* =====================================================
            NAVBAR
        ====================================================== */}

        <nav className="relative z-20 px-5 sm:px-8 lg:px-10 pt-5">

          <div className="flex items-center justify-between">

            {/* LOGO */}

            <div
              onClick={() => navigate("/")}
              className="flex items-center gap-3 cursor-pointer"
            >

              <div
                className="
                  w-11
                  h-11
                  rounded-full
                  bg-white
                  text-[#111]
                  flex
                  items-center
                  justify-center
                  shadow-xl
                "
              >
                <Home size={22} />
              </div>

              <div>

                <div className="text-[15px] font-semibold tracking-tight">
                  Yidu Housing
                </div>

                <div className="text-[8px] tracking-[0.28em] uppercase text-white/70">
                  House Rental System
                </div>

              </div>

            </div>

            {/* DESKTOP MENU */}

            <div
              className="
                hidden
                lg:flex
                items-center
                gap-9
                text-[13px]
                font-medium
                text-white/90
              "
            >

              <a
                href="#about"
                className="hover:text-white transition"
              >
                About
              </a>

              <a
                href="#features"
                className="hover:text-white transition"
              >
                Features
              </a>

              <a
                href="#services"
                className="hover:text-white transition"
              >
                Services
              </a>

              <a
                href="#tech-specs"
                className="hover:text-white transition"
              >
                Technology
              </a>

              <a
                href="#properties"
                className="hover:text-white transition"
              >
                Properties
              </a>

            </div>

            {/* RIGHT BUTTONS */}

            <div className="flex items-center gap-2">

              <Link
                to="/login"
                className="
                  px-5
                  py-2.5
                  rounded-full
                  border
                  border-white/40
                  bg-white/5
                  backdrop-blur-md
                  text-white
                  text-xs
                  font-medium
                  hover:bg-white/15
                  transition
                "
              >
                Login
              </Link>

              <Link
                to="/register"
                className="
                  hidden
                  sm:flex
                  items-center
                  gap-2
                  px-5
                  py-2.5
                  rounded-full
                  bg-white
                  text-[#111]
                  text-xs
                  font-bold
                  hover:bg-white/90
                  transition
                "
              >
                Get Started
                <ArrowRight size={14} />
              </Link>

            </div>

          </div>

        </nav>

        {/* =====================================================
            HERO CONTENT
        ====================================================== */}

        <div
          className="
            relative
            z-10
            max-w-[1500px]
            mx-auto
            h-[calc(100%-90px)]
            px-5
            sm:px-8
            lg:px-10
            flex
            items-center
          "
        >

          <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 items-center">

            {/* LEFT CONTENT */}

            <div className="max-w-[850px]">

              {/* SMALL LABEL */}

              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-4
                  py-2
                  rounded-full
                  border
                  border-white/35
                  bg-black/20
                  backdrop-blur-md
                  text-[10px]
                  sm:text-[11px]
                  tracking-[0.2em]
                  uppercase
                  text-white/90
                  mb-5
                "
              >

                <Sparkles size={13} />

                Smart House Rental Platform

              </div>

              {/* MAIN TITLE */}

              <h1
                className="
                  font-serif
                  italic
                  font-light
                  text-[54px]
                  sm:text-[70px]
                  md:text-[82px]
                  lg:text-[92px]
                  xl:text-[105px]
                  leading-[0.82]
                  tracking-[-0.045em]
                  text-white
                  max-w-[850px]
                "
              >

                Redefining

                <br />

                House Rental

                <br />

                Through 3D

              </h1>

              {/* DESCRIPTION */}

              <p
                className="
                  mt-7
                  max-w-[670px]
                  text-sm
                  sm:text-[15px]
                  leading-7
                  text-white/85
                  font-light
                "
              >
                Explore immersive 3D property models, secure monthly
                rent transactions via Chapa, monitor landlord portfolio
                yields with real-time analytics, and connect instantly
                through our integrated tenant-landlord communication
                pipeline.
              </p>

              {/* BUTTONS */}

              <div className="flex flex-wrap items-center gap-3 mt-7">

                <Link
                  to="/explore"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    px-6
                    py-3.5
                    rounded-full
                    bg-white
                    text-[#111]
                    text-xs
                    font-bold
                    hover:bg-white/90
                    transition
                    shadow-xl
                  "
                >

                  Explore Properties

                  <ArrowRight size={15} />

                </Link>

                <a
                  href="#features"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    px-6
                    py-3.5
                    rounded-full
                    border
                    border-white/40
                    bg-white/5
                    backdrop-blur-md
                    text-white
                    text-xs
                    font-semibold
                    hover:bg-white/15
                    transition
                  "
                >

                  <Play size={14} />

                  Discover Platform

                </a>

              </div>

            </div>

            {/* =================================================
                RIGHT FEATURE PILLS
            ================================================== */}

            <div
              className="
                hidden
                lg:flex
                flex-col
                items-stretch
                gap-2.5
                self-center
              "
            >

              {[
                "Modern Living",
                "Verified Homes",
                "3D Property Tours",
                "Secure Rentals",
              ].map((item) => (

                <div
                  key={item}
                  className="
                    px-6
                    py-3
                    rounded-full
                    border
                    border-white/40
                    bg-black/15
                    backdrop-blur-md
                    text-center
                    text-xs
                    font-semibold
                    text-white
                    hover:bg-white/15
                    transition
                  "
                >
                  {item}
                </div>

              ))}

            </div>

          </div>

        </div>

        {/* =====================================================
            BOTTOM PROPERTY INFORMATION
        ====================================================== */}

        <div
          className="
            absolute
            z-20
            bottom-5
            left-0
            right-0
            px-5
            sm:px-8
            lg:px-10
          "
        >

          <div
            className="
              max-w-[1500px]
              mx-auto
              grid
              grid-cols-1
              sm:grid-cols-3
              gap-6
              border-t
              border-white/30
              pt-5
            "
          >

            {/* RENTAL */}

            <div>

              <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-white/60">
                <Clock size={12} />
                Rental Period
              </div>

              <div className="mt-2 text-sm font-semibold">
                Flexible Monthly
              </div>

            </div>

            {/* LOCATION */}

            <div>

              <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-white/60">
                <MapPin size={12} />
                Location
              </div>

              <div className="mt-2 text-sm font-semibold">
                Addis Ababa, Ethiopia
              </div>

            </div>

            {/* SECURITY */}

            <div>

              <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-white/60">
                <ShieldCheck size={12} />
                Security
              </div>

              <div className="mt-2 text-sm font-semibold">
                Verified & Secure
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          ABOUT SECTION
      ====================================================== */}

      <section
        id="about"
        className="max-w-7xl mx-auto px-6 py-24"
      >

        <div className="text-center mb-14">

          <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-amber-600">
            About Yidu Housing
          </span>

          <h2
            className="
              mt-3
              text-3xl
              sm:text-4xl
              font-bold
              text-[#13232f]
            "
            
          >
            A smarter way to find and manage homes
          </h2>

          <p className="max-w-2xl mx-auto mt-4 text-sm leading-7 text-slate-500">
            Yidu Housing connects tenants, landlords, and administrators
            through one secure digital rental ecosystem.
          </p>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {[
            {
              icon: Eye,
              title: "Explore Visually",
              text: "Discover properties through rich images and immersive property experiences.",
            },
            {
              icon: ShieldCheck,
              title: "Rent Securely",
              text: "Verified users and secure payment workflows help create a safer rental process.",
            },
            {
              icon: BarChart3,
              title: "Manage Smarter",
              text: "Landlords can monitor properties, rental performance and tenant activity.",
            },
          ].map((item, index) => {

            const Icon = item.icon;

            return (
              <div
                key={index}
                className="
                  bg-white
                  border
                  border-slate-200
                  rounded-3xl
                  p-7
                  hover:-translate-y-1
                  transition
                  shadow-sm
                "
              >

                <div
                  className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-amber-50
                    text-amber-600
                    flex
                    items-center
                    justify-center
                    mb-5
                  "
                >
                  <Icon size={23} />
                </div>

                <h3 className="font-bold text-lg text-[#13232f]">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {item.text}
                </p>

              </div>
            );
          })}

        </div>

      </section>


      {/* =====================================================
          FEATURES
      ====================================================== */}

      <section
        id="features"
        className="bg-[#f0f0ed] py-24"
      >

        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-14">

            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-amber-600">
              Platform Features
            </span>

            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-[#13232f]">
              Everything you need for modern renting
            </h2>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

            {[
              {
                icon: Layers,
                title: "3D Property Experience",
                text: "Explore property spaces before making a rental decision.",
              },
              {
                icon: Lock,
                title: "Secure Rentals",
                text: "Secure rental transactions with trusted payment workflows.",
              },
              {
                icon: MessageSquare,
                title: "Instant Communication",
                text: "Tenants and landlords can communicate directly.",
              },
              {
                icon: TrendingUp,
                title: "Portfolio Analytics",
                text: "Track rental income and portfolio performance.",
              },
            ].map((feature, index) => {

              const Icon = feature.icon;

              return (
                <div
                  key={index}
                  className="
                    bg-white
                    rounded-3xl
                    p-7
                    border
                    border-slate-200
                    hover:shadow-lg
                    transition
                  "
                >

                  <Icon
                    size={25}
                    className="text-amber-600 mb-5"
                  />

                  <h3 className="font-bold text-[#13232f]">
                    {feature.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-6 mt-2">
                    {feature.text}
                  </p>

                </div>
              );
            })}

          </div>

        </div>

      </section>


      {/* =====================================================
          ANALYTICS
      ====================================================== */}

      <section
        id="services"
        className="max-w-7xl mx-auto px-6 py-24"
      >

        <div className="text-center mb-12">

          <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-amber-600">
            Market Intelligence
          </span>

          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-[#13232f]">
            Platform Analytics
          </h2>

          <p className="max-w-xl mx-auto mt-3 text-sm text-slate-500">
            Understand rental demand, yields and platform activity.
          </p>

        </div>


        <div className="flex justify-center gap-2 flex-wrap mb-8">

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
              key={tab.id}
              onClick={() =>
                setActiveMetricTab(tab.id)
              }
              className={`
                px-5
                py-2.5
                rounded-full
                text-xs
                font-semibold
                transition
                ${
                  activeMetricTab === tab.id
                    ? "bg-[#13232f] text-white"
                    : "bg-white border border-slate-200 text-slate-600"
                }
              `}
            >
              {tab.label}
            </button>

          ))}

        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div
            className="
              lg:col-span-2
              bg-white
              border
              border-slate-200
              rounded-3xl
              p-7
              shadow-sm
            "
          >

            <div className="flex items-center justify-between">

              <div>

                <h3 className="font-bold text-[#13232f]">
                  {activeMetricTab === "yield"
                    ? "Rental Yield by District"
                    : activeMetricTab === "demand"
                    ? "Tenant Demand by District"
                    : "Portfolio Occupancy"}
                </h3>

                <p className="text-xs text-slate-400 mt-1">
                  Platform overview
                </p>

              </div>

              <span
                className="
                  px-3
                  py-1
                  rounded-full
                  bg-emerald-50
                  text-emerald-600
                  text-[10px]
                  font-bold
                "
              >
                LIVE
              </span>

            </div>


            <div className="space-y-5 mt-8">

              {[
                ["Bole", "88%", "14.2%"],
                ["Kazanchis", "76%", "11.8%"],
                ["CMC / Ayat", "64%", "9.5%"],
                ["Piassa", "81%", "12.6%"],
                ["Summit", "70%", "10.2%"],
              ].map(([name, width, value]) => (

                <div key={name}>

                  <div className="flex justify-between text-xs mb-2">

                    <span className="font-semibold text-slate-700">
                      {name}
                    </span>

                    <span className="font-bold text-amber-600">
                      {value}
                    </span>

                  </div>

                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{
                        width,
                      }}
                    />

                  </div>

                </div>

              ))}

            </div>

          </div>


          {/* SIDE CARD */}

          <div
            className="
              bg-[#13232f]
              rounded-3xl
              p-7
              text-white
            "
          >

            <BarChart3
              size={25}
              className="text-amber-400"
            />

            <h3 className="mt-5 text-xl font-bold">
              Ecosystem Health
            </h3>

            <p className="mt-3 text-sm leading-6 text-white/60">
              Monitor platform reliability, landlord activity,
              tenant verification and payment performance.
            </p>


            <div className="space-y-5 mt-8">

              {[
                ["Verified Landlords", "99.1%"],
                ["Payment Success", "100%"],
                ["Lease Compliance", "92.4%"],
              ].map(([label, value]) => (

                <div key={label}>

                  <div className="flex justify-between text-xs mb-2">

                    <span className="text-white/70">
                      {label}
                    </span>

                    <span className="font-bold">
                      {value}
                    </span>

                  </div>

                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{
                        width: value,
                      }}
                    />

                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          ROLES
      ====================================================== */}

      <section
        id="properties"
        className="bg-[#f0f0ed] py-24"
      >

        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-12">

            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-amber-600">
              User Experience
            </span>

            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-[#13232f]">
              Built for everyone
            </h2>

          </div>


          <div className="flex justify-center gap-2 flex-wrap mb-10">

            {[
              ["tenant", "Tenant"],
              ["landlord", "Landlord"],
              ["admin", "Administrator"],
            ].map(([id, label]) => (

              <button
                key={id}
                onClick={() =>
                  setActiveTabRole(id)
                }
                className={`
                  px-6
                  py-3
                  rounded-full
                  text-xs
                  font-bold
                  transition
                  ${
                    activeTabRole === id
                      ? "bg-[#13232f] text-white"
                      : "bg-white text-slate-600 border border-slate-200"
                  }
                `}
              >
                {label}
              </button>

            ))}

          </div>


          <div
            className="
              bg-white
              rounded-3xl
              border
              border-slate-200
              p-8
              md:p-10
              max-w-5xl
              mx-auto
            "
          >

            {activeTabRole === "tenant" && (

              <RoleContent
                icon={Users}
                title="Tenant Portal"
                description="Find your next home with a simple, transparent rental experience."
                color="sky"
                items={[
                  "Advanced property search",
                  "Property images and details",
                  "Rental request tracking",
                  "Direct landlord messaging",
                  "Fayda ID profile verification",
                  "Secure rental payments",
                ]}
              />

            )}


            {activeTabRole === "landlord" && (

              <RoleContent
                icon={Building2}
                title="Landlord Hub"
                description="Manage properties, tenants and rental performance from one dashboard."
                color="amber"
                items={[
                  "Property listing management",
                  "Multiple property images",
                  "Tenant inquiry management",
                  "Rental income tracking",
                  "Portfolio analytics",
                  "Listing renewal management",
                ]}
              />

            )}


            {activeTabRole === "admin" && (

              <RoleContent
                icon={ShieldCheck}
                title="Admin Command Center"
                description="Maintain platform quality, security and user governance."
                color="emerald"
                items={[
                  "Property approval and rejection",
                  "User management",
                  "Role management",
                  "Platform monitoring",
                  "Notification management",
                  "Database oversight",
                ]}
              />

            )}

          </div>

        </div>

      </section>


      {/* =====================================================
          TECHNOLOGY
      ====================================================== */}

      <section
        id="tech-specs"
        className="max-w-7xl mx-auto px-6 py-24"
      >

        <div className="text-center mb-14">

          <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-amber-600">
            Technology
          </span>

          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-[#13232f]">
            Modern technology stack
          </h2>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

          {[
            {
              icon: Smartphone,
              title: "Frontend",
              text: "React, Vite, Tailwind CSS and modern responsive interfaces.",
            },
            {
              icon: Server,
              title: "Backend",
              text: "Node.js, Express REST APIs and JWT authentication.",
            },
            {
              icon: Database,
              title: "Database",
              text: "Prisma ORM with PostgreSQL for reliable data management.",
            },
            {
              icon: ShieldCheck,
              title: "Payments",
              text: "Chapa integration for secure Ethiopian rental payments.",
            },
          ].map((item, index) => {

            const Icon = item.icon;

            return (
              <div
                key={index}
                className="
                  border
                  border-slate-200
                  bg-white
                  rounded-3xl
                  p-7
                  shadow-sm
                "
              >

                <div
                  className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-[#f5f1e8]
                    flex
                    items-center
                    justify-center
                    text-amber-600
                  "
                >
                  <Icon size={23} />
                </div>

                <h3 className="mt-5 font-bold text-[#13232f]">
                  {item.title}
                </h3>

                <p className="mt-2 text-xs leading-6 text-slate-500">
                  {item.text}
                </p>

              </div>
            );
          })}

        </div>

      </section>


      {/* =====================================================
          STATS
      ====================================================== */}

      <section className="max-w-7xl mx-auto px-6 pb-24">

        <div
          className="
            bg-[#13232f]
            rounded-[2rem]
            p-8
            md:p-10
            grid
            grid-cols-2
            lg:grid-cols-4
            gap-6
            text-white
          "
        >

          {[
            [
              "Listings",
              systemStats.totalListings,
            ],
            [
              "Active Tenants",
              systemStats.activeTenants,
            ],
            [
              "Landlords",
              systemStats.verifiedLandlords,
            ],
            [
              "Monthly Volume",
              systemStats.monthlyVolume,
            ],
          ].map(([label, value]) => (

            <div
              key={label}
              className="text-center"
            >

              <div className="text-2xl md:text-3xl font-bold">
                {value}
              </div>

              <div className="text-[10px] uppercase tracking-[0.18em] text-white/50 mt-2">
                {label}
              </div>

            </div>

          ))}

        </div>

      </section>


      {/* =====================================================
          CTA
      ====================================================== */}

      <section className="px-6 pb-24">

        <div
          className="
            max-w-6xl
            mx-auto
            rounded-[2rem]
            overflow-hidden
            relative
            min-h-[380px]
            flex
            items-center
          "
        >

          <div
            className="
              absolute
              inset-0
              bg-cover
              bg-center
            "
            style={{
              backgroundImage:
                "url('/images/house-hero.jpg')",
            }}
          />

          <div className="absolute inset-0 bg-black/60" />

          <div className="relative z-10 p-8 md:p-14 max-w-2xl">

            <span className="text-[10px] uppercase tracking-[0.25em] text-amber-300 font-bold">
              Find Your Next Home
            </span>

            <h2
              className="
                mt-4
                text-4xl
                md:text-5xl
                font-serif
                italic
                text-white
              "
            >
              Your next home
              <br />
              starts here.
            </h2>

            <p className="mt-5 text-sm leading-6 text-white/70">
              Discover verified homes, connect with landlords,
              and manage your rental journey from one platform.
            </p>

            <Link
              to="/explore"
              className="
                inline-flex
                items-center
                gap-2
                mt-7
                px-6
                py-3
                rounded-full
                bg-white
                text-[#13232f]
                text-xs
                font-bold
              "
            >
              Explore Properties
              <ArrowRight size={15} />
            </Link>

          </div>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="bg-[#13232f] text-white">

        <div className="max-w-7xl mx-auto px-6 py-16">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

            {/* BRAND */}

            <div>

              <div className="flex items-center gap-3">

                <div
                  className="
                    w-10
                    h-10
                    rounded-full
                    bg-white
                    text-[#13232f]
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Home size={19} />
                </div>

                <div>

                  <div className="font-bold">
                    Yidu Housing
                  </div>

                  <div className="text-[8px] tracking-[0.2em] uppercase text-white/40">
                    House Rental System
                  </div>

                </div>

              </div>

              <p className="text-xs text-white/50 leading-6 mt-5">
                A modern digital house rental ecosystem connecting
                tenants, landlords and administrators.
              </p>

            </div>


            {/* NAVIGATION */}

            <div>

              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Navigation
              </h4>

              <div className="space-y-3 mt-5 text-xs text-white/55">

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

                <Link
                  to="/explore"
                  className="block hover:text-white"
                >
                  Properties
                </Link>

              </div>

            </div>


            {/* SECURITY */}

            <div>

              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Security
              </h4>

              <div className="space-y-3 mt-5 text-xs text-white/55">

                <div>JWT Authentication</div>
                <div>Fayda ID Verification</div>
                <div>Secure Chapa Payments</div>
                <div>PostgreSQL Database</div>

              </div>

            </div>


            {/* CONTACT */}

            <div>

              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Contact
              </h4>

              <div className="space-y-4 mt-5 text-xs text-white/55">

                <div className="flex gap-2 items-center">
                  <Mail size={14} />
                  support@yiduhousing.et
                </div>

                <div className="flex gap-2 items-center">
                  <MapPin size={14} />
                  Addis Ababa, Ethiopia
                </div>

              </div>

            </div>

          </div>


          <div
            className="
              border-t
              border-white/10
              mt-12
              pt-7
              flex
              flex-col
              sm:flex-row
              justify-between
              gap-3
              text-[10px]
              text-white/35
            "
          >

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
   ROLE CONTENT COMPONENT
========================================================= */

function RoleContent({
  icon: Icon,
  title,
  description,
  items,
  color,
}) {
  const iconClasses = {
    sky: "bg-sky-50 text-sky-600 border-sky-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    emerald:
      "bg-emerald-50 text-emerald-600 border-emerald-100",
  };

  const checkClasses = {
    sky: "text-sky-600",
    amber: "text-amber-600",
    emerald: "text-emerald-600",
  };

  return (
    <div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-7 border-b border-slate-100">

        <div
          className={`
            w-14
            h-14
            rounded-2xl
            border
            flex
            items-center
            justify-center
            ${iconClasses[color]}
          `}
        >
          <Icon size={27} />
        </div>

        <div>

          <h3 className="text-2xl font-bold text-[#13232f]">
            {title}
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            {description}
          </p>

        </div>

      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-7">

        {items.map((item) => (

          <div
            key={item}
            className="
              flex
              items-center
              gap-3
              p-4
              rounded-2xl
              bg-slate-50
              border
              border-slate-100
            "
          >

            <CheckCircle2
              size={17}
              className={checkClasses[color]}
            />

            <span className="text-xs font-medium text-slate-700">
              {item}
            </span>

          </div>

        ))}

      </div>

    </div>
  );
}