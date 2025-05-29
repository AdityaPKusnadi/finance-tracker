'use client';

import { useState } from 'react';
import { 
  HomeIcon, 
  ChartBarIcon, 
  PlusIcon, 
  CurrencyDollarIcon, 
  UserIcon,
  WalletIcon,
  MapIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid, 
  ChartBarIcon as ChartBarIconSolid, 
  CurrencyDollarIcon as CurrencyDollarIconSolid, 
  UserIcon as UserIconSolid,
  WalletIcon as WalletIconSolid,
  MapIcon as MapIconSolid,
  CreditCardIcon as CreditCardIconSolid
} from '@heroicons/react/24/solid';

const BottomNavigation = ({ activeTab, onTabChange, onAddTransaction }) => {    
  const tabs = [
    {
      id: 'home',
      label: 'Home',
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: ChartBarIcon,
      iconSolid: ChartBarIconSolid,
    },
    {
      id: 'add',
      label: 'Add',
      icon: PlusIcon,
      iconSolid: PlusIcon,
      isSpecial: true,
    },
    {
      id: 'budget',
      label: 'Budget',
      icon: CurrencyDollarIcon,
      iconSolid: CurrencyDollarIconSolid,
    },
    {
      id: 'account',
      label: 'Account',
      icon: UserIcon,
      iconSolid: UserIconSolid,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="grid grid-cols-5 py-2">
        {tabs.map((tab) => {
          const Icon = activeTab === tab.id ? tab.iconSolid : tab.icon;
          const isActive = activeTab === tab.id;
          
          if (tab.isSpecial) {
            return (
              <button
                key={tab.id}
                onClick={onAddTransaction}
                className="flex flex-col items-center justify-center p-3 group"
              >
                <div className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-3 shadow-lg group-active:scale-95 transition-all duration-150">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-xs mt-1 text-muted-foreground">
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center p-3 transition-colors ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-xs">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
