'use client';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getUserBalance, addTransaction, updateTransaction, deleteTransaction, updateUserCurrency, getUserCurrency, getUserWallets, getUserSettings, updateUserSettings } from '../firebase';
import { useRouter } from 'next/navigation';
import { collection, query, onSnapshot, orderBy, addDoc, deleteDoc, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeftOnRectangleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import ThemeToggle from '@/components/ThemeToggle';
import TransactionCharts from '@/components/TransactionCharts';
import CurrencySelector from '@/components/CurrencySelector';
import CategorySelector from '@/components/CategorySelector';
import SummaryCard from '@/components/SummaryCard';
import DateRangeFilter from '@/components/DateRangeFilter';
import BottomNavigation from '@/components/BottomNavigation';
import TransactionsPage from '@/components/TransactionsPage';
import AccountPage from '@/components/AccountPage';
import BudgetManager from '@/components/BudgetManager';
import WalletManager from '@/components/WalletManager';
import CategoryManager from '@/components/CategoryManager';
import TravelMode from '@/components/TravelMode';
import EnhancedHeader from '@/components/EnhancedHeader';
import Calculator from '@/components/Calculator';
import CurrencyConverter from '@/components/CurrencyConverter';
import DetailedTransactionInput from '@/components/DetailedTransactionInput';
import EnhancedTransactionModal from '@/components/EnhancedTransactionModal';
import { formatCurrency } from '@/utils/currency';
import { notify } from '../../utils/alerts';
import Swal from 'sweetalert2';

export default function Dashboard() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [balance, setBalance] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState('incoming');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);  const [categories, setCategories] = useState([]);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [editTransactionId, setEditTransactionId] = useState(null);
  const [currency, setCurrency] = useState('USD');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  
  // New state for enhanced features
  const [wallets, setWallets] = useState([]);
  const [activeWallet, setActiveWallet] = useState(null);
  const [isTravelMode, setIsTravelMode] = useState(false);  const [isWalletManagerOpen, setIsWalletManagerOpen] = useState(false);
  const [isTravelModeOpen, setIsTravelModeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState({
    subcategories: [],
    totalAmount: 0,
    notes: ''
  });
  
  const auth = getAuth();
  const router = useRouter();

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const userBalance = await getUserBalance(user.uid);
        setBalance(userBalance);

        const userCurrency = await getUserCurrency(user.uid);
        setCurrency(userCurrency);        // Load wallets from Firebase with real-time listener
        const walletsQuery = query(
          collection(db, 'users', user.uid, 'wallets'),
          orderBy('createdAt', 'asc')
        );
        const unsubscribeWallets = onSnapshot(walletsQuery, (snapshot) => {
          const walletsList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setWallets(walletsList);
          
          // Set active wallet to default or first wallet
          if (walletsList.length > 0) {
            const defaultWallet = walletsList.find(w => w.isDefault);
            setActiveWallet(defaultWallet || walletsList[0]);
          } else {
            setActiveWallet(null);
          }
        });

        const transactionsQuery = query(
          collection(db, 'users', user.uid, 'transactions'),
          orderBy('date', 'desc')
        );
        const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
          const transactionsList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTransactions(transactionsList);
        });

        const categoriesQuery = query(
          collection(db, 'users', user.uid, 'categories'),
          orderBy('name', 'asc')
        );
        const unsubscribeCategories = onSnapshot(categoriesQuery, (snapshot) => {
          const categoriesList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setCategories(categoriesList);
        });        return () => {
          unsubscribeTransactions();
          unsubscribeCategories();
          unsubscribeWallets();
        };
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [auth, router]);
  // Filter transactions based on selected date range and active wallet
  useEffect(() => {
    if (transactions.length > 0) {
      let filtered = transactions;
      
      // Filter by date range
      if (startDate || endDate) {
        filtered = filtered.filter(transaction => {
          const transactionDate = new Date(transaction.date.seconds * 1000);
          
          if (startDate && endDate) {
            return transactionDate >= startDate && transactionDate <= endDate;
          } else if (startDate) {
            return transactionDate >= startDate;
          } else if (endDate) {
            return transactionDate <= endDate;
          }
          
          return true;
        });
      }
      
      // Filter by active wallet
      if (activeWallet) {
        filtered = filtered.filter(transaction => {
          return transaction.walletId === activeWallet.id;
        });
      }
      
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions([]);
    }
  }, [transactions, startDate, endDate, activeWallet]);
  // Calculate current balance from filtered transactions
  const getCurrentBalance = () => {
    if (activeWallet) {
      // If we have an active wallet, use the wallet's current balance
      // since the wallet balance is already maintained correctly by Firebase operations
      return activeWallet.balance || 0;
    } else {
      // Fallback to global balance if no active wallet
      return balance;
    }
  };

  // Handle date range changes from the DateRangeFilter component
  const handleDateRangeChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

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

  const handleCurrencyChange = async (newCurrency) => {
    setCurrency(newCurrency);
    if (userId) {
      await updateUserCurrency(userId, newCurrency);
    }
  };  const handleAddTransaction = async () => {
    const value = parseFloat(amount);
    if (isNaN(value) || !userId || !category) return;
    
    try {
      // Prepare enhanced description with transaction details
      let enhancedDescription = description;
      
      if (transactionDetails && transactionDetails.subcategories.length > 0) {
        const breakdown = transactionDetails.subcategories
          .map(sub => `• ${sub.name}: ${formatCurrency(sub.amount || 0, currency)}${sub.quantity > 1 ? ` (${sub.quantity}x)` : ''}${sub.notes ? ` - ${sub.notes}` : ''}`)
          .join('\n');
        enhancedDescription = `${description}\n\nBreakdown:\n${breakdown}`;
        
        if (transactionDetails.notes) {
          enhancedDescription += `\n\nNotes: ${transactionDetails.notes}`;
        }
      }
      
      if (editTransactionId) {
        await updateTransaction(userId, editTransactionId, value, transactionType, category, enhancedDescription);
        setEditTransactionId(null);
      } else {
        const updatedBalance = await addTransaction(userId, value, transactionType, category, enhancedDescription);
        setBalance(updatedBalance);
      }
      closeModal();
    } catch (error) {
      console.error('Failed to add or update transaction:', error);
    }
  };

  // New function for handling enhanced transaction modal submission
  const handleEnhancedTransactionSubmit = async (transactionData) => {
    if (!userId) return;
    
    try {
      let enhancedDescription = transactionData.description;
      
      // Add detailed breakdown if available
      if (transactionData.details && transactionData.details.subcategories.length > 0) {
        const breakdown = transactionData.details.subcategories
          .map(sub => `• ${sub.name}: ${formatCurrency(sub.amount || 0, currency)}${sub.quantity > 1 ? ` (${sub.quantity}x)` : ''}${sub.notes ? ` - ${sub.notes}` : ''}`)
          .join('\n');
        enhancedDescription = `${transactionData.description}\n\nBreakdown:\n${breakdown}`;
        
        if (transactionData.details.notes) {
          enhancedDescription += `\n\nNotes: ${transactionData.details.notes}`;
        }
      }
        if (editTransactionId) {
        await updateTransaction(
          userId, 
          editTransactionId, 
          transactionData.amount, 
          transactionData.type, 
          transactionData.category, 
          enhancedDescription,
          transactionData.walletId,
          transactionData.details
        );
        setEditTransactionId(null);
      } else {
        const updatedBalance = await addTransaction(
          userId, 
          transactionData.amount, 
          transactionData.type, 
          transactionData.category, 
          enhancedDescription,
          transactionData.walletId,
          transactionData.details
        );
        setBalance(updatedBalance);
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to add or update transaction:', error);
    }
  };
  const handleEditTransaction = (transaction) => {
    setAmount(transaction.amount);
    setTransactionType(transaction.type);
    setCategory(transaction.category);
    setDescription(transaction.description);
    setIsModalOpen(true);
    setEditTransactionId(transaction.id);
    
    // Parse transaction details if available
    if (transaction.description && transaction.description.includes('Breakdown:')) {
      // Try to extract breakdown details from description
      const parts = transaction.description.split('\n\nBreakdown:\n');
      if (parts.length > 1) {
        setDescription(parts[0]);
        // Could implement more sophisticated parsing here if needed
      }
    }
  };const handleDeleteTransaction = async (transaction) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Are you sure you want to delete this ${transaction.type === 'incoming' ? 'income' : 'expense'} transaction of ${formatCurrency(transaction.amount, currency)}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280'
    });
    
    if (!result.isConfirmed) return;
    
    try {
      const updatedBalance = await deleteTransaction(userId, transaction.id, transaction.amount, transaction.type, transaction.walletId);
      setBalance(updatedBalance);
      
      Swal.fire({
        icon: 'success',
        title: 'Deleted',
        text: 'Transaction has been deleted successfully.',
        confirmButtonColor: '#3B82F6',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete transaction. Please try again.',
        confirmButtonColor: '#3B82F6'
      });
    }
  };  const closeModal = () => {
    setIsModalOpen(false);
    setAmount('');
    setCategory('');
    setDescription('');
    setTransactionType('incoming');
    setEditTransactionId(null);
    setShowCalculator(false);
    setTransactionDetails(null);
  };
  const handleAddCategoryFromSelector = async (newCategory) => {
    if (!userId) return;

    try {
      await addDoc(collection(db, 'users', userId, 'categories'), {
        name: newCategory.name,
        type: newCategory.type,
      });
    } catch (error) {
      console.error('Failed to add category:', error);
      notify('Failed to add category', 'error');
    }
  };
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // New handlers for enhanced features
  const handleWalletChange = (wallet) => {
    setActiveWallet(wallet);
    // Update transactions to filter by wallet if needed
  };

  const handleToggleTravelMode = () => {
    setIsTravelMode(!isTravelMode);
    if (!isTravelMode) {
      setIsTravelModeOpen(true);
    }
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };
  const handleOpenWalletManager = () => {
    setIsWalletManagerOpen(true);
  };

  const handleOpenCategoryManager = () => {
    setIsCategoryManagerOpen(true);
  };
  const handleCategoryUpdate = async () => {
    // This will trigger a re-fetch of categories through the existing listener
    // The categories state will automatically update via the onSnapshot listener
  };
  return (
    <>
      {!isHydrated ? (
        <div className="relative flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300 pb-20">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">Loading Finance Tracker...</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300 pb-20">
          {/* Enhanced Header */}      <EnhancedHeader
        activeWallet={activeWallet}
        wallets={wallets}
        onWalletChange={handleWalletChange}
        isTravelMode={isTravelMode}
        onToggleTravelMode={handleToggleTravelMode}
        onOpenSettings={handleOpenSettings}
        onOpenWalletManager={handleOpenWalletManager}
        onOpenCategoryManager={handleOpenCategoryManager}
      />

      {/* Main Content based on active tab */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <div className="flex flex-col items-center p-4 md:p-6 max-w-4xl mx-auto w-full">
            {/* Balance Card */}            <div className="w-full bg-card rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="p-6 text-center">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {activeWallet ? `${activeWallet.name} Balance` : 'Current Balance'} ({currency})
                </p>
                <p className={`text-4xl font-bold mb-4 ${getCurrentBalance() >= 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  {formatCurrency(getCurrentBalance(), currency)}
                </p>
                <div className="flex gap-2 justify-center">
                  <CurrencySelector 
                    value={currency} 
                    onChange={handleCurrencyChange}
                    className="w-32"
                  />
                </div>
              </div>
            </div>
              {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 w-full">
              <SummaryCard 
                title="Income" 
                amount={filteredTransactions
                  .filter(t => t.type === 'incoming')
                  .reduce((acc, t) => acc + t.amount, 0)}
                currency={currency}
                type="income"
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 7-10 10"/><path d="M7 7h10v10"/></svg>}
              />
              <SummaryCard 
                title="Expenses" 
                amount={filteredTransactions
                  .filter(t => t.type === 'outgoing')
                  .reduce((acc, t) => acc + t.amount, 0)}
                currency={currency}
                type="expense"
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 17 10-10"/><path d="M17 17V7H7"/></svg>}
              />
              <SummaryCard 
                title="Balance" 
                amount={filteredTransactions
                  .reduce((acc, t) => t.type === 'incoming' ? acc + t.amount : acc - t.amount, 0)}
                currency={currency}
                type="balance"
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>}
              />
            </div>

            {/* Transaction Charts */}
            <div className="w-full mb-6">
              <TransactionCharts 
                transactions={filteredTransactions} 
                currency={currency} 
                startDate={startDate}
                endDate={endDate}
              />
            </div>

            {/* Recent Transactions Preview */}
            <div className="w-full bg-card rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Recent Transactions</h3>
                  <DateRangeFilter onFilterChange={handleDateRangeChange} />
                </div>
                  <div className="space-y-3">
                  {filteredTransactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {/* Transaction type icon */}
                          <div className={`p-2 rounded-full ${transaction.type === 'incoming' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                            {transaction.type === 'incoming' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                <path d="m6 9 6-6 6 6"></path>
                                <path d="M12 3v18"></path>
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                                <path d="m6 15 6 6 6-6"></path>
                                <path d="M12 3v18"></path>
                              </svg>
                            )}
                          </div>
                          {/* Category icon */}
                          {transaction.category && (
                            <div 
                              className="p-1.5 rounded-full text-sm"
                              style={{ backgroundColor: `${getCategoryColor(transaction.category)}20` }}
                              title={transaction.category}
                            >
                              {getCategoryIcon(transaction.category)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{transaction.description || 'No description'}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">{transaction.category}</p>
                            {transaction.category && (
                              <span 
                                className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                                style={{ backgroundColor: getCategoryColor(transaction.category) }}
                              >
                                {getCategoryIcon(transaction.category)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${transaction.type === 'incoming' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {transaction.type === 'incoming' ? '+' : '-'}{formatCurrency(transaction.amount, currency)}
                        </p>
                        <p className="text-xs text-muted-foreground">{new Date(transaction.date.seconds * 1000).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                  
                  {filteredTransactions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No transactions yet</p>
                      <p className="text-sm">Add your first transaction to get started</p>
                    </div>
                  )}
                </div>
                
                {filteredTransactions.length > 5 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setActiveTab('transactions')}
                      className="text-primary hover:underline text-sm"
                    >
                      View all {filteredTransactions.length} transactions
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}        {activeTab === 'transactions' && (
          <TransactionsPage
            transactions={filteredTransactions}
            currency={currency}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            categories={categories}
            startDate={startDate}
            endDate={endDate}
            onDateFilterChange={handleDateRangeChange}
          />
        )}        {activeTab === 'budget' && (
          <div className="p-4">
            <BudgetManager
              isOpen={true}
              onClose={() => setActiveTab('home')}
              currency={currency}
              transactions={filteredTransactions}
              categories={categories}
            />
          </div>
        )}

        {activeTab === 'account' && (
          <AccountPage
            currency={currency}
            onCurrencyChange={handleCurrencyChange}
            transactions={filteredTransactions}
          />
        )}
      </main>      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddTransaction={() => setIsModalOpen(true)}
      />      {/* Wallet Manager Modal */}
      {isWalletManagerOpen && (
        <WalletManager
          isOpen={isWalletManagerOpen}
          onClose={() => setIsWalletManagerOpen(false)}
          currency={currency}
          transactions={filteredTransactions}
          onWalletChange={handleWalletChange}
        />
      )}

      {/* Category Manager Modal */}
      {isCategoryManagerOpen && (
        <CategoryManager
          isOpen={isCategoryManagerOpen}
          onClose={() => setIsCategoryManagerOpen(false)}
          categories={categories}
          onCategoryUpdate={handleCategoryUpdate}
        />
      )}

      {/* Travel Mode Modal */}
      {isTravelModeOpen && (
        <TravelMode
          isOpen={isTravelModeOpen}
          onClose={() => setIsTravelModeOpen(false)}
          currency={currency}
          onAddExpense={(expense) => {
            // Add travel expense as transaction
            setAmount(expense.amount.toString());
            setDescription(expense.description);
            setCategory('Travel');
            setTransactionType('outgoing');
            setIsModalOpen(true);
          }}        />
      )}      {/* Enhanced Transaction Modal */}
      {isModalOpen && (
        <EnhancedTransactionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditTransactionId(null);
            setAmount('');
            setCategory('');
            setDescription('');
            setTransactionType('incoming');
            setTransactionDetails({
              subcategories: [],
              totalAmount: 0,
              notes: ''
            });
          }}
          onSubmit={handleEnhancedTransactionSubmit}
          currency={currency}
          categories={categories}
          onAddCategory={handleAddCategoryFromSelector}
          editTransaction={editTransactionId ? {
            id: editTransactionId,
            type: transactionType,
            amount: parseFloat(amount) || 0,
            category: category,
            description: description,
            details: transactionDetails
          } : null}
          isEditing={!!editTransactionId}
          wallets={wallets}
          activeWallet={activeWallet}        />
      )}
        </div>
      )}
    </>
  );
}
