'use client';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getUserBalance, addTransaction } from '../firebase';
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
  const [userId, setUserId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editedCategoryName, setEditedCategoryName] = useState('');

  const auth = getAuth();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const userBalance = await getUserBalance(user.uid);
        setBalance(userBalance);

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

  const handleAddTransaction = async () => {
    const value = parseFloat(amount);
    if (isNaN(value) || !userId || !category) return;

    try {
      const updatedBalance = await addTransaction(userId, value, transactionType, category);
      setBalance(updatedBalance);
      // Reset form and close modal
      setAmount('');
      setTransactionType('incoming');
      setCategory('');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to add transaction:', error);
    }
  };

  const handleAddCategory = async () => {
    if (!category || !userId) return;

    try {
      await addDoc(collection(db, 'users', userId, 'categories'), {
        name: category,
        type: transactionType,
      });
      setCategory('');
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
        <p className="text-lg text-gray-600">Current Balance:</p>
        <p className="text-5xl font-bold text-green-500 mb-6">{balance.toLocaleString()} USD</p>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
        >
          Add Transaction
        </button>

        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Transaction History</h3>
          <div className="max-h-64 overflow-y-auto">
            <ul className="text-left">
              {transactions.map((transaction) => (
                <li key={transaction.id} className={`mb-4 p-4 rounded-lg shadow ${transaction.type === 'incoming' ? 'bg-green-100' : 'bg-red-100'}`}>
                  <p className="text-lg font-bold">{transaction.type === 'incoming' ? 'Incoming' : 'Outgoing'}</p>
                  <p className="text-gray-800">${transaction.amount.toLocaleString()}</p>
                  <p className="text-gray-500 text-sm">{new Date(transaction.date.seconds * 1000).toLocaleString()}</p>
                  <p className="text-gray-500 text-sm">Category: {transaction.category}</p> {/* Menampilkan Kategori */}
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
          <h2 className="text-2xl font-bold mb-4">Add Category</h2>
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
            <h3 className="text-xl font-bold mb-4 text-gray-800">Add Transaction</h3>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Transaction Type
              </label>
              <div className="flex justify-between mb-4">
                <button
                  onClick={() => setTransactionType('incoming')}
                  className={`py-2 px-4 rounded focus:outline-none focus:shadow-outline ${transactionType === 'incoming' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Incoming
                </button>
                <button
                  onClick={() => setTransactionType('outgoing')}
                  className={`py-2 px-4 rounded focus:outline-none focus:shadow-outline ${transactionType === 'outgoing' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
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
            <div className="flex justify-between">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTransaction}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Add
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
                value={category}
                onChange={(e) => setCategory(e.target.value)}
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
