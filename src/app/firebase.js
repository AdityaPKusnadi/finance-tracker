import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, addDoc, collection, deleteDoc, query, orderBy, getDocs } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

export const getUserCurrency = async (userId) => {
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);
  if (userDoc.exists()) {
    return userDoc.data().currency || 'USD'; // Default to USD if not set
  } else {
    await setDoc(userDocRef, { currency: 'USD' }); // Initialize with default USD
    return 'USD';
  }
};

export const updateUserCurrency = async (userId, currency) => {
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, { currency });
};

export const updateTransaction = async (userId, transactionId, amount, type, category, description, walletId = null, details = null) => {
  const transactionDocRef = doc(db, 'users', userId, 'transactions', transactionId);
  
  // Get the old transaction data first
  const oldTransaction = await getDoc(transactionDocRef);
  const oldData = oldTransaction.data();
  
  // Revert old transaction from wallet/balance
  if (oldData.walletId) {
    const walletDocRef = doc(db, 'users', userId, 'wallets', oldData.walletId);
    const walletDoc = await getDoc(walletDocRef);
    if (walletDoc.exists()) {
      let walletBalance = walletDoc.data().balance || 0;
      // Revert old transaction
      if (oldData.type === 'incoming') {
        walletBalance -= oldData.amount;
      } else {
        walletBalance += oldData.amount;
      }
      await updateDoc(walletDocRef, { balance: walletBalance, updatedAt: new Date() });
    }
  } else {
    // Revert from global balance
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      let currentBalance = userDoc.data().balance;
      if (oldData.type === 'incoming') {
        currentBalance -= oldData.amount;
      } else {
        currentBalance += oldData.amount;
      }
      await updateDoc(userDocRef, { balance: currentBalance });
    }
  }

  // Apply new transaction to wallet/balance
  if (walletId) {
    const walletDocRef = doc(db, 'users', userId, 'wallets', walletId);
    const walletDoc = await getDoc(walletDocRef);
    if (walletDoc.exists()) {
      let walletBalance = walletDoc.data().balance || 0;
      if (type === 'incoming') {
        walletBalance += amount;
      } else {
        walletBalance -= amount;
      }
      await updateDoc(walletDocRef, { balance: walletBalance, updatedAt: new Date() });
    }
  } else {
    // Update global balance
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      let currentBalance = userDoc.data().balance;
      if (type === 'incoming') {
        currentBalance += amount;
      } else {
        currentBalance -= amount;
      }
      await updateDoc(userDocRef, { balance: currentBalance });
    }
  }

  const updateData = {
    amount,
    type,
    category,
    date: new Date(),
    walletId: walletId || null,
  };
  
  // Add description if provided, otherwise remove it
  if (description) {
    updateData.description = description;
  }

  // Add detailed breakdown if available
  if (details) {
    updateData.details = details;
  }
  
  await updateDoc(transactionDocRef, updateData);
};

export const deleteTransaction = async (userId, transactionId, amount, type, walletId = null) => {
  const transactionDocRef = doc(db, 'users', userId, 'transactions', transactionId);
  await deleteDoc(transactionDocRef);

  // Update wallet balance or global balance
  if (walletId) {
    const walletDocRef = doc(db, 'users', userId, 'wallets', walletId);
    const walletDoc = await getDoc(walletDocRef);
    if (walletDoc.exists()) {
      let walletBalance = walletDoc.data().balance || 0;
      // Revert the transaction
      if (type === 'incoming') {
        walletBalance -= amount;
      } else {
        walletBalance += amount;
      }
      await updateDoc(walletDocRef, { balance: walletBalance, updatedAt: new Date() });
    }
  } else {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
        let currentBalance = userDoc.data().balance;
        if (type === 'incoming') {
            currentBalance -= amount;
        } else {
            currentBalance += amount;
        }

        await updateDoc(userDocRef, { balance: currentBalance });
        return currentBalance;
    } else {
        throw new Error('User document does not exist');
    }
  }
};

