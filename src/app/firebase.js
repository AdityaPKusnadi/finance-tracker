import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, addDoc, collection } from 'firebase/firestore';

const firebaseConfig = {
    
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

export const updateTransaction = async (userId, transactionId, amount, type, category) => {
  const transactionDocRef = doc(db, 'users', userId, 'transactions', transactionId);
  await updateDoc(transactionDocRef, {
      amount,
      type,
      category,
      date: new Date()
  });
};

export const deleteTransaction = async (userId, transactionId, amount, type) => {
  const transactionDocRef = doc(db, 'users', userId, 'transactions', transactionId);
  await deleteDoc(transactionDocRef);

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
  
  // Add a transaction to Firestore
  export const addTransaction = async (userId, amount, type, category, description) => {
    const userDocRef = doc(db, 'users', userId);
    const balanceDoc = await getDoc(userDocRef);
  
    if (balanceDoc.exists()) {
      let currentBalance = balanceDoc.data().balance;
      if (type === 'incoming') {
        currentBalance += amount;
      } else {
        currentBalance -= amount;
      }
  
      // Update balance in Firestore
      await updateDoc(userDocRef, { balance: currentBalance });
  
      // Prepare transaction data
      const transactionData = {
        amount: amount,
        type: type,
        category: category,
        date: new Date(),
      };
  
      // Add description if it exists
      if (description) {
        transactionData.description = description;
      }
  
      // Add the transaction to the user's transactions collection
      const transactionsCollectionRef = collection(db, 'users', userId, 'transactions');
      await addDoc(transactionsCollectionRef, transactionData);
  
      return currentBalance;
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

export const signInWithGoogle = () => {
  signInWithPopup(auth, googleProvider);
};

export { auth, db };