'use client';

import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  BanknotesIcon, 
  WalletIcon, 
  CreditCardIcon,
  CheckIcon 
} from '@heroicons/react/24/outline';
import { formatCurrency } from '../utils/currency';
import { getUserWallets, addWallet, updateWallet, deleteWallet } from '../app/firebase';
import { getAuth } from 'firebase/auth';
import Swal from 'sweetalert2';

const WalletManager = ({ isOpen, onClose, currency, transactions = [], onWalletChange }) => {
  const [wallets, setWallets] = useState([]);
  const [isAddingWallet, setIsAddingWallet] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [walletForm, setWalletForm] = useState({
    name: '',
    type: 'cash',
    balance: '',
    color: '#3B82F6'
  });

  const walletTypes = [
    { id: 'cash', name: 'Cash', icon: BanknotesIcon },
    { id: 'bank', name: 'Bank Account', icon: WalletIcon },
    { id: 'credit', name: 'Credit Card', icon: CreditCardIcon },
    { id: 'savings', name: 'Savings', icon: WalletIcon },
  ];

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  // Get current user
  useEffect(() => {
    const auth = getAuth();
    if (auth.currentUser) {
      setUserId(auth.currentUser.uid);
    }
  }, []);

  // Load wallets from Firebase
  useEffect(() => {
    if (userId && isOpen) {
      loadWallets();
    }
  }, [userId, isOpen]);

  const loadWallets = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const walletsData = await getUserWallets(userId);
      
      // If no wallets exist, create a default one
      if (walletsData.length === 0) {
        const defaultWallet = {
          name: 'Main Wallet',
          type: 'cash',
          balance: 0,
          color: '#3B82F6',
          isDefault: true
        };
        const newWallet = await addWallet(userId, defaultWallet);
        setWallets([newWallet]);
      } else {
        setWallets(walletsData);
      }
    } catch (error) {
      console.error('Failed to load wallets:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load wallets. Please try again.',
        confirmButtonColor: '#3B82F6'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateWalletBalance = (walletId) => {
    const walletTransactions = transactions.filter(t => t.walletId === walletId);
    return walletTransactions.reduce((balance, transaction) => {
      return transaction.type === 'incoming' 
        ? balance + transaction.amount 
        : balance - transaction.amount;
    }, 0);
  };

  const handleAddWallet = async () => {
    if (!walletForm.name || !userId) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in all required fields',
        confirmButtonColor: '#3B82F6'
      });
      return;
    }

    setLoading(true);
    try {
      const newWalletData = {
        ...walletForm,
        balance: parseFloat(walletForm.balance) || 0,
        isDefault: wallets.length === 0
      };

      const newWallet = await addWallet(userId, newWalletData);
      setWallets([...wallets, newWallet]);
      setWalletForm({ name: '', type: 'cash', balance: '', color: '#3B82F6' });
      setIsAddingWallet(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Wallet created successfully!',
        confirmButtonColor: '#3B82F6',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Failed to add wallet:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to create wallet. Please try again.',
        confirmButtonColor: '#3B82F6'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditWallet = (wallet) => {
    setEditingWallet(wallet.id);
    setWalletForm({
      name: wallet.name,
      type: wallet.type,
      balance: wallet.balance.toString(),
      color: wallet.color
    });
    setIsAddingWallet(true);
  };

  const handleUpdateWallet = async () => {
    if (!editingWallet || !userId) return;

    setLoading(true);
    try {
      const updateData = {
        ...walletForm,
        balance: parseFloat(walletForm.balance) || 0
      };

      await updateWallet(userId, editingWallet, updateData);
      setWallets(wallets.map(wallet => 
        wallet.id === editingWallet 
          ? { ...wallet, ...updateData }
          : wallet
      ));
      setWalletForm({ name: '', type: 'cash', balance: '', color: '#3B82F6' });
      setIsAddingWallet(false);
      setEditingWallet(null);
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Wallet updated successfully!',
        confirmButtonColor: '#3B82F6',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Failed to update wallet:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update wallet. Please try again.',
        confirmButtonColor: '#3B82F6'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWallet = async (walletId) => {
    const wallet = wallets.find(w => w.id === walletId);
    
    if (wallet?.isDefault) {
      Swal.fire({
        icon: 'warning',
        title: 'Cannot Delete',
        text: 'You cannot delete the default wallet. Set another wallet as default first.',
        confirmButtonColor: '#3B82F6'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete this wallet and all its transaction data.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280'
    });

    if (result.isConfirmed && userId) {
      setLoading(true);
      try {
        await deleteWallet(userId, walletId);
        setWallets(wallets.filter(wallet => wallet.id !== walletId));
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted',
          text: 'Wallet has been deleted successfully.',
          confirmButtonColor: '#3B82F6',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Failed to delete wallet:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete wallet. Please try again.',
          confirmButtonColor: '#3B82F6'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSetDefault = async (walletId) => {
    if (!userId) return;

    setLoading(true);
    try {
      // Update all wallets to remove default status
      const updatePromises = wallets.map(wallet => {
        if (wallet.id === walletId) {
          return updateWallet(userId, wallet.id, { ...wallet, isDefault: true });
        } else if (wallet.isDefault) {
          return updateWallet(userId, wallet.id, { ...wallet, isDefault: false });
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);

      // Update local state
      setWallets(wallets.map(wallet => ({
        ...wallet,
        isDefault: wallet.id === walletId
      })));

      // Notify parent component
      const selectedWallet = wallets.find(w => w.id === walletId);
      if (selectedWallet && onWalletChange) {
        onWalletChange({ ...selectedWallet, isDefault: true });
      }

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Default wallet updated successfully!',
        confirmButtonColor: '#3B82F6',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Failed to set default wallet:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to set default wallet. Please try again.',
        confirmButtonColor: '#3B82F6'
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    const walletType = walletTypes.find(t => t.id === type);
    return walletType ? walletType.icon : WalletIcon;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Wallet Manager</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setIsAddingWallet(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground p-2 rounded-lg transition-colors"
                disabled={loading}
              >
                <PlusIcon className="h-5 w-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
          </div>

          {/* Add/Edit Wallet Form */}
          {isAddingWallet && (
            <div className="bg-secondary/50 rounded-lg p-4 mb-6">
              <h4 className="font-medium mb-4">
                {editingWallet ? 'Edit Wallet' : 'Add New Wallet'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Wallet Name *
                  </label>
                  <input
                    type="text"
                    value={walletForm.name}
                    onChange={(e) => setWalletForm({...walletForm, name: e.target.value})}
                    className="w-full p-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., My Cash Wallet"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Type
                  </label>
                  <select
                    value={walletForm.type}
                    onChange={(e) => setWalletForm({...walletForm, type: e.target.value})}
                    className="w-full p-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={loading}
                  >
                    {walletTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Initial Balance
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                      {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency}
                    </div>
                    <input
                      type="number"
                      value={walletForm.balance}
                      onChange={(e) => setWalletForm({...walletForm, balance: e.target.value})}
                      className="w-full p-3 pl-10 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="0.00"
                      step="0.01"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Color
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {colors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setWalletForm({...walletForm, color})}
                        className={`w-8 h-8 rounded-full border-2 ${
                          walletForm.color === color ? 'border-primary' : 'border-border'
                        }`}
                        style={{ backgroundColor: color }}
                        disabled={loading}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={editingWallet ? handleUpdateWallet : handleAddWallet}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : (editingWallet ? 'Update' : 'Add')} Wallet
                </button>
                <button
                  onClick={() => {
                    setIsAddingWallet(false);
                    setEditingWallet(null);
                    setWalletForm({ name: '', type: 'cash', balance: '', color: '#3B82F6' });
                  }}
                  className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Wallet List */}
          <div className="space-y-4">
            {loading && wallets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Loading wallets...</p>
              </div>
            ) : wallets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No wallets created yet</p>
                <p className="text-sm">Create your first wallet to start tracking</p>
              </div>
            ) : (
              wallets.map((wallet) => {
                const Icon = getTypeIcon(wallet.type);
                return (
                  <div 
                    key={wallet.id} 
                    className={`bg-secondary/30 rounded-lg p-4 border-2 ${
                      wallet.isDefault ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2 rounded-lg text-white"
                          style={{ backgroundColor: wallet.color }}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            {wallet.name}
                            {wallet.isDefault && (
                              <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-md">
                                Default
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-muted-foreground capitalize">
                            {walletTypes.find(t => t.id === wallet.type)?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {!wallet.isDefault && (
                          <button
                            onClick={() => handleSetDefault(wallet.id)}
                            className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 rounded-lg transition-colors"
                            disabled={loading}
                            title="Set as default"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEditWallet(wallet)}
                          className="p-2 hover:bg-secondary rounded-lg transition-colors"
                          disabled={loading}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteWallet(wallet.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded-lg transition-colors"
                          disabled={loading || wallet.isDefault}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        {formatCurrency(wallet.balance || 0, currency)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletManager;