// Get user balance or initialize it to 0
export const getUserBalance = async (userId) => {
    const balanceDocRef = doc(db, 'users', userId);
    const balanceDoc = await getDoc(balanceDocRef);
    if (balanceDoc.exists()) {
      return balanceDoc.data().balance;
    } else {
      await setDoc(balanceDocRef, { balance: 0 });
      return 0;
    }
  };
  
  // Add a transaction to Firestore with wallet support
  export const addTransaction = async (userId, amount, type, category, description, walletId = null, details = null) => {
    const userDocRef = doc(db, 'users', userId);
    const balanceDoc = await getDoc(userDocRef);
  
    if (balanceDoc.exists()) {
      let currentBalance = balanceDoc.data().balance;
      
      // If walletId is provided, update wallet balance instead of global balance
      if (walletId) {
        const walletDocRef = doc(db, 'users', userId, 'wallets', walletId);
        const walletDoc = await getDoc(walletDocRef);
        
        if (walletDoc.exists()) {
          let walletBalance = walletDoc.data().balance || 0;
          if (type === 'incoming') {
            walletBalance += amount;
          } else {
            walletBalance -= amount;
          }
          await updateDoc(walletDocRef, { balance: walletBalance, updatedAt: new Date() });
        }
      } else {
        // Update global balance if no wallet specified
        if (type === 'incoming') {
          currentBalance += amount;
        } else {
          currentBalance -= amount;
        }
        await updateDoc(userDocRef, { balance: currentBalance });
      }
  
      // Prepare transaction data
      const transactionData = {
        amount: amount,
        type: type,
        category: category,
        date: new Date(),
        walletId: walletId || null,
      };
  
      // Add description if it exists
      if (description) {
        transactionData.description = description;
      }

      // Add detailed breakdown if available
      if (details) {
        transactionData.details = details;
      }
  
      // Add the transaction to the user's transactions collection
      const transactionsCollectionRef = collection(db, 'users', userId, 'transactions');
      await addDoc(transactionsCollectionRef, transactionData);
  
      return walletId ? null : currentBalance; // Return null if wallet-specific, global balance otherwise
    } else {
      throw new Error('User document does not exist');
    }
  };
  
  

export const registerWithEmailAndPassword = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginWithEmailAndPassword = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Google sign-in was cancelled. Please try again.');
    }
    throw error;
  }
};

// User Settings Functions
export const getUserSettings = async (userId) => {
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);
  
  if (userDoc.exists()) {
    const data = userDoc.data();
    return {
      currency: data.currency || 'USD',
      theme: data.theme || 'light',
      travelMode: data.travelMode || false,
      language: data.language || 'en'
    };
  } else {
    // Initialize with default settings
    const defaultSettings = {
      currency: 'USD',
      theme: 'light',
      travelMode: false,
      language: 'en',
      balance: 0
    };
    await setDoc(userDocRef, defaultSettings);
    return defaultSettings;
  }
};

export const updateUserSettings = async (userId, settings) => {
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, settings);
};

// Wallet Functions
export const getUserWallets = async (userId) => {
  const walletsQuery = query(
    collection(db, 'users', userId, 'wallets'),
    orderBy('createdAt', 'asc')
  );
  const snapshot = await getDocs(walletsQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const addWallet = async (userId, walletData) => {
  const walletsCollection = collection(db, 'users', userId, 'wallets');
  const walletWithTimestamp = {
    ...walletData,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const docRef = await addDoc(walletsCollection, walletWithTimestamp);
  return { id: docRef.id, ...walletWithTimestamp };
};

export const updateWallet = async (userId, walletId, walletData) => {
  const walletDocRef = doc(db, 'users', userId, 'wallets', walletId);
  const updateData = {
    ...walletData,
    updatedAt: new Date()
  };
  await updateDoc(walletDocRef, updateData);
};

export const deleteWallet = async (userId, walletId) => {
  const walletDocRef = doc(db, 'users', userId, 'wallets', walletId);
  await deleteDoc(walletDocRef);
};

// Budget Functions
export const getUserBudgets = async (userId) => {
  const budgetsQuery = query(
    collection(db, 'users', userId, 'budgets'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(budgetsQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const addBudget = async (userId, budgetData) => {
  const budgetsCollection = collection(db, 'users', userId, 'budgets');
  const budgetWithTimestamp = {
    ...budgetData,
    amount: parseFloat(budgetData.amount),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const docRef = await addDoc(budgetsCollection, budgetWithTimestamp);
  return { id: docRef.id, ...budgetWithTimestamp };
};

export const updateBudget = async (userId, budgetId, budgetData) => {
  const budgetDocRef = doc(db, 'users', userId, 'budgets', budgetId);
  const updateData = {
    ...budgetData,
    amount: parseFloat(budgetData.amount),
    updatedAt: new Date()
  };
  await updateDoc(budgetDocRef, updateData);
};

export const deleteBudget = async (userId, budgetId) => {
  const budgetDocRef = doc(db, 'users', userId, 'budgets', budgetId);
  await deleteDoc(budgetDocRef);
};

// Enhanced Category Functions
export const addCategory = async (userId, categoryData) => {
  const categoriesCollection = collection(db, 'users', userId, 'categories');
  const categoryWithTimestamp = {
    ...categoryData,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const docRef = await addDoc(categoriesCollection, categoryWithTimestamp);
  return { id: docRef.id, ...categoryWithTimestamp };
};

export const updateCategory = async (userId, categoryId, categoryData) => {
  const categoryDocRef = doc(db, 'users', userId, 'categories', categoryId);
  const updateData = {
    ...categoryData,
    updatedAt: new Date()
  };
  await updateDoc(categoryDocRef, updateData);
};

export const deleteCategory = async (userId, categoryId) => {
  const categoryDocRef = doc(db, 'users', userId, 'categories', categoryId);
  await deleteDoc(categoryDocRef);
};

export { auth, db };