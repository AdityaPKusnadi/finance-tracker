'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/currency';

const BudgetManager = ({ isOpen, onClose, currency, transactions = [] }) => {
  const [budgets, setBudgets] = useState([]);
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [budgetForm, setBudgetForm] = useState({
    name: '',
    amount: '',
    category: '',
    period: 'monthly' // monthly, weekly, yearly
  });

  useEffect(() => {
    // Load budgets from localStorage
    const savedBudgets = localStorage.getItem('budgets');
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
  }, []);

  useEffect(() => {
    // Save budgets to localStorage
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  const calculateBudgetProgress = (budget) => {
    const now = new Date();
    let startDate, endDate;

    switch (budget.period) {
      case 'weekly':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;
      case 'monthly':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
    }

    const relevantTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date.seconds * 1000);
      return transactionDate >= startDate && 
             transactionDate < endDate && 
             transaction.type === 'outgoing' &&
             (budget.category === '' || transaction.category === budget.category);
    });

    const spent = relevantTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const remaining = budget.amount - spent;
    const percentage = (spent / budget.amount) * 100;

    return { spent, remaining, percentage: Math.min(percentage, 100) };
  };

  const handleAddBudget = () => {
    if (!budgetForm.name || !budgetForm.amount) {
      alert('Please fill in all required fields');
      return;
    }

    const newBudget = {
      id: Date.now(),
      ...budgetForm,
      amount: parseFloat(budgetForm.amount),
      createdAt: new Date().toISOString()
    };

    setBudgets([...budgets, newBudget]);
    setBudgetForm({ name: '', amount: '', category: '', period: 'monthly' });
    setIsAddingBudget(false);
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget.id);
    setBudgetForm({
      name: budget.name,
      amount: budget.amount.toString(),
      category: budget.category,
      period: budget.period
    });
    setIsAddingBudget(true);
  };

  const handleUpdateBudget = () => {
    setBudgets(budgets.map(budget => 
      budget.id === editingBudget 
        ? { ...budget, ...budgetForm, amount: parseFloat(budgetForm.amount) }
        : budget
    ));
    setBudgetForm({ name: '', amount: '', category: '', period: 'monthly' });
    setIsAddingBudget(false);
    setEditingBudget(null);
  };

  const handleDeleteBudget = (budgetId) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      setBudgets(budgets.filter(budget => budget.id !== budgetId));
    }
  };

  const getBudgetStatusColor = (percentage) => {
    if (percentage <= 50) return 'bg-green-500';
    if (percentage <= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Budget Manager</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setIsAddingBudget(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground p-2 rounded-lg transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
          </div>

          {/* Add/Edit Budget Form */}
          {isAddingBudget && (
            <div className="bg-secondary/50 rounded-lg p-4 mb-6">
              <h4 className="font-medium mb-4">
                {editingBudget ? 'Edit Budget' : 'Add New Budget'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Budget Name *
                  </label>
                  <input
                    type="text"
                    value={budgetForm.name}
                    onChange={(e) => setBudgetForm({...budgetForm, name: e.target.value})}
                    className="w-full p-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Monthly Groceries"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Amount *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                      {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency}
                    </div>
                    <input
                      type="number"
                      value={budgetForm.amount}
                      onChange={(e) => setBudgetForm({...budgetForm, amount: e.target.value})}
                      className="w-full p-3 pl-10 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Category (Optional)
                  </label>
                  <input
                    type="text"
                    value={budgetForm.category}
                    onChange={(e) => setBudgetForm({...budgetForm, category: e.target.value})}
                    className="w-full p-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Food, Entertainment"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Period
                  </label>
                  <select
                    value={budgetForm.period}
                    onChange={(e) => setBudgetForm({...budgetForm, period: e.target.value})}
                    className="w-full p-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={editingBudget ? handleUpdateBudget : handleAddBudget}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors"
                >
                  {editingBudget ? 'Update' : 'Add'} Budget
                </button>
                <button
                  onClick={() => {
                    setIsAddingBudget(false);
                    setEditingBudget(null);
                    setBudgetForm({ name: '', amount: '', category: '', period: 'monthly' });
                  }}
                  className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Budget List */}
          <div className="space-y-4">
            {budgets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No budgets created yet</p>
                <p className="text-sm">Create your first budget to start tracking</p>
              </div>
            ) : (
              budgets.map((budget) => {
                const progress = calculateBudgetProgress(budget);
                return (
                  <div key={budget.id} className="bg-secondary/30 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{budget.name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {budget.period} {budget.category && `• ${budget.category}`}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditBudget(budget)}
                          className="p-2 hover:bg-secondary rounded-lg transition-colors"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBudget(budget.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded-lg transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Spent: {formatCurrency(progress.spent, currency)}</span>
                        <span>Remaining: {formatCurrency(progress.remaining, currency)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${getBudgetStatusColor(progress.percentage)}`}
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                      <div className="text-center text-xs text-muted-foreground">
                        {progress.percentage.toFixed(1)}% used of {formatCurrency(budget.amount, currency)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetManager;
