'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/utils/currency';
import { notify } from '../utils/alerts';
import Calculator from './Calculator';
import CurrencyConverter from './CurrencyConverter';
import DetailedTransactionInput from './DetailedTransactionInput';
import CategorySelector from './CategorySelector';
import { 
  XMarkIcon, 
  CalculatorIcon, 
  CurrencyDollarIcon,
  ListBulletIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const EnhancedTransactionModal = ({
  isOpen,
  onClose,
  onSubmit,
  currency,
  categories,
  onAddCategory,
  editTransaction = null,
  isEditing = false
}) => {
  const [formData, setFormData] = useState({
    type: 'outgoing',
    amount: '',
    category: '',
    description: '',
    details: {
      subcategories: [],
      totalAmount: 0,
      notes: ''
    }
  });

  const [showCalculator, setShowCalculator] = useState(false);
  const [showConverter, setShowConverter] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [calculatorResult, setCalculatorResult] = useState('');
  const [convertedAmount, setConvertedAmount] = useState('');
  const [activeTab, setActiveTab] = useState('basic'); // basic, detailed, converter

  // Quick amount buttons for fast input
  const quickAmounts = [
    { label: '10K', value: 10000 },
    { label: '25K', value: 25000 },
    { label: '50K', value: 50000 },
    { label: '100K', value: 100000 },
    { label: '250K', value: 250000 },
    { label: '500K', value: 500000 },
  ];

  // Initialize form data when editing
  useEffect(() => {
    if (isEditing && editTransaction) {
      setFormData({
        type: editTransaction.type,
        amount: editTransaction.amount.toString(),
        category: editTransaction.category,
        description: editTransaction.description || '',
        details: editTransaction.details || {
          subcategories: [],
          totalAmount: 0,
          notes: ''
        }
      });
    } else if (!isEditing) {
      setFormData({
        type: 'outgoing',
        amount: '',
        category: '',
        description: '',
        details: {
          subcategories: [],
          totalAmount: 0,
          notes: ''
        }
      });
    }
  }, [isEditing, editTransaction, isOpen]);
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      notify('Please enter a valid amount', 'warning');
      return;
    }

    if (!formData.category) {
      notify('Please select a category', 'warning');
      return;
    }

    onSubmit({
      ...formData,
      amount: amount,
      details: showDetails ? formData.details : null
    });

    // Reset form
    setFormData({
      type: 'outgoing',
      amount: '',
      category: '',
      description: '',
      details: {
        subcategories: [],
        totalAmount: 0,
        notes: ''
      }
    });
    setShowCalculator(false);
    setShowConverter(false);
    setShowDetails(false);
    setActiveTab('basic');
  };
  const handleCalculatorResult = (result) => {
    setFormData(prev => ({
      ...prev,
      amount: result.toString()
    }));
    setCalculatorResult(result.toString());
    // Automatically close calculator after calculation
    setShowCalculator(false);
  };
  const handleConverterResult = (convertData) => {
    // convertData is an object with convertedAmount property
    const amount = convertData.convertedAmount || convertData;
    setFormData(prev => ({
      ...prev,
      amount: amount.toString()
    }));
    setConvertedAmount(amount.toString());
  };

  const handleQuickAmount = (amount) => {
    setFormData(prev => ({
      ...prev,
      amount: amount.toString()
    }));
  };

  const handleDetailsChange = (details) => {
    setFormData(prev => ({
      ...prev,
      details: details
    }));
    
    // Update main amount if details total is provided
    if (details.totalAmount > 0) {
      setFormData(prev => ({
        ...prev,
        amount: details.totalAmount.toString()
      }));
    }
  };

  const formatNumberInput = (value) => {
    // Remove non-numeric characters except decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    return cleanValue;
  };

  const handleAmountChange = (e) => {
    const value = formatNumberInput(e.target.value);
    setFormData(prev => ({
      ...prev,
      amount: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold">
            {isEditing ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('basic')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'basic'
                ? 'border-b-2 border-primary text-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
            }`}
          >
            Basic Info
          </button>
          <button
            onClick={() => setActiveTab('detailed')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'detailed'
                ? 'border-b-2 border-primary text-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
            }`}
          >
            <ListBulletIcon className="h-4 w-4 inline mr-1" />
            Detailed
          </button>
          <button
            onClick={() => setActiveTab('converter')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'converter'
                ? 'border-b-2 border-primary text-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
            }`}
          >
            <CurrencyDollarIcon className="h-4 w-4 inline mr-1" />
            Convert
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(95vh-180px)]">
          {/* Basic Tab */}
          {activeTab === 'basic' && (
            <div className="p-6 space-y-6">
              {/* Transaction Type */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-3">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: 'incoming' }))}
                    className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      formData.type === 'incoming'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 shadow-md'
                        : 'border-border hover:border-green-300 hover:bg-green-50/30 dark:hover:bg-green-900/10'
                    }`}
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    <span className="font-medium">Income</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: 'outgoing' }))}
                    className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      formData.type === 'outgoing'
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 shadow-md'
                        : 'border-border hover:border-red-300 hover:bg-red-50/30 dark:hover:bg-red-900/10'
                    }`}
                  >
                    <MinusIcon className="h-5 w-5 mr-2" />
                    <span className="font-medium">Expense</span>
                  </button>
                </div>
              </div>              {/* Amount Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-muted-foreground">
                    Amount
                  </label>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowCalculator(!showCalculator);
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      showCalculator 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                    title="Toggle Calculator"
                  >
                    <CalculatorIcon className="h-4 w-4" />
                    <span>{showCalculator ? 'Hide' : 'Calculator'}</span>
                  </button>
                </div>
                
                {/* Amount Input */}
                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-muted-foreground font-medium">
                    {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency}
                  </div>
                  <input
                    type="text"
                    value={formData.amount}
                    onChange={handleAmountChange}
                    className="w-full p-4 pl-12 text-lg font-medium rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {quickAmounts.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => handleQuickAmount(item.value)}
                      className="px-3 py-2 text-sm font-medium bg-secondary/50 hover:bg-secondary rounded-lg transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Calculator */}
                {showCalculator && (
                  <div className="mb-4">
                    <Calculator
                      onCalculate={handleCalculatorResult}
                      initialValue={formData.amount}
                    />
                  </div>
                )}

                {/* Formatted Amount Display */}
                {formData.amount && (
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-1">Formatted Amount:</p>
                    <p className="text-lg font-bold text-primary">
                      {formatCurrency(parseFloat(formData.amount) || 0, currency)}
                    </p>
                  </div>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-3">
                  Category
                </label>                <CategorySelector
                  categories={categories}
                  transactionType={formData.type}
                  value={formData.category}
                  onChange={(category) => setFormData(prev => ({ ...prev, category }))}
                  onAddCategory={onAddCategory}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-3">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows="3"
                  placeholder="Enter transaction description..."
                />
              </div>
            </div>
          )}

          {/* Detailed Tab */}
          {activeTab === 'detailed' && (
            <div className="p-6">
              <DetailedTransactionInput
                category={formData.category}
                currency={currency}
                onDetailsChange={handleDetailsChange}
                initialDetails={formData.details}
              />
            </div>
          )}

          {/* Converter Tab */}
          {activeTab === 'converter' && (
            <div className="p-6">
              <CurrencyConverter
                amount={parseFloat(formData.amount) || 0}
                fromCurrency={currency}
                onConvert={handleConverterResult}
              />
            </div>
          )}

          {/* Footer */}
          <div className="p-6 border-t border-border bg-secondary/10">
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl border border-border bg-background hover:bg-secondary transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.amount || !formData.category}
                className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEditing ? 'Update Transaction' : 'Add Transaction'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedTransactionModal;
