'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '../utils/currency';
import { getUserBudgets, addBudget, updateBudget, deleteBudget } from '../app/firebase';
import { getAuth } from 'firebase/auth';
import Swal from 'sweetalert2';

const BudgetManager = ({ isOpen, onClose, currency, transactions = [] }) => {
  const [budgets, setBudgets] = useState([]);
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [budgetForm, setBudgetForm] = useState({
    name: '',
    amount: '',
    category: '',
    period: 'monthly' // monthly, weekly, yearly
  });

  // Get current user
  useEffect(() => {
    const auth = getAuth();
    if (auth.currentUser) {
      setUserId(auth.currentUser.uid);
    }
  }, []);

  // Load budgets from Firebase
  useEffect(() => {
    if (userId && isOpen) {
      loadBudgets();
    }
  }, [userId, isOpen]);

  const loadBudgets = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const budgetsData = await getUserBudgets(userId);
      setBudgets(budgetsData);
    } catch (error) {
      console.error('Failed to load budgets:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load budgets. Please try again.',
        confirmButtonColor: '#3B82F6'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateBudgetProgress = (budget) => {
    const now = new Date();
    let startDate, endDate;

    switch (budget.period) {
      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        startDate = weekStart;
        endDate = weekEnd;
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      default: // monthly
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const relevantTransactions = transactions.filter(transaction => {
      const transactionDate = transaction.date?.toDate ? transaction.date.toDate() : new Date(transaction.date);
      return transaction.type === 'outgoing' &&
             transactionDate >= startDate &&
             transactionDate <= endDate &&
             (budget.category === '' || transaction.category === budget.category);
    });

    const spent = relevantTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const remaining = budget.amount - spent;
    const percentage = (spent / budget.amount) * 100;

    return { spent, remaining, percentage: Math.min(percentage, 100) };
  };

  const handleAddBudget = async () => {
    if (!budgetForm.name || !budgetForm.amount || !userId) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in all required fields',
        confirmButtonColor: '#3B82F6'
      });
      return;
    }

    setLoading(true);
    try {
      const newBudget = await addBudget(userId, budgetForm);
      setBudgets([...budgets, newBudget]);
      setBudgetForm({ name: '', amount: '', category: '', period: 'monthly' });
      setIsAddingBudget(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Budget created successfully!',
        confirmButtonColor: '#3B82F6',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Failed to add budget:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to create budget. Please try again.',
        confirmButtonColor: '#3B82F6'
      });
    } finally {
      setLoading(false);
    }
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

  const handleUpdateBudget = async () => {
    if (!editingBudget || !userId) return;

    setLoading(true);
    try {
      await updateBudget(userId, editingBudget, budgetForm);
      setBudgets(budgets.map(budget => 
        budget.id === editingBudget 
          ? { ...budget, ...budgetForm, amount: parseFloat(budgetForm.amount) }
          : budget
      ));
      setBudgetForm({ name: '', amount: '', category: '', period: 'monthly' });
      setIsAddingBudget(false);
      setEditingBudget(null);
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Budget updated successfully!',
        confirmButtonColor: '#3B82F6',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Failed to update budget:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update budget. Please try again.',
        confirmButtonColor: '#3B82F6'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete this budget.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280'
    });

    if (result.isConfirmed && userId) {
      setLoading(true);
      try {
        await deleteBudget(userId, budgetId);
        setBudgets(budgets.filter(budget => budget.id !== budgetId));
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted',
          text: 'Budget has been deleted successfully.',
          confirmButtonColor: '#3B82F6',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Failed to delete budget:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete budget. Please try again.',
          confirmButtonColor: '#3B82F6'
        });
      } finally {
        setLoading(false);
      }
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
                disabled={loading}
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
                    disabled={loading}
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
                      disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : (editingBudget ? 'Update' : 'Add')} Budget
                </button>
                <button
                  onClick={() => {
                    setIsAddingBudget(false);
                    setEditingBudget(null);
                    setBudgetForm({ name: '', amount: '', category: '', period: 'monthly' });
                  }}
                  className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Budget List */}
          <div className="space-y-4">
            {loading && budgets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Loading budgets...</p>
              </div>
            ) : budgets.length === 0 ? (
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
                          disabled={loading}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBudget(budget.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded-lg transition-colors"
                          disabled={loading}
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
