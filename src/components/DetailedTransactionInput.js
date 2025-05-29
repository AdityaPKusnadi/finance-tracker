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
    'Utilities': [
      { name: 'Electricity', icon: '⚡' },
      { name: 'Water', icon: '💧' },
      { name: 'Gas', icon: '🔥' },
      { name: 'Internet', icon: '🌐' },
      { name: 'Phone', icon: '📞' },
    ],
    'Education': [
      { name: 'Tuition', icon: '🎓' },
      { name: 'Books & Supplies', icon: '📚' },
      { name: 'Online Courses', icon: '💻' },
      { name: 'Certification', icon: '📜' },
      { name: 'Training', icon: '👨‍🏫' },
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
      return sum + ((parseFloat(sub.amount) || 0) * (parseInt(sub.quantity) || 1));
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

  const copyToClipboard = () => {
    const total = calculateTotal();
    const summary = `${category} breakdown: ${formatCurrency(total, currency)}\n${details.subcategories.map(s => `• ${s.name}: ${formatCurrency((s.amount || 0) * (s.quantity || 1), currency)} (${s.quantity}x ${formatCurrency(s.amount || 0, currency)})`).join('\n')}`;
    navigator.clipboard.writeText(summary);
  };

  if (!categoryDetails[category]) {
    return null; // Don't show detailed input for categories without predefined subcategories
  }

  return (
    <div className="space-y-6">
      {/* Header with total */}
      <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div>
          <h4 className="text-lg font-semibold text-foreground">Detailed Breakdown</h4>
          <p className="text-sm text-muted-foreground">Break down your {category.toLowerCase()} expenses</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Amount</p>
          <p className="text-xl font-bold text-primary">
            {formatCurrency(details.totalAmount, currency)}
          </p>
        </div>
      </div>

      {/* Quick Add Subcategory Buttons */}
      {availableSubcategories.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-muted-foreground mb-3">Quick Add Items:</h5>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availableSubcategories.map((subcat) => (
              <button
                key={subcat.name}
                type="button"
                onClick={() => addSubcategory(subcat)}
                className="flex items-center gap-2 p-3 text-sm bg-secondary/50 hover:bg-secondary rounded-lg transition-colors border border-border/50 hover:border-border"
                disabled={details.subcategories.some(sub => sub.name === subcat.name)}
              >
                <span className="text-lg">{subcat.icon}</span>
                <span className="font-medium">{subcat.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Added Subcategories List */}
      {details.subcategories.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-muted-foreground mb-3">Added Items:</h5>
          <div className="space-y-3">
            {details.subcategories.map((sub) => (
              <div key={sub.id} className="p-4 bg-card border border-border rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{sub.icon}</span>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Item
                      </label>
                      <p className="text-sm font-medium">{sub.name}</p>
                    </div>
                    
                    {/* Amount */}
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Amount <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground text-sm">
                          {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency}
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={sub.amount}
                          onChange={(e) => updateSubcategory(sub.id, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    
                    {/* Quantity */}
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={sub.quantity}
                        onChange={(e) => updateSubcategory(sub.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeSubcategory(sub.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Notes */}
                <div className="mt-3">
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Notes (optional)
                  </label>
                  <input
                    type="text"
                    value={sub.notes}
                    onChange={(e) => updateSubcategory(sub.id, 'notes', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Additional notes..."
                  />
                </div>
                
                {/* Item total */}
                <div className="mt-2 text-right">
                  <span className="text-sm text-muted-foreground">Item Total: </span>
                  <span className="font-semibold text-primary">
                    {formatCurrency(sub.amount * sub.quantity, currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overall Notes */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Overall Notes (Optional)
        </label>
        <textarea
          value={details.notes}
          onChange={(e) => setDetails(prev => ({ ...prev, notes: e.target.value }))}
          className="w-full p-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          rows="3"
          placeholder="Any additional notes about this transaction..."
        />
      </div>

      {/* Summary */}
      {details.subcategories.length > 0 && (
        <div className="p-4 bg-secondary/30 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-sm font-medium text-muted-foreground">Summary</h5>
            <button
              type="button"
              onClick={copyToClipboard}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
              title="Copy summary to clipboard"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </button>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Items: {details.subcategories.length}</span>
              <span>Total Quantity: {details.subcategories.reduce((sum, sub) => sum + sub.quantity, 0)}</span>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t border-border">
              <span>Grand Total:</span>
              <span className="text-primary">{formatCurrency(details.totalAmount, currency)}</span>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex justify-end mt-3 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setDetails(prev => ({ ...prev, subcategories: [] }))}
              className="text-xs text-red-500 hover:underline"
            >
              Clear All Items
            </button>
          </div>
        </div>
      )}

      {details.subcategories.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-lg font-medium mb-2">No items added yet</p>
          <p className="text-sm">Click on the buttons above to add expense items for detailed tracking</p>
        </div>
      )}
    </div>
  );
};

export default DetailedTransactionInput;
