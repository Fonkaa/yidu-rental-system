import React from 'react';
import { Bell } from 'lucide-react';
import useNotifications from '../../hooks/useNotifications';
import NotificationItem from '../../components/tenant/NotificationItem';

export default function Notifications() {
  const {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
  } = useNotifications();

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Notifications
        </h1>

        <p className="mt-4 text-gray-500">
          Loading notifications...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Bell className="text-blue-600" size={28} />

            <h1 className="text-3xl font-bold text-gray-800">
              Notifications
            </h1>
          </div>

          <p className="mt-2 text-gray-500">
            Your latest system notifications
          </p>
        </div>

        {unreadCount > 0 && (
          <div className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            {unreadCount} unread
          </div>
        )}
      </div>

      {/* EMPTY */}
      {notifications.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
          <Bell
            size={45}
            className="mx-auto text-gray-300"
          />

          <h2 className="mt-4 text-lg font-semibold text-gray-700">
            No notifications
          </h2>

          <p className="mt-2 text-gray-500">
            You don't have any notifications yet.
          </p>
        </div>
      ) : (
        /* NOTIFICATIONS */
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}