import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import TenantLayout from '../layouts/TenantLayout';
import AuthLayout from '../layouts/AuthLayout';

// Auth
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Tenant
import Dashboard from '../pages/tenant/Dashboard';
import SearchProperty from '../pages/tenant/SearchProperty';
import PropertyDetails from '../pages/tenant/PropertyDetails';
import Favorites from '../pages/tenant/Favorites';
import RentalRequests from '../pages/tenant/RentalRequests';
import RequestDetails from '../pages/tenant/RequestDetails';
import Messages from '../pages/tenant/Messages';
import Conversation from '../pages/tenant/Conversation';
import Leases from '../pages/tenant/Leases';
import Notifications from '../pages/tenant/Notifications';
import Profile from '../pages/tenant/Profile';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>

      {/* =========================
          AUTH ROUTES
      ========================= */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />
        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />
      </Route>

      {/* =========================
          TENANT ROUTES
      ========================= */}
      <Route
        element={
          <ProtectedRoute>
            <TenantLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* Tenant Search Properties */}
        <Route
          path="/properties"
          element={<SearchProperty />}
        />

        {/* Property Details */}
        <Route
          path="/properties/:id"
          element={<PropertyDetails />}
        />

        {/* Favorites */}
        <Route
          path="/favorites"
          element={<Favorites />}
        />

        {/* Rental Requests */}
        <Route
          path="/rental-requests"
          element={<RentalRequests />}
        />

        <Route
          path="/rental-requests/:id"
          element={<RequestDetails />}
        />

        {/* Messages */}
        <Route
          path="/messages"
          element={<Messages />}
        />

        <Route
          path="/messages/:id"
          element={<Conversation />}
        />

        {/* Leases */}
        <Route
          path="/leases"
          element={<Leases />}
        />

        {/* Notifications */}
        <Route
          path="/notifications"
          element={<Notifications />}
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={<Profile />}
        />
      </Route>

      {/* =========================
          UNKNOWN ROUTES
      ========================= */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />

    </Routes>
  );
}