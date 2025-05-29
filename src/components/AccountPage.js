'use client';

import { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { 
  UserIcon, 
  CogIcon, 
  ArrowLeftOnRectangleIcon,
  BellIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  MapIcon,
  WalletIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import ThemeToggle from '@/components/ThemeToggle';
import CurrencySelector from '@/components/CurrencySelector';
import TravelMode from '@/components/TravelMode';
import WalletManager from '@/components/WalletManager';
import BudgetManager from '@/components/BudgetManager';
import NotificationManager from '@/components/NotificationManager';
import { notify } from '../utils/alerts';

const AccountPage = ({ currency, onCurrencyChange, transactions }) => {
  const [user, setUser] = useState(null);
  const [showTravelMode, setShowTravelMode] = useState(false);
  const [showWalletManager, setShowWalletManager] = useState(false);
  const [showBudgetManager, setShowBudgetManager] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const auth = getAuth();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleAddExpense = (amount, description, category) => {
    // This would typically call the parent component's add transaction function
    console.log('Adding travel expense:', { amount, description, category });
  };

  const menuItems = [
    {
      id: 'profile',
      title: 'Profile Settings',
      subtitle: 'Manage your account information',
      icon: UserIcon,
      onClick: () => notify('Profile settings coming soon!', 'info')
    },
    {
      id: 'wallets',
      title: 'Wallet Manager',
      subtitle: 'Manage your wallets and accounts',
      icon: WalletIcon,
      onClick: () => setShowWalletManager(true)
    },
    {
      id: 'budgets',
      title: 'Budget Manager',
      subtitle: 'Create and manage multiple budgets',
      icon: CurrencyDollarIcon,
      onClick: () => setShowBudgetManager(true)
    },
    {
      id: 'travel',
      title: 'Travel Mode',
      subtitle: 'Track expenses during travel',
      icon: MapIcon,
      onClick: () => setShowTravelMode(true)
    },    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage your notification preferences',
      icon: BellIcon,
      onClick: () => setShowNotifications(true)
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      subtitle: 'Manage your account security',
      icon: ShieldCheckIcon,
      onClick: () => notify('Security settings coming soon!', 'info')
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: QuestionMarkCircleIcon,
      onClick: () => notify('Help & Support coming soon!', 'info')
    }  ];

  // Prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <div className="bg-card rounded-xl shadow-sm p-6 mb-6">
          <div className="text-center">
            <p className="text-muted-foreground">Loading account settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* User Profile Header */}
      <div className="bg-card rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Profile" 
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <UserIcon className="h-8 w-8 text-primary" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">
              {user?.displayName || 'Finance User'}
            </h2>
            <p className="text-muted-foreground">
              {user?.email}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Member since {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Settings */}
      <div className="bg-card rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Quick Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">Switch between light and dark mode</p>
            </div>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Currency</p>
              <p className="text-sm text-muted-foreground">Change your default currency</p>
            </div>
            <CurrencySelector 
              value={currency} 
              onChange={onCurrencyChange}
              className="w-32"
            />
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-card rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Settings & Tools</h3>
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-secondary/50 transition-colors text-left"
              >
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                </div>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="text-muted-foreground"
                >
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            );
          })}
        </div>
      </div>

      {/* Logout Button */}
      <div className="bg-card rounded-xl shadow-sm p-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 p-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5" />
          Sign Out
        </button>
      </div>

      {/* Modals */}
      <TravelMode 
        isOpen={showTravelMode}
        onClose={() => setShowTravelMode(false)}
        currency={currency}
        onAddExpense={handleAddExpense}
      />
      
      <WalletManager 
        isOpen={showWalletManager}
        onClose={() => setShowWalletManager(false)}
        currency={currency}
        transactions={transactions}
      />
        <BudgetManager 
        isOpen={showBudgetManager}
        onClose={() => setShowBudgetManager(false)}
        currency={currency}
        transactions={transactions}
      />

      {/* Notification Settings Modal */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Notification Settings</h2>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <NotificationManager 
                userId={user?.uid}
                userEmail={user?.email}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;
