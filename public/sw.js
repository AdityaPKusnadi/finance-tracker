// Service Worker for push notifications and scheduled tasks
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/logo.png',
      badge: '/logo.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2'
      },
      actions: [
        {
          action: 'explore',
          title: 'Check Transactions',
          icon: '/logo.png'
        },
        {
          action: 'close',
          title: 'Dismiss',
          icon: '/logo.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

// Scheduled notification check (runs every hour)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    scheduleNotificationCheck();
  }
});

function scheduleNotificationCheck() {
  // Set up a timer to check at 8 PM daily
  const now = new Date();
  const targetTime = new Date();
  targetTime.setHours(20, 0, 0, 0); // 8 PM

  // If it's already past 8 PM today, schedule for tomorrow
  if (now > targetTime) {
    targetTime.setDate(targetTime.getDate() + 1);
  }

  const timeUntilTarget = targetTime.getTime() - now.getTime();

  // Schedule the check
  setTimeout(() => {
    checkDailyTransactions();
    // Schedule the next day's check
    setInterval(checkDailyTransactions, 24 * 60 * 60 * 1000); // Every 24 hours
  }, timeUntilTarget);
}

async function checkDailyTransactions() {
  try {
    // Send message to main thread to check transactions
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'CHECK_DAILY_TRANSACTIONS',
        timestamp: Date.now()
      });
    });
  } catch (error) {
    console.error('Error checking daily transactions:', error);
  }
}
