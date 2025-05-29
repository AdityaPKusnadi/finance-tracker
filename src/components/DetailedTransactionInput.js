'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/utils/currency';

const DetailedTransactionInput = ({ 
  category, 
  currency, 
  onDetailsChange, 
  initialDetails = null 
}) => {
  const [details, setDetails] = useState({
    subcategories: [],
    totalAmount: 0,
    notes: ''
  });

  // Predefined subcategories for different main categories
  const categoryDetails = {
    'Food': [
      { name: 'Main Dish', icon: '🍽️' },
      { name: 'Drinks', icon: '🥤' },
      { name: 'Side Dishes', icon: '🍟' },
      { name: 'Dessert', icon: '🍰' },
      { name: 'Appetizer', icon: '🥗' },
    ],
    'Travel': [
      { name: 'Transportation', icon: '🚗' },
      { name: 'Accommodation', icon: '🏨' },
      { name: 'Food & Dining', icon: '🍽️' },
      { name: 'Activities', icon: '🎭' },
      { name: 'Shopping', icon: '🛍️' },
    ],
    'Shopping': [
      { name: 'Clothing', icon: '👕' },
      { name: 'Electronics', icon: '📱' },
      { name: 'Books', icon: '📚' },
      { name: 'Home & Garden', icon: '🏠' },
      { name: 'Health & Beauty', icon: '💄' },
    ],
    'Entertainment': [
      { name: 'Movies', icon: '🎬' },
      { name: 'Games', icon: '🎮' },
      { name: 'Music', icon: '🎵' },
      { name: 'Sports', icon: '⚽' },
      { name: 'Events', icon: '🎪' },
    ],
    'Health': [
      { name: 'Doctor Visit', icon: '👨‍⚕️' },
      { name: 'Medication', icon: '💊' },
      { name: 'Dental', icon: '🦷' },
      { name: 'Gym', icon: '💪' },
      { name: 'Insurance', icon: '🛡️' },
    ],
    'Transportation': [
      { name: 'Fuel', icon: '⛽' },
      { name: 'Public Transport', icon: '🚌' },
      { name: 'Taxi/Ride Share', icon: '🚕' },
      { name: 'Parking', icon: '🅿️' },
      { name: 'Maintenance', icon: '🔧' },
    ],
  };

  useEffect(() => {
    if (initialDetails) {
      setDetails(initialDetails);
    } else {
      // Reset details when category changes
      setDetails({
        subcategories: [],
        totalAmount: 0,
        notes: ''
      });
    }
  }, [category, initialDetails]);

  useEffect(() => {
    onDetailsChange(details);
  }, [details, onDetailsChange]);

  const availableSubcategories = categoryDetails[category] || [];

  const addSubcategory = (subcategory) => {
    const newSubcategory = {
      id: Date.now() + Math.random(),
      name: subcategory.name,
      icon: subcategory.icon,
      amount: 0,
      quantity: 1,
      notes: ''
    };

    setDetails(prev => ({
      ...prev,
      subcategories: [...prev.subcategories, newSubcategory]
    }));
  };

  const updateSubcategory = (id, field, value) => {
    setDetails(prev => ({
      ...prev,
      subcategories: prev.subcategories.map(sub =>
        sub.id === id ? { ...sub, [field]: value } : sub
      )
    }));
  };

  const removeSubcategory = (id) => {
    setDetails(prev => ({
      ...prev,
      subcategories: prev.subcategories.filter(sub => sub.id !== id)
    }));
  };

  const calculateTotal = () => {
    const total = details.subcategories.reduce((sum, sub) => {
      return sum + (parseFloat(sub.amount) || 0);
    }, 0);

    if (total !== details.totalAmount) {
      setDetails(prev => ({ ...prev, totalAmount: total }));
    }

    return total;
  };

  // Calculate total whenever subcategories change
  useEffect(() => {
    calculateTotal();
  }, [details.subcategories]);

  if (!categoryDetails[category]) {
    return null; // Don't show detailed input for categories without predefined subcategories
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">Detailed Breakdown</h4>
        <span className="text-xs text-muted-foreground">
          Total: {formatCurrency(details.totalAmount, currency)}
        </span>
      </div>

      {/* Add Subcategory Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {availableSubcategories.map((subcat) => (
          <button
            key={subcat.name}
            type="button"
            onClick={() => addSubcategory(subcat)}
            disabled={details.subcategories.some(s => s.name === subcat.name)}
            className="flex items-center space-x-2 p-2 text-xs border border-border rounded-lg hover:bg-secondary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{subcat.icon}</span>
            <span>{subcat.name}</span>
          </button>
        ))}
      </div>

      {/* Subcategory Details */}
      {details.subcategories.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-xs font-medium text-muted-foreground">Breakdown Details</h5>
          
          {details.subcategories.map((sub) => (
            <div key={sub.id} className="bg-secondary/20 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span>{sub.icon}</span>
                  <span className="text-sm font-medium">{sub.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeSubcategory(sub.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Amount</label>
                  <input
                    type="number"
                    value={sub.amount}
                    onChange={(e) => updateSubcategory(sub.id, 'amount', e.target.value)}
                    className="w-full text-xs p-1.5 rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Quantity</label>
                  <input
                    type="number"
                    value={sub.quantity}
                    onChange={(e) => updateSubcategory(sub.id, 'quantity', e.target.value)}
                    className="w-full text-xs p-1.5 rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="1"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Notes</label>
                <input
                  type="text"
                  value={sub.notes}
                  onChange={(e) => updateSubcategory(sub.id, 'notes', e.target.value)}
                  className="w-full text-xs p-1.5 rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Optional notes..."
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Overall Notes */}
      <div>
        <label className="block text-xs text-muted-foreground mb-1">Overall Notes</label>
        <textarea
          value={details.notes}
          onChange={(e) => setDetails(prev => ({ ...prev, notes: e.target.value }))}
          className="w-full text-xs p-2 rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Additional notes about this transaction..."
          rows="2"
        />
      </div>

      {/* Quick Actions */}
      {details.subcategories.length > 0 && (
        <div className="flex justify-between items-center pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {details.subcategories.length} item{details.subcategories.length !== 1 ? 's' : ''}
          </span>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => {
                const total = calculateTotal();
                navigator.clipboard.writeText(`${category} breakdown: ${formatCurrency(total, currency)}\n${details.subcategories.map(s => `• ${s.name}: ${formatCurrency(s.amount || 0, currency)}`).join('\n')}`);
              }}
              className="text-xs text-primary hover:underline"
            >
              Copy Summary
            </button>
            <button
              type="button"
              onClick={() => setDetails(prev => ({ ...prev, subcategories: [] }))}
              className="text-xs text-red-500 hover:underline"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailedTransactionInput;
