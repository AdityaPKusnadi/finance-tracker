'use client';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getUserBalance, addTransaction, updateTransaction, deleteTransaction, updateUserCurrency, getUserCurrency } from '../firebase';
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
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editedCategoryName, setEditedCategoryName] = useState('');  const [editTransactionId, setEditTransactionId] = useState(null);
  const [currency, setCurrency] = useState('USD');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  
  // New state for enhanced features
  const [wallets, setWallets] = useState([]);
  const [activeWallet, setActiveWallet] = useState(null);
  const [isTravelMode, setIsTravelMode] = useState(false);
  const [isWalletManagerOpen, setIsWalletManagerOpen] = useState(false);
  const [isTravelModeOpen, setIsTravelModeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const userBalance = await getUserBalance(user.uid);
        setBalance(userBalance);

        const userCurrency = await getUserCurrency(user.uid);
        setCurrency(userCurrency);

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
        });

        return () => {
          unsubscribeTransactions();
          unsubscribeCategories();
        };
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  // Filter transactions based on selected date range
  useEffect(() => {
    if (transactions.length > 0) {
      if (!startDate && !endDate) {
        setFilteredTransactions(transactions);
      } else {
        const filtered = transactions.filter(transaction => {
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
        setFilteredTransactions(filtered);
      }
    } else {
      setFilteredTransactions([]);
    }
  }, [transactions, startDate, endDate]);

  // Handle date range changes from the DateRangeFilter component
  const handleDateRangeChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
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
        await updateTransaction(userId, editTransactionId, transactionData.amount, transactionData.type, transactionData.category, enhancedDescription);
        setEditTransactionId(null);
      } else {
        const updatedBalance = await addTransaction(userId, transactionData.amount, transactionData.type, transactionData.category, enhancedDescription);
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
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this ${transaction.type === 'incoming' ? 'income' : 'expense'} transaction of ${formatCurrency(transaction.amount, currency)}?`
    );
    
    if (!confirmDelete) return;
    
    try {
      const updatedBalance = await deleteTransaction(userId, transaction.id, transaction.amount, transaction.type);
      setBalance(updatedBalance);    } catch (error) {
      console.error('Failed to delete transaction:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete transaction. Please try again.',
        confirmButtonColor: '#3B82F6'
      });
    }
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setAmount('');
    setCategory('');
    setDescription('');
    setTransactionType('incoming');
    setEditTransactionId(null);
    setShowCalculator(false);
    setTransactionDetails(null);
  };

  const handleAddCategory = async () => {
    if (!editedCategoryName || !userId) return;
  
    try {
      await addDoc(collection(db, 'users', userId, 'categories'), {
        name: editedCategoryName,
        type: transactionType,
      });
      setEditedCategoryName('');
      setIsCategoryModalOpen(false);
    } catch (error) {
      console.error('Failed to add category:', error);
    }
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

  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteDoc(doc(db, 'users', userId, 'categories', categoryId));
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const handleEditCategory = (categoryId, currentName) => {
    setEditCategoryId(categoryId);
    setEditedCategoryName(currentName);
  };

  const handleUpdateCategory = async (categoryId) => {
    try {
      await updateDoc(doc(db, 'users', userId, 'categories', categoryId), {
        name: editedCategoryName,
      });
      setEditCategoryId(null);
      setEditedCategoryName('');
    } catch (error) {
      console.error('Failed to update category:', error);
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

  // Initialize wallets on component mount
  useEffect(() => {
    const savedWallets = localStorage.getItem('wallets');
    if (savedWallets) {
      const walletsData = JSON.parse(savedWallets);
      setWallets(walletsData);
      setActiveWallet(walletsData.find(w => w.isDefault) || walletsData[0]);
    } else {
      const defaultWallet = {
        id: 'default',
        name: 'Main Wallet',
        type: 'cash',
        balance: 0,
        currency: currency,
        color: '#3B82F6',
        isDefault: true
      };
      setWallets([defaultWallet]);
      setActiveWallet(defaultWallet);
    }
  }, [currency]);

  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300 pb-20">
      {/* Enhanced Header */}
      <EnhancedHeader
        activeWallet={activeWallet}
        wallets={wallets}
        onWalletChange={handleWalletChange}
        isTravelMode={isTravelMode}
        onToggleTravelMode={handleToggleTravelMode}
        onOpenSettings={handleOpenSettings}
        onOpenWalletManager={handleOpenWalletManager}
      />

      {/* Main Content based on active tab */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <div className="flex flex-col items-center p-4 md:p-6 max-w-4xl mx-auto w-full">
            {/* Balance Card */}
            <div className="w-full bg-card rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="p-6 text-center">
                <p className="text-sm font-medium text-muted-foreground mb-1">Current Balance ({currency})</p>
                <p className={`text-4xl font-bold mb-4 ${balance >= 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  {formatCurrency(balance, currency)}
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
                bgClass="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                textClass="text-white"
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 7-10 10"/><path d="M7 7h10v10"/></svg>}
              />
              <SummaryCard 
                title="Expenses" 
                amount={filteredTransactions
                  .filter(t => t.type === 'outgoing')
                  .reduce((acc, t) => acc + t.amount, 0)}
                currency={currency}
                bgClass="bg-gradient-to-r from-red-500 to-rose-600 text-white"
                textClass="text-white"
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 17 10-10"/><path d="M17 17V7H7"/></svg>}
              />
              <SummaryCard 
                title="Balance" 
                amount={filteredTransactions
                  .reduce((acc, t) => t.type === 'incoming' ? acc + t.amount : acc - t.amount, 0)}
                currency={currency}
                bgClass="bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                textClass="text-white"
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
                        <div>
                          <p className="font-medium text-sm">{transaction.description || 'No description'}</p>
                          <p className="text-xs text-muted-foreground">{transaction.category}</p>
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
        )}

        {activeTab === 'budget' && (
          <div className="p-4">
            <BudgetManager
              isOpen={true}
              onClose={() => setActiveTab('home')}
              currency={currency}
              transactions={filteredTransactions}
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
      />

      {/* Wallet Manager Modal */}
      {isWalletManagerOpen && (
        <WalletManager
          isOpen={isWalletManagerOpen}
          onClose={() => setIsWalletManagerOpen(false)}
          currency={currency}
          transactions={filteredTransactions}
          onWalletChange={handleWalletChange}
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
          }}
        />
      )}      {/* Modal Backdrop for Category Modal */}
      {isCategoryModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsCategoryModalOpen(false)}
        ></div>
      )}{/* Enhanced Transaction Modal */}
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
          }}          onSubmit={handleEnhancedTransactionSubmit}
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
        />
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={e => e.stopPropagation()}>
          <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-5">
              {transactionType === 'incoming' ? 'Income' : 'Expense'} Categories
            </h3>
            
            {/* Add New Category */}
            <div className="flex items-center space-x-2 mb-6">
              <input
                type="text"
                value={editedCategoryName}
                onChange={(e) => setEditedCategoryName(e.target.value)}
                className="flex-1 p-2.5 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="New category name"
              />
              <button
                onClick={handleAddCategory}
                disabled={!editedCategoryName}
                className="p-2.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors disabled:opacity-50"
              >
                Add
              </button>
            </div>
            
            {/* Categories List */}
            <div className="max-h-[300px] overflow-y-auto pr-2 -mr-2">
              <ul className="space-y-2">
                {categories
                  .filter((cat) => cat.type === transactionType)
                  .map((cat) => (
                    <li key={cat.id} className="flex items-center justify-between p-3 rounded-md hover:bg-secondary/50 group">
                      {editCategoryId === cat.id ? (
                        <input
                          type="text"
                          value={editedCategoryName}
                          onChange={(e) => setEditedCategoryName(e.target.value)}
                          onBlur={() => handleUpdateCategory(cat.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdateCategory(cat.id);
                          }}
                          className="flex-1 p-1.5 rounded border border-primary bg-background text-foreground focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span 
                          className="flex-1 cursor-pointer" 
                          onClick={() => handleEditCategory(cat.id, cat.name)}
                        >
                          {cat.name}
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 hover:bg-red-100/30 dark:hover:bg-red-900/30 transition-all"
                        aria-label="Delete category"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </button>
                    </li>
                  ))}
              </ul>
              
              {categories.filter((cat) => cat.type === transactionType).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No categories yet</p>
                  <p className="text-sm">Add a category to get started</p>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="mt-6">
              <button
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setEditCategoryId(null);
                  setEditedCategoryName('');
                }}
                className="w-full py-2.5 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
