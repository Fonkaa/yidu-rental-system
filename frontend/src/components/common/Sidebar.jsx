import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: "⌂",
    },
    {
      label: "Find Properties",
      path: "/properties",
      icon: "⌕",
    },
    {
      label: "Favorites",
      path: "/favorites",
      icon: "♥",
    },
    {
      label: "Rental Requests",
      path: "/rental-requests",
      icon: "↗",
    },
    {
      label: "Messages",
      path: "/messages",
      icon: "✉",
    },
    {
      label: "My Lease",
      path: "/lease",
      icon: "▣",
    },
    {
      label: "Notifications",
      path: "/notifications",
      icon: "♢",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside
        className={`dashboard-sidebar ${
          isOpen ? "sidebar-open" : ""
        }`}
      >

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            H
          </div>

          <div>
            <strong>HouseRental</strong>
            <span>Tenant Portal</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-navigation">

          <div className="sidebar-menu-title">
            MAIN MENU
          </div>

          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              <span className="sidebar-link-icon">
                {item.icon}
              </span>

              <span className="sidebar-link-text">
                {item.label}
              </span>

              {item.label === "Notifications" && (
                <span className="notification-badge">
                  3
                </span>
              )}
            </NavLink>
          ))}

          <div className="sidebar-menu-title sidebar-account-title">
            ACCOUNT
          </div>

          <NavLink
            to="/profile"
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="sidebar-link-icon">
              ◉
            </span>

            <span className="sidebar-link-text">
              Profile
            </span>
          </NavLink>

        </nav>

        {/* Bottom */}
        <div className="sidebar-bottom">

          <div className="sidebar-help-card">
            <div className="help-icon">?</div>

            <div>
              <strong>Need help?</strong>

              <span>
                Contact our support team.
              </span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <span className="logout-icon">↪</span>

            <span>Sign out</span>
          </button>

          <div className="sidebar-version">
            HouseRental v1.0
          </div>

        </div>

      </aside>
    </>
  );
}