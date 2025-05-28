'use client';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getUserBalance, addTransaction, updateTransaction, deleteTransaction, updateUserCurrency, getUserCurrency } from '../firebase';
import { useRouter } from 'next/navigation';
import { collection, query, onSnapshot, orderBy, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeftOnRectangleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import ThemeToggle from '@/components/ThemeToggle';

export default function Dashboard() {
  const [balance, setBalance] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState('incoming');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editedCategoryName, setEditedCategoryName] = useState('');
  const [editTransactionId, setEditTransactionId] = useState(null);
  const [currency, setCurrency] = useState('USD');

  const auth = getAuth();
  const router = useRouter();

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

  const handleCurrencyChange = async (newCurrency) => {
    setCurrency(newCurrency);
    if (userId) {
      await updateUserCurrency(userId, newCurrency);
    }
  };

  const handleAddTransaction = async () => {
    const value = parseFloat(amount);
    if (isNaN(value) || !userId || !category) return;
  
    try {
      if (editTransactionId) {
        await updateTransaction(userId, editTransactionId, value, transactionType, category, description);
        setEditTransactionId(null);
      } else {
        const updatedBalance = await addTransaction(userId, value, transactionType, category, description);
        setBalance(updatedBalance);
      }
      closeModal();
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
  };

  const handleDeleteTransaction = async (transaction) => {
    try {
      const updatedBalance = await deleteTransaction(userId, transaction.id, transaction.amount, transaction.type);
      setBalance(updatedBalance);
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setAmount('');
    setCategory('');
    setDescription('');
    setTransactionType('incoming');
    setEditTransactionId(null);
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

  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header with Theme Toggle */}
      <header className="sticky top-0 z-30 w-full border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setIsSidebarVisible(!isSidebarVisible)}
          className="p-2 rounded-full hover:bg-muted text-foreground focus:outline-none"
          aria-label="Menu"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold">Finance Tracker</h1>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center p-4 md:p-6 max-w-4xl mx-auto w-full">
        {/* Balance Card */}
        <div className="w-full bg-card rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="p-6 text-center">
            <p className="text-sm font-medium text-muted-foreground mb-1">Current Balance ({currency})</p>
            <p className={`text-4xl font-bold mb-4 ${balance >= 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
              {balance.toLocaleString(undefined, { style: 'currency', currency })}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {editTransactionId ? 'Update Transaction' : 'Add Transaction'}
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <div className="w-full bg-card rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Transaction History</h3>
            <div className="max-h-[400px] overflow-y-auto pr-2 -mr-2">
              <ul className="space-y-3">
                {transactions.map((transaction) => (
                  <li key={transaction.id} 
                      className={`p-4 rounded-lg ${
                        transaction.type === 'incoming' 
                          ? 'bg-green-100/30 dark:bg-green-900/20 border-l-4 border-green-500' 
                          : 'bg-red-100/30 dark:bg-red-900/20 border-l-4 border-red-500'
                      } transition-all`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{transaction.type === 'incoming' ? 'Incoming' : 'Outgoing'}</p>
                        <p className={`text-lg font-bold ${transaction.type === 'incoming' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {transaction.amount.toLocaleString(undefined, { style: 'currency', currency })}
                        </p>
                        <p className="text-muted-foreground text-sm mt-1">{new Date(transaction.date.seconds * 1000).toLocaleString()}</p>
                        <div className="mt-1">
                          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-secondary/50 rounded-full mr-2">
                            {transaction.category}
                          </span>
                        </div>
                        {transaction.description && (
                          <p className="text-sm mt-2 text-muted-foreground">{transaction.description}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditTransaction(transaction)}
                          className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Edit transaction"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"></path>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(transaction)}
                          className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-red-500 transition-colors"
                          aria-label="Delete transaction"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              
              {transactions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No transactions yet</p>
                  <p className="text-sm">Add a transaction to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-6 flex items-center text-muted-foreground hover:text-red-500 transition-colors focus:outline-none"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
          Logout
        </button>
      </main>

      {/* Sidebar */}
      {isSidebarVisible && (
        <div className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border p-5 shadow-xl z-50 animate-slide-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Settings</h2>
            <button
              onClick={() => setIsSidebarVisible(false)}
              className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground focus:outline-none"
              aria-label="Close sidebar"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          {/* Currency Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Select Currency
            </label>
            <select
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="w-full p-2.5 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="IDR">IDR - Indonesian Rupiah</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CNY">CNY - Chinese Yuan</option>
              <option value="AUD">AUD - Australian Dollar</option>
            </select>
          </div>

          <div className="space-y-4 mt-8">
            <p className="text-sm font-medium text-muted-foreground mb-2">Categories</p>
            <button
              onClick={() => {
                setTransactionType('incoming');
                setIsCategoryModalOpen(true);
                setIsSidebarVisible(false);
              }}
              className="flex items-center justify-between w-full p-3 rounded-lg bg-green-100/50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 transition-colors"
            >
              <span className="font-medium">Manage Income Categories</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
            </button>
            <button
              onClick={() => {
                setTransactionType('outgoing');
                setIsCategoryModalOpen(true);
                setIsSidebarVisible(false);
              }}
              className="flex items-center justify-between w-full p-3 rounded-lg bg-red-100/50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 transition-colors"
            >
              <span className="font-medium">Manage Expense Categories</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {(isModalOpen || isCategoryModalOpen) && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => {
            if (isModalOpen) closeModal();
            if (isCategoryModalOpen) setIsCategoryModalOpen(false);
          }}
        ></div>
      )}

      {/* Add/Edit Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={e => e.stopPropagation()}>
          <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-5">{editTransactionId ? 'Edit Transaction' : 'New Transaction'}</h3>
            
            {/* Transaction Type */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Transaction Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTransactionType('incoming')}
                  className={`flex items-center justify-center p-3 rounded-lg border transition-colors ${
                    transactionType === 'incoming' 
                      ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300' 
                      : 'border-border hover:bg-secondary/50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="m6 9 6-6 6 6"></path>
                    <path d="M12 3v18"></path>
                  </svg>
                  Income
                </button>
                <button
                  type="button"
                  onClick={() => setTransactionType('outgoing')}
                  className={`flex items-center justify-center p-3 rounded-lg border transition-colors ${
                    transactionType === 'outgoing' 
                      ? 'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-300' 
                      : 'border-border hover:bg-secondary/50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="m6 15 6 6 6-6"></path>
                    <path d="M12 3v18"></path>
                  </svg>
                  Expense
                </button>
              </div>
            </div>
            
            {/* Amount */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-muted-foreground mb-2" htmlFor="amount">
                Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency}
                </div>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2.5 pl-10 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>
            
            {/* Category */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-muted-foreground mb-2" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select Category</option>
                {categories
                  .filter((cat) => cat.type === transactionType)
                  .map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
              </select>
              <div className="mt-1 text-right">
                <button 
                  type="button"
                  onClick={() => {
                    setIsCategoryModalOpen(true);
                    setIsModalOpen(false);
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Manage Categories
                </button>
              </div>
            </div>
            
            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2" htmlFor="description">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Add notes about this transaction"
                rows="2"
              />
            </div>
            
            {/* Actions */}
            <div className="flex justify-between space-x-3 mt-6">
              <button
                type="button"
                onClick={closeModal}
                className="w-full py-2.5 rounded-md border border-border hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddTransaction}
                className="w-full py-2.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
              >
                {editTransactionId ? 'Update' : 'Add Transaction'}
              </button>
            </div>
          </div>
        </div>
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
