'use client';

import { createContext, useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getUserSettings, updateUserSettings } from '@/app/firebase';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  // Client-side hydration check
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    if (!isMounted) return;
    
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        loadUserTheme(user.uid);
      } else {
        setUserId(null);
        loadLocalTheme();
      }
    });

    return () => unsubscribe();
  }, [isMounted]);

  // Load theme from Firebase for authenticated users
  const loadUserTheme = async (uid) => {
    try {
      const settings = await getUserSettings(uid);
      setIsDarkMode(settings.theme === 'dark');
      applyTheme(settings.theme === 'dark');
    } catch (error) {
      console.error('Failed to load user theme:', error);
      loadLocalTheme();
    } finally {
      setIsLoading(false);
    }
  };
  // Load theme from localStorage for non-authenticated users
  const loadLocalTheme = () => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedTheme = localStorage.getItem('theme');
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      const isDark = savedTheme ? savedTheme === 'dark' : prefersDarkMode;
      setIsDarkMode(isDark);
      applyTheme(isDark);
    } catch (error) {
      console.error('Failed to load local theme:', error);
      setIsDarkMode(false);
      applyTheme(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply theme to DOM
  const applyTheme = (isDark) => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      if (isDark) {
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        root.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  };

  // Toggle theme and save to appropriate storage
  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    applyTheme(newTheme);

    // Save to Firebase if user is authenticated
    if (userId) {
      try {
        await updateUserSettings(userId, { theme: newTheme ? 'dark' : 'light' });
      } catch (error) {
        console.error('Failed to save theme to Firebase:', error);
      }
    }
  };
  const value = {
    isDarkMode,
    toggleTheme,
    isLoading,
    isMounted
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
