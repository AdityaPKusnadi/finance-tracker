'use client'; 

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

export default function SplashScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 4000); // Slightly longer to enjoy the animation

    return () => clearTimeout(timer);
  }, [router]);
  
  // Generate coins with random properties
  const coins = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 3,
    size: 20 + Math.random() * 20,
    left: Math.random() * 100,
  }));

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 relative overflow-hidden animate-fade-in">
      {/* Falling Coins Animation */}
      <div className="absolute inset-0 pointer-events-none">
        {coins.map((coin) => (
          <div
            key={coin.id}
            className="absolute animate-coin-fall"
            style={{
              left: `${coin.left}%`,
              animationDelay: `${coin.delay}s`,
              animationDuration: `${coin.duration}s`,
              '--coin-size': `${coin.size}px`,
            }}
          >
            <div 
              className="coin bg-gradient-to-br from-yellow-400 to-amber-500 dark:from-yellow-300 dark:to-yellow-600 rounded-full shadow-lg flex items-center justify-center font-bold text-white animate-coin-spin"
              style={{
                width: `${coin.size}px`,
                height: `${coin.size}px`,
                fontSize: `${coin.size * 0.6}px`,
              }}
            >
              ₹
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center">
        {/* Logo Icon */}
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-xl flex items-center justify-center animate-bounce-gentle">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-12 w-12 text-white" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" 
            />
          </svg>
        </div>

        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent animate-fade-in-up">
          Finance Tracker
        </h1>
        <p className="text-lg text-muted-foreground mb-8 animate-fade-in-up-delay">
          Manage your money wisely
        </p>

        {/* Loading Animation */}
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-loading-dot"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-loading-dot" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-loading-dot" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}
