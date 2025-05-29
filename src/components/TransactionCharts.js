'use client';

import { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, Title } from 'chart.js';
import { format } from 'date-fns';
import { formatCurrency, formatCompactNumber, formatPercentage } from '@/utils/currency';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, Title);

const TransactionCharts = ({ transactions, currency, startDate, endDate }) => {
  const [activeChart, setActiveChart] = useState('both');
  const [dateRangeText, setDateRangeText] = useState('');

  // Set date range text for display
  useEffect(() => {
    if (startDate && endDate) {
      setDateRangeText(`${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`);
    } else if (startDate) {
      setDateRangeText(`From ${format(startDate, 'MMM d, yyyy')}`);
    } else if (endDate) {
      setDateRangeText(`Until ${format(endDate, 'MMM d, yyyy')}`);
    } else {
      setDateRangeText('All Time');
    }
  }, [startDate, endDate]);

  // Process transaction data
  const processTransactions = () => {
    // Group by category
    const categories = {
      income: {},
      expense: {}
    };
    
    transactions.forEach(transaction => {
      const type = transaction.type === 'incoming' ? 'income' : 'expense';
      const category = transaction.category || 'Uncategorized';
      
      if (!categories[type][category]) {
        categories[type][category] = 0;
      }
      
      categories[type][category] += transaction.amount;
    });

    // Sort categories by amount (descending)
    const sortedIncomeCategories = Object.entries(categories.income)
      .sort((a, b) => b[1] - a[1])
      .reduce((obj, [key, val]) => {
        obj[key] = val;
        return obj;
      }, {});

    const sortedExpenseCategories = Object.entries(categories.expense)
      .sort((a, b) => b[1] - a[1])
      .reduce((obj, [key, val]) => {
        obj[key] = val;
        return obj;
      }, {});
    
    // Get custom color palettes
    const incomeColors = getGradientColors(
      Object.keys(sortedIncomeCategories).length,
      [
        { r: 34, g: 197, b: 94 },  // green-500
        { r: 16, g: 185, b: 129 }, // emerald-500
        { r: 20, g: 184, b: 166 }  // teal-500
      ]
    );
    
    const expenseColors = getGradientColors(
      Object.keys(sortedExpenseCategories).length,
      [
        { r: 239, g: 68, b: 68 },    // red-500
        { r: 249, g: 115, b: 22 },   // orange-500 
        { r: 245, g: 158, b: 11 }    // amber-500
      ]
    );
    
    // Prepare chart data
    const incomeData = {
      labels: Object.keys(sortedIncomeCategories),
      datasets: [
        {
          data: Object.values(sortedIncomeCategories),
          backgroundColor: incomeColors.bg,
          borderColor: incomeColors.border,
          borderWidth: 1,
          hoverOffset: 15,
        },
      ],
    };
    
    const expenseData = {
      labels: Object.keys(sortedExpenseCategories),
      datasets: [
        {
          data: Object.values(sortedExpenseCategories),
          backgroundColor: expenseColors.bg,
          borderColor: expenseColors.border,
          borderWidth: 1,
          hoverOffset: 15,
        },
      ],
    };
    
    return { income: incomeData, expense: expenseData };
  };
  
  const { income, expense } = processTransactions();
  
  // Helper function to generate gradient colors
  function getGradientColors(count, baseColors) {
    if (count === 0) return { bg: [], border: [] };
    
    const bg = [];
    const border = [];
    const baseCount = baseColors.length;
    
    // Generate a gradient of colors
    for (let i = 0; i < count; i++) {
      // Use modulo to cycle through base colors
      const baseIndex = i % baseCount;
      const nextIndex = (i + 1) % baseCount;
      
      // Calculate opacity based on position in the array (0.9 to 0.5)
      const opacity = 0.9 - (0.4 * (i / Math.max(count, baseCount)));
      
      // Mix colors if we have multiple
      const mix = (i % baseCount) / baseCount;
      
      const color = {
        r: baseColors[baseIndex].r * (1 - mix) + baseColors[nextIndex].r * mix,
        g: baseColors[baseIndex].g * (1 - mix) + baseColors[nextIndex].g * mix,
        b: baseColors[baseIndex].b * (1 - mix) + baseColors[nextIndex].b * mix,
      };
      
      bg.push(`rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${opacity})`);
      border.push(`rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, 1)`);
    }
    
    return { bg, border };
  }
  
  // Chart options with improved center text positioning
  const options = {
    plugins: {
      legend: {
        position: 'bottom',
        align: 'center',
        labels: {
          boxWidth: 8,
          padding: 6,
          font: {
            size: 9
          },
          color: 'rgb(var(--foreground-rgb))',
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const dataset = context.dataset;
            const total = dataset.data.reduce((acc, data) => acc + data, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${formatCurrency(value, currency)} (${percentage}%)`;
          }
        },
        padding: 12,
        boxPadding: 6,
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
      }
    },
    cutout: '70%',
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
    }
  };

  const totalIncome = transactions
    .filter(t => t.type === 'incoming')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'outgoing')
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="w-full bg-card rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-foreground">Transaction Analysis</h3>
          
          {(startDate || endDate) && (
            <span className="text-xs text-muted-foreground mt-1 sm:mt-0">
              {dateRangeText}
            </span>
          )}
        </div>
        
        {/* Chart toggle */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-1">
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeChart === 'both' ? 'bg-primary text-primary-foreground' : 'bg-secondary/50'
            }`}
            onClick={() => setActiveChart('both')}
          >
            All
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeChart === 'income' ? 'bg-green-500 text-white' : 'bg-green-100/50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
            }`}
            onClick={() => setActiveChart('income')}
          >
            Income
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeChart === 'expense' ? 'bg-red-500 text-white' : 'bg-red-100/50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            }`}
            onClick={() => setActiveChart('expense')}
          >
            Expenses
          </button>
        </div>
        
        {/* Charts */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6`}>
          {(activeChart === 'income' || activeChart === 'both') && (
            <div className="bg-green-50/30 dark:bg-green-900/10 rounded-lg p-4">
              <h4 className="text-center font-medium text-sm text-green-700 dark:text-green-300 mb-3">Income Breakdown</h4>
              <div className="h-[220px] md:h-[240px] relative">
                {income.labels.length > 0 ? (
                  <Doughnut data={income} options={options} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                    No income data
                  </div>
                )}
                {/* Centered total display */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-[10px] text-muted-foreground font-medium mb-0.5">Total</div>
                    <div className="font-bold text-xs text-green-600 dark:text-green-400 leading-tight">
                      {formatCurrency(totalIncome, currency)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {(activeChart === 'expense' || activeChart === 'both') && (
            <div className="bg-red-50/30 dark:bg-red-900/10 rounded-lg p-4">
              <h4 className="text-center font-medium text-sm text-red-700 dark:text-red-300 mb-3">Expense Breakdown</h4>
              <div className="h-[220px] md:h-[240px] relative">
                {expense.labels.length > 0 ? (
                  <Doughnut data={expense} options={options} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                    No expense data
                  </div>
                )}
                {/* Centered total display */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-[10px] text-muted-foreground font-medium mb-0.5">Total</div>
                    <div className="font-bold text-xs text-red-600 dark:text-red-400 leading-tight">
                      {formatCurrency(totalExpense, currency)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-secondary/30 p-4 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-1">Savings Rate</p>
            <p className="text-xl font-bold">
              {totalIncome > 0 
                ? `${Math.round(((totalIncome - totalExpense) / totalIncome) * 100)}%` 
                : '0%'}
            </p>
          </div>
          <div className="bg-secondary/30 p-4 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-1">Expenses Ratio</p>
            <p className="text-xl font-bold">
              {totalIncome > 0 
                ? `${Math.round((totalExpense / totalIncome) * 100)}%` 
                : '0%'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionCharts;
