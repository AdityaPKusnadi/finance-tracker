'use client';

// Utility function to format currency consistently
export const formatCurrency = (amount, currencyCode = 'USD') => {
  // Ensure amount is a number
  const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  
  // Use simple formatting to avoid server-client hydration mismatch
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${numAmount.toFixed(2)}`;
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
