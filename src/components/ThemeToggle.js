'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme, isMounted } = useTheme();

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <div className="p-2 rounded-full bg-secondary w-9 h-9">
        <div className="w-5 h-5 bg-muted-foreground/20 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-5 h-5 overflow-hidden">
        {/* Sun icon with fade animation */}
        <div className={`absolute inset-0 transform transition-all duration-500 ${isDarkMode ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
          <SunIcon className="h-5 w-5 text-yellow-500" />
        </div>
        
        {/* Moon icon with fade animation */}
        <div className={`absolute inset-0 transform transition-all duration-500 ${!isDarkMode ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
          <MoonIcon className="h-5 w-5 text-blue-500" />
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;
