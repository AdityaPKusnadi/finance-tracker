'use client';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getUserBalance, addTransaction, updateTransaction, deleteTransaction,updateUserCurrency,getUserCurrency } from '../firebase';
import { useRouter } from 'next/navigation';
import { collection, query, onSnapshot, orderBy, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeftOnRectangleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';

export default function Dashboard() {
  const [balance, setBalance] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState('incoming');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState(''); // New field for description
  const [userId, setUserId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editedCategoryName, setEditedCategoryName] = useState('');
  const [editTransactionId, setEditTransactionId] = useState(null);
  const [currency, setCurrency] = useState('USD'); // Default to USD

  const auth = getAuth();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const userBalance = await getUserBalance(user.uid);
        setBalance(userBalance);

        const userCurrency = await getUserCurrency(user.uid); // Get default currency
        setCurrency(userCurrency);

        // Listen for real-time updates to the user's transactions
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

        // Listen for real-time updates to the user's categories
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
        router.push('/login'); // Redirect to login if not authenticated
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  const handleCurrencyChange = async (newCurrency) => {
    setCurrency(newCurrency);
    if (userId) {
      await updateUserCurrency(userId, newCurrency); // Save the selected currency
    }
  };

  const handleAddTransaction = async () => {
    const value = parseFloat(amount);
    if (isNaN(value) || !userId || !category) return;
  
    try {
      if (editTransactionId) {
        await updateTransaction(userId, editTransactionId, value, transactionType, category, description); // Sertakan description
        setEditTransactionId(null); // Reset after updating
      } else {
        const updatedBalance = await addTransaction(userId, value, transactionType, category, description); // Sertakan description
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
    setDescription(transaction.description); // Load description when editing
    setIsModalOpen(true);
    setEditTransactionId(transaction.id); // Store the transaction ID to know which one to update
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
    setDescription(''); // Reset description
    setTransactionType('incoming');
    setEditTransactionId(null);
  };

  const handleAddCategory = async () => {
    if (!editedCategoryName || !userId) return; // Pastikan kategori dan userId diisi
  
    try {
      await addDoc(collection(db, 'users', userId, 'categories'), {
        name: editedCategoryName,
        type: transactionType,
      });
      setEditedCategoryName(''); // Clear input setelah menambahkan kategori
      setIsCategoryModalOpen(false); // Tutup modal setelah penambahan kategori
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
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {/* Main Content */}
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center relative z-10">
        <button
          onClick={() => setIsSidebarVisible(!isSidebarVisible)}
          className="absolute top-4 left-4 text-gray-600 focus:outline-none"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Dashboard</h2>
        <p className="text-lg text-gray-600">Current Balance ({currency}):</p>
        <p className="text-5xl font-bold text-green-500 mb-6">
          {balance.toLocaleString(undefined, { style: 'currency', currency })}
        </p>


        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
        >
          {editTransactionId ? 'Update Transaction' : 'Add Transaction'}
        </button>

        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Transaction History</h3>
          <div className="max-h-64 overflow-y-auto">
            <ul className="text-left">
              {transactions.map((transaction) => (
                <li key={transaction.id} className={mb-4 p-4 rounded-lg shadow ${transaction.type === 'incoming' ? 'bg-green-100' : 'bg-red-100'}}>
                  <p className="text-lg font-bold">{transaction.type === 'incoming' ? 'Incoming' : 'Outgoing'}</p>
                  <p className="text-gray-800">${transaction.amount.toLocaleString()}</p>
                  <p className="text-gray-500 text-sm">{new Date(transaction.date.seconds * 1000).toLocaleString()}</p>
                  <p className="text-gray-500 text-sm">Category: {transaction.category}</p>
                  <p className="text-gray-500 text-sm">Description: {transaction.description}</p> {/* New field for description */}
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => handleEditTransaction(transaction)}
                      className="bg-blue-500 text-white py-1 px-3 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTransaction(transaction)}
                      className="bg-red-500 text-white py-1 px-3 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="w-full flex justify-center">
          <button
            onClick={handleLogout}
            className="mt-6 flex items-center justify-center text-red-600 hover:text-red-800 focus:outline-none"
          >
            <ArrowLeftOnRectangleIcon className="h-6 w-6 mr-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Sidebar */}
{isSidebarVisible && (
  <div className="absolute top-0 left-0 transform bg-white shadow-lg p-4 w-64 h-full z-50">
    <button
      onClick={() => setIsSidebarVisible(false)}
      className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 focus:outline-none"
    >
      <XMarkIcon className="h-6 w-6" />
    </button>
    <h2 className="text-2xl font-bold mb-4">Settings</h2>
    
    {/* Currency Selector */}
    <div className="mb-6">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Select Currency
      </label>
      <select
        value={currency}
        onChange={(e) => handleCurrencyChange(e.target.value)} // Save on change
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      >
        <option value="USD">USD - US Dollar</option>
        <option value="JPY">JPY - Japanese Yen</option>
        <option value="IDR">IDR - Indonesian Rupiah</option>
        {/* Tambahkan opsi mata uang lainnya di sini */}
      </select>
    </div>

    {/* Other sidebar options like Add Category */}
    <div className="space-y-4">
      <button
        onClick={() => {
          setTransactionType('incoming');
          setIsCategoryModalOpen(true);
          setIsSidebarVisible(false);
        }}
        className="w-full text-left bg-green-500 text-white py-2 px-4 rounded"
      >
        Add Incoming Category
      </button>
      <button
        onClick={() => {
          setTransactionType('outgoing');
          setIsCategoryModalOpen(true);
          setIsSidebarVisible(false);
        }}
        className="w-full text-left bg-red-500 text-white py-2 px-4 rounded"
      >
        Add Outgoing Category
      </button>
    </div>
  </div>
)}


      {/* Modal Add Transaction */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4 text-gray-800">{editTransactionId ? 'Update Transaction' : 'Add Transaction'}</h3>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Transaction Type
              </label>
              <div className="flex justify-between mb-4">
                <button
                  onClick={() => setTransactionType('incoming')}
                  className={py-2 px-4 rounded focus:outline-none focus:shadow-outline ${transactionType === 'incoming' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}}
                >
                  Incoming
                </button>
                <button
                  onClick={() => setTransactionType('outgoing')}
                  className={py-2 px-4 rounded focus:outline-none focus:shadow-outline ${transactionType === 'outgoing' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}}
                >
                  Outgoing
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
                Amount
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Description
              </label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => closeModal()}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTransaction}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {editTransactionId ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add/Edit Category */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Manage {transactionType === 'incoming' ? 'Incoming' : 'Outgoing'} Categories</h3>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                Category Name
              </label>
              <input
                type="text"
                id="category"
                value={editedCategoryName}
                onChange={(e) => setEditedCategoryName(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <button
              onClick={handleAddCategory}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Add Category
            </button>

            {/* Daftar Kategori */}
            <div className="mt-6">
              <h4 className="text-lg font-bold text-gray-800 mb-2">Existing Categories</h4>
              <ul>
                {categories
                  .filter((cat) => cat.type === transactionType)
                  .map((cat) => (
                    <li key={cat.id} className="flex justify-between items-center mb-2">
                      {editCategoryId === cat.id ? (
                        <input
                          type="text"
                          value={editedCategoryName}
                          onChange={(e) => setEditedCategoryName(e.target.value)}
                          onBlur={() => handleUpdateCategory(cat.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdateCategory(cat.id);
                          }}
                          className="text-gray-700 border-b border-gray-400 focus:border-blue-500 outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="text-gray-700" onClick={() => handleEditCategory(cat.id, cat.name)}>
                          {cat.name}
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-red-600 hover:text-red-800 focus:outline-none"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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