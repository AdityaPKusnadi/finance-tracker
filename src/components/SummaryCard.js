'use client';

import { formatCurrency } from '@/utils/currency';

const SummaryCard = ({ title, amount, currency, icon, bgClass, textClass, type }) => {
  // Default styling based on card type and theme
  const getDefaultStyling = () => {
    if (bgClass) return { bgClass, textClass };
    
    switch (type) {
      case 'income':
        return {
          bgClass: 'bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white',
          textClass: 'text-white'
        };
      case 'expense':
        return {
          bgClass: 'bg-gradient-to-r from-red-500 to-rose-600 dark:from-red-600 dark:to-rose-700 text-white',
          textClass: 'text-white'
        };
      case 'balance':
        return {
          bgClass: 'bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 text-white',
          textClass: 'text-white'
        };
      default:
        return {
          bgClass: 'bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow',
          textClass: 'text-foreground'
        };
    }
  };

  const styling = getDefaultStyling();
  const cardBg = bgClass || styling.bgClass;
  const cardText = textClass || styling.textClass;

  return (
    <div className={`relative overflow-hidden rounded-xl p-4 transition-all duration-300 ${cardBg}`}>
      <div className="flex justify-between items-center">
        <div>
          <p className={`text-sm font-medium mb-1 ${cardBg.includes('text-white') ? 'text-white/80' : 'text-muted-foreground'}`}>
            {title}
          </p>
          <p className={`text-xl md:text-2xl font-bold ${cardText}`}>
            {typeof amount === 'number' 
              ? formatCurrency(amount, currency)
              : amount}
          </p>
        </div>
        <div className={`flex items-center justify-center w-12 h-12 rounded-full ${cardBg.includes('gradient') ? 'bg-white/20 dark:bg-black/20' : 'bg-secondary/50 dark:bg-secondary/30'}`}>
          {icon}
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 opacity-10">
        <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        </svg>
      </div>
    </div>
  );
};

export default SummaryCard;
