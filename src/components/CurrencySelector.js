'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

// CurrencySelector.js
const CurrencySelector = ({ value, onChange, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  
  const currencies = [
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸', symbol: '$' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺', symbol: '€' },
    { code: 'GBP', name: 'British Pound', flag: '🇬🇧', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵', symbol: '¥' },
    { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳', symbol: '¥' },
    { code: 'IDR', name: 'Indonesian Rupiah', flag: '🇮🇩', symbol: 'Rp' },
    { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳', symbol: '₹' },
    { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', symbol: 'C$' },
    { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬', symbol: 'S$' },
    { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷', symbol: '₩' },
    { code: 'MYR', name: 'Malaysian Ringgit', flag: '🇲🇾', symbol: 'RM' },
    { code: 'THB', name: 'Thai Baht', flag: '🇹🇭', symbol: '฿' },
    { code: 'PHP', name: 'Philippine Peso', flag: '🇵🇭', symbol: '₱' },
    { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷', symbol: 'R$' },
    { code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽', symbol: 'Mex$' },
    { code: 'VND', name: 'Vietnamese Dong', flag: '🇻🇳', symbol: '₫' },
    { code: 'RUB', name: 'Russian Ruble', flag: '🇷🇺', symbol: '₽' },
    { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦', symbol: 'R' },
    { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦', symbol: '﷼‎' },
    { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪', symbol: 'د.إ' },
    { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', symbol: 'Fr' },
    { code: 'SEK', name: 'Swedish Krona', flag: '🇸🇪', symbol: 'kr' },
    { code: 'TRY', name: 'Turkish Lira', flag: '🇹🇷', symbol: '₺' },
  ];

  const getCurrencyByCode = (code) => {
    return currencies.find(c => c.code === code) || currencies[0];
  };

  const currentCurrency = getCurrencyByCode(value);
  
  const filteredCurrencies = searchTerm 
    ? currencies.filter(c => 
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : currencies;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative ${className || ''}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-2.5 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <div className="flex items-center">
          <span className="text-xl mr-2">{currentCurrency.flag}</span>
          <span>{currentCurrency.code} - {currentCurrency.symbol}</span>
        </div>
        {isOpen ? (
          <ChevronUpIcon className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="absolute mt-1 w-full bg-card border border-border rounded-md shadow-lg z-40 max-h-60 overflow-y-auto">
          <div className="sticky top-0 bg-card p-2 border-b border-border">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search currency..."
              className="w-full p-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <ul className="py-1">
            {filteredCurrencies.map((currency) => (
              <li key={currency.code}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(currency.code);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`flex items-center w-full px-4 py-2 text-left hover:bg-muted ${value === currency.code ? 'bg-primary/10 text-primary' : ''}`}
                >
                  <span className="text-xl mr-3">{currency.flag}</span>
                  <div>
                    <div className="font-medium">{currency.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      {currency.code} <span className="mx-1">•</span> {currency.symbol}
                    </div>
                  </div>
                </button>
              </li>
            ))}
            {filteredCurrencies.length === 0 && (
              <li className="px-4 py-2 text-muted-foreground text-center">No currencies found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
