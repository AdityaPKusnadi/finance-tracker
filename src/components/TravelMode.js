'use client';

import { useState, useEffect } from 'react';
import { MapIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/currency';

const TravelMode = ({ isOpen, onClose, currency, onAddExpense }) => {
  const [travelBudget, setTravelBudget] = useState('');
  const [remainingBudget, setRemainingBudget] = useState(0);
  const [travelExpenses, setTravelExpenses] = useState([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Load travel data from localStorage
    const savedTravelData = localStorage.getItem('travelMode');
    if (savedTravelData) {
      const data = JSON.parse(savedTravelData);
      setTravelBudget(data.budget || '');
      setTravelExpenses(data.expenses || []);
      setIsActive(data.isActive || false);
    }
  }, []);

  useEffect(() => {
    if (travelBudget && travelExpenses.length >= 0) {
      const totalExpenses = travelExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      setRemainingBudget(parseFloat(travelBudget) - totalExpenses);
    }
  }, [travelBudget, travelExpenses]);

  const handleStartTravel = () => {
    if (!travelBudget || parseFloat(travelBudget) <= 0) {
      alert('Please enter a valid travel budget');
      return;
    }

    const travelData = {
      budget: travelBudget,
      expenses: [],
      isActive: true,
      startDate: new Date().toISOString()
    };

    localStorage.setItem('travelMode', JSON.stringify(travelData));
    setIsActive(true);
    setTravelExpenses([]);
  };

  const handleStopTravel = () => {
    setIsActive(false);
    localStorage.removeItem('travelMode');
    setTravelBudget('');
    setTravelExpenses([]);
    setRemainingBudget(0);
  };

  const addTravelExpense = (amount, description) => {
    const newExpense = {
      id: Date.now(),
      amount: parseFloat(amount),
      description,
      date: new Date().toISOString()
    };

    const updatedExpenses = [...travelExpenses, newExpense];
    setTravelExpenses(updatedExpenses);

    // Update localStorage
    const travelData = JSON.parse(localStorage.getItem('travelMode') || '{}');
    travelData.expenses = updatedExpenses;
    localStorage.setItem('travelMode', JSON.stringify(travelData));

    // Also add to main transactions
    onAddExpense(amount, description, 'Travel');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <MapIcon className="h-6 w-6 text-primary mr-2" />
              <h3 className="text-xl font-bold">Travel Mode</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {!isActive ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Travel Budget
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                    {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency}
                  </div>
                  <input
                    type="number"
                    value={travelBudget}
                    onChange={(e) => setTravelBudget(e.target.value)}
                    className="w-full p-3 pl-10 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              
              <button
                onClick={handleStartTravel}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-lg transition-colors"
              >
                Start Travel Mode
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Budget Overview */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-4 text-white">
                <div className="text-center">
                  <p className="text-sm opacity-90">Remaining Budget</p>
                  <p className={`text-2xl font-bold ${remainingBudget < 0 ? 'text-red-200' : 'text-white'}`}>
                    {formatCurrency(remainingBudget, currency)}
                  </p>
                  <p className="text-xs opacity-75 mt-1">
                    Total: {formatCurrency(parseFloat(travelBudget), currency)}
                  </p>
                </div>
              </div>

              {/* Recent Travel Expenses */}
              <div>
                <h4 className="font-medium mb-3">Recent Travel Expenses</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {travelExpenses.length > 0 ? (
                    travelExpenses.slice(-5).reverse().map((expense) => (
                      <div key={expense.id} className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{expense.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(expense.date).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="font-medium text-red-600 dark:text-red-400">
                          -{formatCurrency(expense.amount, currency)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm text-center py-4">
                      No travel expenses yet
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const amount = prompt('Enter expense amount:');
                    const description = prompt('Enter description:');
                    if (amount && description) {
                      addTravelExpense(amount, description);
                    }
                  }}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  Quick Expense
                </button>
                <button
                  onClick={handleStopTravel}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  End Travel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TravelMode;
