import { useState, useEffect } from 'react';

let notificationCallback = null;

export const showNotification = (message, type = 'info') => {
  if (notificationCallback) {
    notificationCallback({ message, type });
  }
};

export const Notification = () => {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    notificationCallback = (notif) => {
      setNotification(notif);
      setTimeout(() => setNotification(null), 4000);
    };

    return () => {
      notificationCallback = null;
    };
  }, []);

  if (!notification) return null;

  const bgColors = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        padding: '16px 24px',
        backgroundColor: bgColors[notification.type] || bgColors.info,
        color: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        maxWidth: '400px',
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      {notification.message}
    </div>
  );
};
