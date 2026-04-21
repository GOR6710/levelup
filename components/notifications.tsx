'use client';

import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // 自动移除
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 3000);
    }

    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // 请求推送通知权限
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.log('浏览器不支持推送通知');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  // 发送推送通知
  const sendPushNotification = (title: string, options?: NotificationOptions) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        ...options
      });
    }
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    requestPermission,
    sendPushNotification
  };
}

// 通知组件
export function NotificationContainer({ notifications, onRemove }: {
  notifications: Notification[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg max-w-sm animate-slide-in-up ${
            notification.type === 'success' ? 'bg-green-500/20 border border-green-500 text-green-400' :
            notification.type === 'error' ? 'bg-red-500/20 border border-red-500 text-red-400' :
            notification.type === 'warning' ? 'bg-yellow-500/20 border border-yellow-500 text-yellow-400' :
            'bg-blue-500/20 border border-blue-500 text-blue-400'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold">{notification.title}</h4>
              <p className="text-sm mt-1">{notification.message}</p>
            </div>
            <button
              onClick={() => onRemove(notification.id)}
              className="text-current opacity-50 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
