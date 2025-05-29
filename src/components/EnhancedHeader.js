'use client';

import { useState } from 'react';
import { 
  WalletIcon, 
  MapIcon, 
  Cog6ToothIcon,
  ChevronDownIcon,
  EllipsisVerticalIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import ThemeToggle from './ThemeToggle';

const EnhancedHeader = ({ 
  activeWallet, 
  wallets, 
  onWalletChange, 
  isTravelMode, 
  onToggleTravelMode,
  onOpenSettings,
  onOpenWalletManager,
  onOpenCategoryManager
}) => {
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-card/95 backdrop-blur-md">
      {/* Main Header */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">          {/* Left: App Logo */}
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Finance Tracker" 
              className="h-8 w-auto md:h-10"
            />
          </div>

          {/* Center: Desktop Controls */}
          <div className="hidden md:flex items-center gap-2">
            {/* Wallet Selector */}
            <div className="relative">
              <button
                onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-secondary/60 hover:bg-secondary rounded-xl transition-all duration-200 text-sm border border-border/50"
              >
                <WalletIcon className="h-4 w-4 text-primary" />
                <span className="font-medium max-w-24 truncate">
                  {activeWallet?.name || 'Default'}
                </span>
                <ChevronDownIcon className={`h-3 w-3 transition-transform duration-200 ${isWalletDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Wallet Dropdown */}
              {isWalletDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-1">
                    {wallets.map((wallet) => (
                      <button
                        key={wallet.id}
                        onClick={() => {
                          onWalletChange(wallet);
                          setIsWalletDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                          activeWallet?.id === wallet.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-secondary/80'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{wallet.name}</span>
                          <span className="text-xs opacity-75 bg-secondary/50 px-2 py-0.5 rounded-full">
                            {wallet.currency}
                          </span>
                        </div>
                      </button>
                    ))}
                    <hr className="my-1 border-border" />
                    <button
                      onClick={() => {
                        onOpenWalletManager();
                        setIsWalletDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm hover:bg-secondary/80 transition-colors text-primary font-medium"
                    >
                      + Manage Wallets
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Travel Mode Toggle */}
            <button
              onClick={onToggleTravelMode}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 text-sm border ${
                isTravelMode
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                  : 'bg-secondary/60 hover:bg-secondary border-border/50'
              }`}
            >
              <MapIcon className={`h-4 w-4 ${isTravelMode ? 'text-blue-600 dark:text-blue-400' : ''}`} />
              <span className="font-medium hidden lg:block">
                {isTravelMode ? 'Travel' : 'Home'}
              </span>
              {isTravelMode && (
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </button>
          </div>          {/* Right: Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onOpenCategoryManager}
              className="p-2 rounded-xl hover:bg-secondary/80 transition-colors border border-transparent hover:border-border/50"
              title="Manage Categories"
            >
              <TagIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl hover:bg-secondary/80 transition-colors border border-transparent hover:border-border/50"
              title="Settings"
            >
              <Cog6ToothIcon className="h-5 w-5" />
            </button>
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-secondary transition-colors"
          >
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>
        </div>
      </div>      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-card">
          <div className="p-4 space-y-4">
            {/* Mobile Wallet Section */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Wallet</h3>
              <div className="relative">
                <button
                  onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-secondary/50 rounded-xl text-sm border border-border/30"
                >
                  <div className="flex items-center gap-2">
                    <WalletIcon className="h-4 w-4 text-primary" />
                    <span className="font-medium">
                      {activeWallet?.name || 'Default Wallet'}
                    </span>
                  </div>
                  <ChevronDownIcon className={`h-4 w-4 transition-transform ${isWalletDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Mobile Wallet Dropdown */}
                {isWalletDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="p-1">
                      {wallets.map((wallet) => (
                        <button
                          key={wallet.id}
                          onClick={() => {
                            onWalletChange(wallet);
                            setIsWalletDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-colors ${
                            activeWallet?.id === wallet.id
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-secondary'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{wallet.name}</span>
                            <span className="text-xs opacity-75 bg-secondary/50 px-2 py-1 rounded-full">
                              {wallet.currency}
                            </span>
                          </div>
                        </button>
                      ))}
                      <hr className="my-1 border-border" />
                      <button
                        onClick={() => {
                          onOpenWalletManager();
                          setIsWalletDropdownOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-3 rounded-lg text-sm hover:bg-secondary transition-colors text-primary font-medium"
                      >
                        + Manage Wallets
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Travel Mode Section */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Mode</h3>
              <button
                onClick={() => {
                  onToggleTravelMode();
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all ${
                  isTravelMode
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    : 'bg-secondary/50 border border-border/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapIcon className={`h-4 w-4 ${isTravelMode ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                  <div className="text-left">
                    <div className="font-medium">
                      {isTravelMode ? 'Travel Mode' : 'Home Mode'}
                    </div>
                    <div className="text-xs opacity-75">
                      {isTravelMode ? 'Multi-currency tracking' : 'Default currency'}
                    </div>
                  </div>
                </div>
                {isTravelMode && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                )}
              </button>
            </div>            {/* Mobile Actions Section */}
            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onOpenCategoryManager();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-secondary transition-colors text-sm"
                >
                  <TagIcon className="h-4 w-4" />
                  <span>Categories</span>
                </button>
                <button
                  onClick={() => {
                    onOpenSettings();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-secondary transition-colors text-sm"
                >
                  <Cog6ToothIcon className="h-4 w-4" />
                  <span>Settings</span>
                </button>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}</header>
  );
};

export default EnhancedHeader;
