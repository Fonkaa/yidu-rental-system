import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import AuthLayout from '../layouts/AuthLayout';
import TenantLayout from '../layouts/TenantLayout';
import LandlordLayout from '../layouts/LandlordLayout';
import AdminLayout from '../layouts/AdminLayout'; // <--- IMPORTED ADMIN LAYOUT

// Auth
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Dashboards & Portals
import LandlordDashboard from '../pages/LandlordDashboard';
import CreateProperty from '../pages/landlord/PropertyForm';
import AdminDashboard from '../pages/AdminDashboard';

// Tenant & Shared
import Dashboard from '../pages/tenant/Dashboard';
import SearchProperty from '../pages/tenant/SearchProperty';
import PropertyDetails from '../pages/tenant/PropertyDetails';
import Favorites from '../pages/tenant/Favorites';
import RentalRequests from '../pages/tenant/RentalRequests';
import RequestDetails from '../pages/tenant/RequestDetails';
import Messages from '../pages/tenant/Messages';
import Leases from '../pages/tenant/Leases';
import Notifications from '../pages/tenant/Notifications';
import Profile from '../pages/tenant/Profile';
import ChatRoom from "../pages/messages/ChatRoom";
import PublicHome from "../pages/Home";
import Settings from '../pages/Settings';

function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#043658] flex items-center justify-center text-white text-sm">
        Loading session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !allowedRoles.includes(user.role)) {
      if (user?.role === 'LANDLORD') return <Navigate to="/landlord/dashboard" replace />;
      if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
}

export default function AppRoutes() {
  return (
    <Routes>

      {/* AUTH ROUTES */}
      <Route element={<AuthLayout />}>
        <Route path="/" element={<PublicHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* LANDLORD ROUTES WRAPPED WITH PERMANENT CONSTANT LANDLORD LAYOUT */}
      <Route element={<ProtectedRoute allowedRoles={['LANDLORD']} />}>
        <Route element={<LandlordLayout />}>
          <Route path="/landlord" element={<Navigate to="/landlord/dashboard" replace />} />
          <Route path="/landlord/dashboard" element={<LandlordDashboard />} />
          <Route path="/landlord/properties" element={<LandlordDashboard />} />
          <Route path="/landlord/requests" element={<LandlordDashboard />} />
          <Route path="/landlord/history" element={<LandlordDashboard />} />
          <Route path="/landlord/messages" element={<LandlordDashboard />} />
          <Route path="/landlord/properties/:id" element={<PropertyDetails />} />
          <Route path="/landlord/messages/:contactId" element={<ChatRoom />} />
          <Route path="/landlord/settings" element={<LandlordDashboard />} />
        </Route>
        <Route path="/landlord/properties/new" element={<CreateProperty />} />
      </Route>

      {/* ADMIN ROUTES WRAPPED WITH PERMANENT CONSTANT ADMIN LAYOUT */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/pending" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminDashboard />} />
          <Route path="/admin/commission" element={<AdminDashboard />} />
          <Route path="/admin/settings" element={<AdminDashboard />} />
        </Route>
      </Route>

      {/* TENANT ROUTES WRAPPED WITH PERMANENT CONSTANT SIDEBAR & NAVBAR LAYOUT */}
      <Route element={<ProtectedRoute allowedRoles={['TENANT', 'ADMIN']} />}>
        <Route element={<TenantLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/properties" element={<SearchProperty />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/rental-requests" element={<RentalRequests />} />
          <Route path="/rental-requests/:id" element={<RequestDetails />} />
          <Route path="/leases" element={<Leases />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:contactId" element={<ChatRoom />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* UNKNOWN ROUTES */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}