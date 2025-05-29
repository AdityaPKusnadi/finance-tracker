'use client';

// Utility function to format currency consistently
export const formatCurrency = (amount, currencyCode = 'USD') => {
  // Ensure amount is a number
  const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  
  // Use enhanced formatting with proper thousands separators
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(numAmount));
  
  const symbol = getCurrencySymbol(currencyCode);
  return `${numAmount < 0 ? '-' : ''}${symbol}${formatted}`;
};

// Enhanced number formatting for large amounts
export const formatLargeNumber = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${getCurrencySymbol(currency)}0`;
  }
  
  const num = parseFloat(amount);
  const absNum = Math.abs(num);
  
  let formatted;
  if (absNum >= 1000000000) {
    formatted = (absNum / 1000000000).toFixed(1) + 'B';
  } else if (absNum >= 1000000) {
    formatted = (absNum / 1000000).toFixed(1) + 'M';
  } else if (absNum >= 1000) {
    formatted = (absNum / 1000).toFixed(1) + 'K';
  } else {
    formatted = absNum.toFixed(2);
  }
  
  return `${num < 0 ? '-' : ''}${getCurrencySymbol(currency)}${formatted}`;
};

// Compact number formatting for charts and small displays
export const formatCompactNumber = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0';
  }
  
  const num = parseFloat(amount);
  const absNum = Math.abs(num);
  
  if (absNum >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (absNum >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else {
    return num.toFixed(0);
  }
};

// Format percentage with proper decimal places
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  
  return `${parseFloat(value).toFixed(decimals)}%`;
};

// Alternative formatting with Intl for client-side only
export const formatCurrencyIntl = (amount, currencyCode = 'USD') => {
  const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numAmount);
  } catch (error) {
    // Fallback to simple formatting
    const symbol = getCurrencySymbol(currencyCode);
    return `${symbol}${numAmount.toFixed(2)}`;
  }
};

// Get currency symbol for fallback
export const getCurrencySymbol = (currencyCode) => {
  const symbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CNY': '¥',
    'IDR': 'Rp',
    'INR': '₹',
    'AUD': 'A$',
    'CAD': 'C$',
    'SGD': 'S$',
    'KRW': '₩',
    'MYR': 'RM',
    'THB': '฿',
    'PHP': '₱',
    'BRL': 'R$',
    'MXN': 'Mex$',
    'VND': '₫',
    'RUB': '₽',
    'ZAR': 'R',
    'SAR': '﷼‎',
    'AED': 'د.إ',
    'CHF': 'Fr',
    'SEK': 'kr',
    'TRY': '₺'
  };
  
  return symbols[currencyCode] || currencyCode;
};
