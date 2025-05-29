'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../app/firebase';

const NotificationManager = ({ userId, userEmail }) => {
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && isMounted) {
      initializeNotifications();
      registerServiceWorker();
    }
  }, [isMounted]);

  useEffect(() => {
    if (userId) {
      setupDailyNotificationCheck();
    }
  }, [userId]);

  const initializeNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        setServiceWorkerRegistration(registration);
        console.log('Service Worker registered successfully');
        
        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
        
        // Schedule notification checks
        if (registration.active) {
          registration.active.postMessage({
            type: 'SCHEDULE_NOTIFICATION'
          });
        }
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  };

  const handleServiceWorkerMessage = async (event) => {
    if (event.data.type === 'CHECK_DAILY_TRANSACTIONS') {
      await checkTodayTransactions();
    }
  };
  const setupDailyNotificationCheck = () => {
    // Set up a more precise timer for 8 PM check
    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(20, 0, 0, 0); // 8 PM

    // If it's already past 8 PM today, schedule for tomorrow
    if (now > targetTime) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    const timeUntilTarget = targetTime.getTime() - now.getTime();

    // Schedule the first check
    const firstTimeout = setTimeout(() => {
      checkTodayTransactions();
      
      // Then set up daily interval
      const dailyInterval = setInterval(() => {
        checkTodayTransactions();
      }, 24 * 60 * 60 * 1000); // Every 24 hours

      // Cleanup interval on unmount
      return () => clearInterval(dailyInterval);
    }, timeUntilTarget);

    // Cleanup timeout on unmount
    return () => clearTimeout(firstTimeout);
  };

  const checkTodayTransactions = async () => {
    if (!userId) return;

    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const transactionsQuery = query(
        collection(db, 'users', userId, 'transactions'),
        where('date', '>=', startOfDay),
        where('date', '<=', endOfDay),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(transactionsQuery);
      const todayTransactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // If no transactions today, send notification
      if (todayTransactions.length === 0) {
        await sendDailyReminder();
      }
    } catch (error) {
      console.error('Error checking today transactions:', error);
    }
  };

  const sendDailyReminder = async () => {
    // Browser notification
    if (notificationPermission === 'granted') {
      showBrowserNotification();
    }

    // Email notification (if user has email)
    if (userEmail) {
      await sendEmailNotification(userEmail);
    }
  };

  const showBrowserNotification = () => {
    if ('Notification' in window && notificationPermission === 'granted') {
      new Notification('Finance Tracker Reminder', {
        body: 'You haven\'t added any transactions today. Don\'t forget to track your expenses!',
        icon: '/logo.png',
        badge: '/logo.png',
        vibrate: [100, 50, 100],
        tag: 'daily-reminder',
        renotify: true,
        actions: [
          {
            action: 'add-transaction',
            title: 'Add Transaction'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ]
      });
    }
  };

  const sendEmailNotification = async (email) => {
    try {
      // You can use EmailJS or Firebase Functions for this
      // For now, we'll use a simple fetch to a serverless function
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          subject: 'Finance Tracker Daily Reminder',
          message: 'You haven\'t added any transactions today. Don\'t forget to track your expenses!'
        })
      });

      if (response.ok) {
        console.log('Email notification sent successfully');
      }
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        // Test notification
        new Notification('Finance Tracker', {
          body: 'Notifications enabled! You\'ll receive daily reminders at 8 PM.',
          icon: '/logo.png'
        });
      }
    }
  };
  const testNotification = () => {
    if (notificationPermission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from Finance Tracker!',
        icon: '/logo.png'
      });
    }
  };

  // Don't render on server side to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="space-y-4">
        <div className="bg-card p-4 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-3">Daily Notifications</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Loading notification settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card p-4 rounded-lg border border-border">
        <h3 className="text-lg font-semibold mb-3">Daily Notifications</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Get reminded at 8 PM if you haven't added any transactions today.
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Browser Notifications</span>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                notificationPermission === 'granted' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : notificationPermission === 'denied'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
              }`}>
                {notificationPermission === 'granted' ? 'Enabled' : 
                 notificationPermission === 'denied' ? 'Denied' : 'Not Set'}
              </span>
              {notificationPermission !== 'granted' && (
                <button
                  onClick={requestNotificationPermission}
                  className="text-xs px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Enable
                </button>
              )}
            </div>
          </div>

          {notificationPermission === 'granted' && (
            <div className="flex gap-2">
              <button
                onClick={testNotification}
                className="text-xs px-3 py-1 bg-secondary text-foreground rounded-md hover:bg-secondary/80"
              >
                Test Notification
              </button>
              <button
                onClick={checkTodayTransactions}
                className="text-xs px-3 py-1 bg-secondary text-foreground rounded-md hover:bg-secondary/80"
              >
                Check Today's Transactions
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationManager;
