'use client';

import { useState, useEffect, useRef } from 'react';
import { XCircleIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { notify } from '../utils/alerts';

// Import icons
import {
  BanknotesIcon,
  BriefcaseIcon,
  GiftIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  HomeIcon,
  TruckIcon,
  AcademicCapIcon,
  FilmIcon,
  HeartIcon,
  GlobeAltIcon,
  UserGroupIcon,
  PresentationChartLineIcon,
  CreditCardIcon,
  WrenchScrewdriverIcon,
  ShoppingCartIcon,
  DevicePhoneMobileIcon,
  ReceiptPercentIcon,
  MusicalNoteIcon,
  PaintBrushIcon,
  FaceSmileIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/solid';

const CategorySelector = ({ categories, value, onChange, transactionType, onAddCategory }) => {  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showAddNew, setShowAddNew] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const dropdownRef = useRef(null);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      notify('Please enter a category name', 'warning');
      return;
    }

    if (categories.some(cat => cat.name.toLowerCase() === newCategoryName.toLowerCase())) {
      notify('Category already exists', 'warning');
      return;
    }

    if (onAddCategory) {
      const newCategory = {
        id: Date.now().toString(),
        name: newCategoryName.trim(),
        type: transactionType,
        icon: getCategoryIcon(newCategoryName.trim())
      };
      onAddCategory(newCategory);
      onChange(newCategoryName.trim());
      setNewCategoryName('');
      setShowAddNew(false);
      setIsOpen(false);
      notify(`Category "${newCategoryName.trim()}" added successfully`, 'success');
    }
  };
  
  // Filter categories by type and search term
  const filteredCategories = categories
    .filter(cat => cat.type === transactionType)
    .filter(cat => cat.name.toLowerCase().includes(search.toLowerCase()));
  
  // Get the current selected category
  const selectedCategory = categories.find(cat => cat.name === value);
  
  // Get a background color for the category based on its type
  const getCategoryBackground = () => {
    if (!value) return 'bg-secondary/50';
    return transactionType === 'incoming' 
      ? 'bg-green-100 dark:bg-green-900/30' 
      : 'bg-red-100 dark:bg-red-900/30';
  };

  // Get border color for category
  const getCategoryBorderColor = () => {
    if (!value) return 'border-transparent';
    return transactionType === 'incoming'
      ? 'border-green-500 dark:border-green-700'
      : 'border-red-500 dark:border-red-700';
  };
  
  // Get text color for category
  const getCategoryTextColor = () => {
    if (!value) return '';
    return transactionType === 'incoming'
      ? 'text-green-700 dark:text-green-400'
      : 'text-red-700 dark:text-red-400';
  };

  // Get color for icon background
  const getIconBackground = () => {
    return transactionType === 'incoming'
      ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
      : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400';
  };

  // Category icons with components based on category name
  const getCategoryIcon = (categoryName) => {
    const lowerName = categoryName?.toLowerCase() || '';
    const IconComponent = getCategoryIconComponent(lowerName);
    
    return (
      <div className={`p-1.5 rounded-full ${getIconBackground()}`}>
        <IconComponent className="h-4 w-4" />
      </div>
    );
  };
  
  // Get icon component based on category name
  const getCategoryIconComponent = (lowerName) => {
    if (transactionType === 'incoming') {
      if (lowerName.includes('salary') || lowerName.includes('wage') || lowerName.includes('paycheck')) 
        return BriefcaseIcon;
      if (lowerName.includes('invest') || lowerName.includes('dividend') || lowerName.includes('stock')) 
        return ArrowTrendingUpIcon;
      if (lowerName.includes('gift') || lowerName.includes('present')) 
        return GiftIcon;
      if (lowerName.includes('refund') || lowerName.includes('rebate')) 
        return ReceiptPercentIcon;
      if (lowerName.includes('bonus')) 
        return CheckBadgeIcon;
      if (lowerName.includes('side') || lowerName.includes('hustle')) 
        return PresentationChartLineIcon;
      if (lowerName.includes('rental') || lowerName.includes('rent income')) 
        return HomeIcon;
      if (lowerName.includes('freelance')) 
        return WrenchScrewdriverIcon;
      if (lowerName.includes('savings') || lowerName.includes('interest')) 
        return BanknotesIcon;
      return CurrencyDollarIcon;
    } else {
      if (lowerName.includes('food') || lowerName.includes('restaurant') || lowerName.includes('dining'))
        return ShoppingBagIcon;
      if (lowerName.includes('grocery') || lowerName.includes('supermarket'))
        return ShoppingCartIcon;
      if (lowerName.includes('transport') || lowerName.includes('gas') || lowerName.includes('fuel'))
        return TruckIcon;
      if (lowerName.includes('bill') || lowerName.includes('utility') || lowerName.includes('phone'))
        return DevicePhoneMobileIcon;
      if (lowerName.includes('rent') || lowerName.includes('mortgage') || lowerName.includes('housing'))
        return HomeIcon;
      if (lowerName.includes('entertainment') || lowerName.includes('movie'))
        return FilmIcon;
      if (lowerName.includes('shop') || lowerName.includes('cloth'))
        return ShoppingBagIcon;
      if (lowerName.includes('health') || lowerName.includes('medical') || lowerName.includes('doctor'))
        return HeartIcon;
      if (lowerName.includes('education') || lowerName.includes('school') || lowerName.includes('course'))
        return AcademicCapIcon;
      if (lowerName.includes('travel') || lowerName.includes('vacation') || lowerName.includes('trip'))
        return GlobeAltIcon;
      if (lowerName.includes('sub') || lowerName.includes('membership'))
        return DevicePhoneMobileIcon;
      if (lowerName.includes('family') || lowerName.includes('child') || lowerName.includes('kid'))
        return UserGroupIcon;
      if (lowerName.includes('hobby') || lowerName.includes('sport'))
        return FaceSmileIcon;
      if (lowerName.includes('art') || lowerName.includes('music'))
        return PaintBrushIcon;
      return CreditCardIcon;
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected category display */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full p-2.5 rounded-md border ${getCategoryBorderColor()} ${getCategoryBackground()} cursor-pointer transition-all`}
      >
        <div className="flex items-center gap-2">
          {value ? (
            <>
              {getCategoryIcon(value)}
              <span className={`font-medium ${getCategoryTextColor()}`}>{value}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Select Category</span>
          )}
        </div>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      
      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-md shadow-lg animate-scale-in max-h-60 overflow-y-auto">
          {/* Search input */}
          <div className="sticky top-0 p-2 border-b border-border bg-card z-10">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-muted-foreground" />
              </div>              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories..."
                className="w-full pl-10 pr-8 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
              {search && (
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setSearch('')}
                >
                  <XCircleIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </div>
            {/* Categories list */}
          <div className="max-h-60 overflow-y-auto">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => {
                    onChange(cat.name);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`flex items-center p-3 cursor-pointer hover:bg-secondary/50 ${
                    cat.name === value ? `${transactionType === 'incoming' ? 'bg-green-100/50' : 'bg-red-100/50'} dark:bg-secondary/30` : ''
                  }`}
                >
                  <span className="text-lg mr-2">{getCategoryIcon(cat.name)}</span>
                  <span>{cat.name}</span>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-muted-foreground">
                No categories found
                {search && (
                  <div className="mt-2">
                    <button
                      onClick={() => {
                        setNewCategoryName(search);
                        setShowAddNew(true);
                      }}
                      className="text-primary hover:text-primary/80 text-sm underline"
                    >
                      Create "{search}" category
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Add new category section */}
            {onAddCategory && (
              <>
                {filteredCategories.length > 0 && (
                  <div className="border-t border-border" />
                )}
                {showAddNew ? (
                  <div className="p-3 bg-secondary/30">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Category name"
                        className="flex-1 px-2 py-1 text-sm rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddCategory();
                          }
                        }}
                        autoFocus
                      />
                      <button
                        onClick={handleAddCategory}
                        className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm hover:bg-primary/90"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setShowAddNew(false);
                          setNewCategoryName('');
                        }}
                        className="text-muted-foreground hover:text-foreground px-2 py-1 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setShowAddNew(true)}
                    className="flex items-center p-3 cursor-pointer hover:bg-secondary/50 text-primary"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    <span>Add new category</span>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* No categories message */}
          {categories.filter(cat => cat.type === transactionType).length === 0 && (
            <div className="p-3 text-center border-t border-border">
              <p className="text-sm text-muted-foreground">
                No categories available. Add some in settings.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
