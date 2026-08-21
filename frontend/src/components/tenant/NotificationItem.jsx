import React from 'react';
import useNotifications from '../../hooks/useNotifications';
import NotificationItem from '../../components/tenant/NotificationItem';

export default function Notifications() {
  const {
    notifications,
    loading,
    error,
    markAsRead,
  } = useNotifications();

  if (loading) {
    return (
      <div className="p-6">
        Loading notifications...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Notifications
        </h1>

        <p className="text-gray-500">
          Your latest system notifications
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center">
          <h2 className="text-lg font-semibold">
            No notifications
          </h2>

          <p className="mt-2 text-gray-500">
            You don't have any notifications yet.
          </p>
        </div>
      ) : (
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