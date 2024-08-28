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
  export const addTransaction = async (userId, amount, type) => {
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
  
      // Add the transaction to the user's transactions collection
      const transactionsCollectionRef = collection(db, 'users', userId, 'transactions');
      await addDoc(transactionsCollectionRef, {
        amount: amount,
        type: type,
        date: new Date(),
      });
  
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