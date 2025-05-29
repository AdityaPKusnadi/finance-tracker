'use client';

import { useState, useMemo } from 'react';
import { formatCurrency } from '@/utils/currency';
import { PencilIcon, TrashIcon, FunnelIcon } from '@heroicons/react/24/outline';
import DateRangeFilter from '@/components/DateRangeFilter';

const TransactionsPage = ({ 
  transactions, 
  currency, 
  onEditTransaction, 
  onDeleteTransaction,
  categories,
  startDate,
  endDate,
  onDateFilterChange 
}) => {
  const [filterType, setFilterType] = useState('all'); // all, incoming, outgoing
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date'); // date, amount, category
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [searchQuery, setSearchQuery] = useState('');

  // Helper function to get category icon from CategoryManager
  const getCategoryIcon = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    if (category && category.icon) {
      const categoryIcons = {
        'tag': '🏷️',
        'food': '🍔',
        'transport': '🚗',
        'shopping': '🛒',
        'entertainment': '🎬',
        'health': '⚕️',
        'education': '📚',
        'utilities': '💡',
        'rent': '🏠',
        'salary': '💰',
        'investment': '📈',
        'gift': '🎁'
      };
      return categoryIcons[category.icon] || '🏷️';
    }
    return '🏷️';
  };

  // Helper function to get category color
  const getCategoryColor = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.color || '#3B82F6';
  };

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === filterCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort transactions
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'category':
          comparison = (a.category || '').localeCompare(b.category || '');
          break;
        case 'date':
        default:
          comparison = new Date(a.date.seconds * 1000) - new Date(b.date.seconds * 1000);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [transactions, filterType, filterCategory, searchQuery, sortBy, sortOrder]);

  const getTransactionIcon = (type) => {
    return type === 'incoming' ? (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
        <path d="m6 9 6-6 6 6"></path>
        <path d="M12 3v18"></path>
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
        <path d="m6 15 6 6 6-6"></path>
        <path d="M12 3v18"></path>
      </svg>
    );
  };

  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'incoming')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = filteredTransactions
      .filter(t => t.type === 'outgoing')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { income, expenses, net: income - expenses };
  }, [filteredTransactions]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white">
          <p className="text-sm opacity-90">Total Income</p>
          <p className="text-2xl font-bold">{formatCurrency(summary.income, currency)}</p>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-xl p-4 text-white">
          <p className="text-sm opacity-90">Total Expenses</p>
          <p className="text-2xl font-bold">{formatCurrency(summary.expenses, currency)}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 text-white">
          <p className="text-sm opacity-90">Net Balance</p>
          <p className="text-2xl font-bold">{formatCurrency(summary.net, currency)}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-card rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Filters & Search</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="w-full p-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full p-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Types</option>
              <option value="incoming">Income</option>
              <option value="outgoing">Expenses</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full p-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Sort By
            </label>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 p-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="category">Category</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Date Range Filter */}
        <DateRangeFilter onFilterChange={onDateFilterChange} />
      </div>

      {/* Transaction List */}
      <div className="bg-card rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-xl font-semibold">
            Transaction History ({filteredTransactions.length})
          </h3>
        </div>
        
        <div className="divide-y divide-border">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No transactions found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (            filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="p-4 hover:bg-secondary/20 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {/* Transaction type icon */}
                      <div className="p-2 bg-secondary/50 rounded-full">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      {/* Category icon */}
                      {transaction.category && (
                        <div 
                          className="p-2 rounded-full text-lg"
                          style={{ backgroundColor: `${getCategoryColor(transaction.category)}20` }}
                          title={transaction.category}
                        >
                          {getCategoryIcon(transaction.category)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {transaction.description || 'No description'}
                        </p>
                        {transaction.category && (
                          <span 
                            className="text-xs px-2 py-1 rounded-full text-white font-medium"
                            style={{ backgroundColor: getCategoryColor(transaction.category) }}
                          >
                            {transaction.category}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.date.seconds * 1000).toLocaleDateString()} at{' '}
                        {new Date(transaction.date.seconds * 1000).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <p className={`text-lg font-semibold ${
                      transaction.type === 'incoming' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.type === 'incoming' ? '+' : '-'}
                      {formatCurrency(transaction.amount, currency)}
                    </p>
                    
                    <div className="flex gap-1">
                      <button
                        onClick={() => onEditTransaction(transaction)}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                        title="Edit transaction"
                      >
                        <PencilIcon className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => onDeleteTransaction(transaction)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded-lg transition-colors"
                        title="Delete transaction"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;
