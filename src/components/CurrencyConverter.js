'use client';

import { useState, useEffect } from 'react';
import { formatCurrency, getCurrencySymbol } from '@/utils/currency';

const CurrencyConverter = ({ amount, fromCurrency, onConvert }) => {
  const [toCurrency, setToCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'SGD', name: 'Singapore Dollar' },
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'KRW', name: 'South Korean Won' },
    { code: 'THB', name: 'Thai Baht' },
    { code: 'IDR', name: 'Indonesian Rupiah' },
    { code: 'MYR', name: 'Malaysian Ringgit' },
    { code: 'PHP', name: 'Philippine Peso' },
  ];

  // Fetch real-time exchange rates from a free API
  const fetchExchangeRates = async (baseCurrency = fromCurrency || 'USD') => {
    setIsLoading(true);
    try {
      // Using ExchangeRate-API (free tier allows 1500 requests/month)
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }
      
      const data = await response.json();
      setExchangeRates(data.rates);
      setLastUpdated(new Date(data.date));
      
      return data.rates;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      
      // Fallback to mock rates if API fails
      const mockRates = {
        USD: 1,
        EUR: 0.85,
        GBP: 0.73,
        JPY: 110.0,
        CNY: 6.45,
        CAD: 1.25,
        AUD: 1.35,
        CHF: 0.92,
        SGD: 1.35,
        INR: 74.5,
        KRW: 1180,
        THB: 33.5,
        IDR: 14300,
        MYR: 4.15,
        PHP: 50.5,
      };
      
      setExchangeRates(mockRates);
      setLastUpdated(new Date());
      return mockRates;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeRates();
  }, [fromCurrency]);

  useEffect(() => {
    if (amount && fromCurrency && toCurrency && exchangeRates[toCurrency]) {
      calculateConversion();
    }
  }, [amount, fromCurrency, toCurrency, exchangeRates]);

  const calculateConversion = () => {
    if (!amount || amount === '0' || !exchangeRates[toCurrency]) {
      setConvertedAmount(0);
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      setConvertedAmount(0);
      return;
    }

    if (fromCurrency === toCurrency) {
      setConvertedAmount(numAmount);
      return;
    }

    // Convert from base currency to target currency
    const rate = exchangeRates[toCurrency];
    if (rate) {
      let converted;
      if (fromCurrency === 'USD') {
        // Direct conversion from USD
        converted = numAmount * rate;
      } else {
        // Convert from source currency to USD first, then to target
        const fromRate = exchangeRates[fromCurrency] || 1;
        const usdAmount = numAmount / fromRate;
        converted = usdAmount * rate;
      }
      setConvertedAmount(converted);
    } else {
      setConvertedAmount(0);
    }
  };

  const handleConvert = () => {
    if (onConvert && convertedAmount > 0) {
      const exchangeRate = fromCurrency === 'USD' 
        ? exchangeRates[toCurrency] 
        : exchangeRates[toCurrency] / (exchangeRates[fromCurrency] || 1);

      onConvert({
        originalAmount: parseFloat(amount),
        originalCurrency: fromCurrency,
        convertedAmount: convertedAmount,
        convertedCurrency: toCurrency,
        exchangeRate: exchangeRate,
      });
    }
  };

  const formatNumber = (num) => {
    if (num === 0) return '0.00';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  const getExchangeRate = () => {
    if (fromCurrency === toCurrency) return 1;
    if (fromCurrency === 'USD') {
      return exchangeRates[toCurrency] || 0;
    } else {
      const fromRate = exchangeRates[fromCurrency] || 1;
      const toRate = exchangeRates[toCurrency] || 1;
      return toRate / fromRate;
    }
  };

  return (
    <div className="bg-secondary/30 rounded-lg p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-foreground">Currency Converter</h4>
        <button
          onClick={() => fetchExchangeRates()}
          disabled={isLoading}
          className="p-1 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          title="Refresh rates"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={isLoading ? 'animate-spin' : ''}
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        {/* From Amount */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">From:</span>
            <span className="font-mono text-sm">
              {getCurrencySymbol(fromCurrency)}{formatNumber(parseFloat(amount || 0))}
            </span>
            <span className="text-xs text-muted-foreground">{fromCurrency}</span>
          </div>
        </div>

        {/* To Currency Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">To:</span>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="flex-1 text-xs p-1.5 rounded border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {currencies
              .filter(curr => curr.code !== fromCurrency)
              .map(curr => (
                <option key={curr.code} value={curr.code}>
                  {curr.code} - {curr.name}
                </option>
              ))}
          </select>
        </div>

        {/* Converted Amount */}
        <div className="flex items-center justify-between py-2 px-3 bg-primary/10 rounded border">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-sm font-medium text-primary">
              {getCurrencySymbol(toCurrency)}{formatNumber(convertedAmount)}
            </span>
            <span className="text-xs text-muted-foreground">{toCurrency}</span>
          </div>
          <button
            onClick={handleConvert}
            disabled={convertedAmount === 0}
            className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Use
          </button>
        </div>

        {/* Exchange Rate Info */}
        {exchangeRates[toCurrency] && (
          <div className="text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Rate: 1 {fromCurrency} = {getExchangeRate().toFixed(4)} {toCurrency}</span>
            </div>
            {lastUpdated && (
              <div className="text-right">
                Updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencyConverter;
