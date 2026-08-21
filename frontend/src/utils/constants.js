export const APP_NAME = 'House Rental System';

export const TENANT_ROLES = {
  TENANT: 'TENANT',
  OWNER: 'OWNER',
  ADMIN: 'ADMIN'
};

export const API_ROUTES = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password'
  },
  properties: '/properties',
  favorites: '/favorites',
  messages: '/messages',
  rentalRequests: '/rental-requests',
  leases: '/leases',
  notifications: '/notifications'
};
