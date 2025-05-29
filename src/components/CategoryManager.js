'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, TagIcon } from '@heroicons/react/24/outline';
import { addCategory, updateCategory, deleteCategory } from '../app/firebase';
import { getAuth } from 'firebase/auth';
import Swal from 'sweetalert2';

const CategoryManager = ({ isOpen, onClose, categories = [], onCategoryUpdate }) => {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    type: 'outgoing',
    color: '#3B82F6',
    icon: 'tag',
    description: ''
  });
  const [activeTab, setActiveTab] = useState('outgoing');

  const categoryIcons = [
    { id: 'tag', name: 'Tag', icon: '🏷️' },
    { id: 'food', name: 'Food', icon: '🍔' },
    { id: 'transport', name: 'Transport', icon: '🚗' },
    { id: 'shopping', name: 'Shopping', icon: '🛒' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
    { id: 'health', name: 'Health', icon: '⚕️' },
    { id: 'education', name: 'Education', icon: '📚' },
    { id: 'utilities', name: 'Utilities', icon: '💡' },
    { id: 'rent', name: 'Rent', icon: '🏠' },
    { id: 'salary', name: 'Salary', icon: '💰' },
    { id: 'investment', name: 'Investment', icon: '📈' },
    { id: 'gift', name: 'Gift', icon: '🎁' }
  ];

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#F97316', '#6366F1', '#14B8A6', '#F43F5E'
  ];

  // Get current user
  useEffect(() => {
    const auth = getAuth();
    if (auth.currentUser) {
      setUserId(auth.currentUser.uid);
    }
  }, []);

  const getFilteredCategories = (type) => {
    return categories.filter(cat => cat.type === type);
  };

  const handleAddCategory = async () => {
    if (!categoryForm.name || !userId) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please enter a category name',
        confirmButtonColor: '#3B82F6'
      });
      return;
    }

    // Check for duplicate names
    const existingCategory = categories.find(
      cat => cat.name.toLowerCase() === categoryForm.name.toLowerCase() && 
            cat.type === categoryForm.type
    );

    if (existingCategory) {
      Swal.fire({
        icon: 'warning',
        title: 'Duplicate Category',
        text: 'A category with this name already exists for this type',
        confirmButtonColor: '#3B82F6'
      });
      return;
    }

    setLoading(true);
    try {
      const newCategory = await addCategory(userId, categoryForm);
      onCategoryUpdate && onCategoryUpdate();
      setCategoryForm({ name: '', type: 'outgoing', color: '#3B82F6', icon: 'tag', description: '' });
      setIsAddingCategory(false);

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Category created successfully!',
        confirmButtonColor: '#3B82F6',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Failed to add category:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to create category. Please try again.',
        confirmButtonColor: '#3B82F6'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category.id);
    setCategoryForm({
      name: category.name,
      type: category.type,
      color: category.color || '#3B82F6',
      icon: category.icon || 'tag',
      description: category.description || ''
    });
    setIsAddingCategory(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !userId) return;

    setLoading(true);
    try {
      await updateCategory(userId, editingCategory, categoryForm);
      onCategoryUpdate && onCategoryUpdate();
      setCategoryForm({ name: '', type: 'outgoing', color: '#3B82F6', icon: 'tag', description: '' });
      setIsAddingCategory(false);
      setEditingCategory(null);

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Category updated successfully!',
        confirmButtonColor: '#3B82F6',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Failed to update category:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update category. Please try again.',
        confirmButtonColor: '#3B82F6'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `This will permanently delete the "${categoryName}" category. Existing transactions will keep this category name.`,
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
        await deleteCategory(userId, categoryId);
        onCategoryUpdate && onCategoryUpdate();

        Swal.fire({
          icon: 'success',
          title: 'Deleted',
          text: 'Category has been deleted successfully.',
          confirmButtonColor: '#3B82F6',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Failed to delete category:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete category. Please try again.',
          confirmButtonColor: '#3B82F6'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const getIconEmoji = (iconId) => {
    const icon = categoryIcons.find(i => i.id === iconId);
    return icon ? icon.icon : '🏷️';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Category Manager</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setIsAddingCategory(true)}
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

          {/* Category Type Tabs */}
          <div className="flex mb-6 bg-secondary/30 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('outgoing')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                activeTab === 'outgoing' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Expense Categories
            </button>
            <button
              onClick={() => setActiveTab('incoming')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                activeTab === 'incoming' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Income Categories
            </button>
          </div>

          {/* Add/Edit Category Form */}
          {isAddingCategory && (
            <div className="bg-secondary/50 rounded-lg p-4 mb-6">
              <h4 className="font-medium mb-4">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                      className="w-full p-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., Groceries"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Type
                    </label>
                    <select
                      value={categoryForm.type}
                      onChange={(e) => setCategoryForm({...categoryForm, type: e.target.value})}
                      className="w-full p-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={loading}
                    >
                      <option value="outgoing">Expense</option>
                      <option value="incoming">Income</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                    className="w-full p-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Brief description of this category"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Icon
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {categoryIcons.map(icon => (
                      <button
                        key={icon.id}
                        onClick={() => setCategoryForm({...categoryForm, icon: icon.id})}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          categoryForm.icon === icon.id 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        title={icon.name}
                        disabled={loading}
                      >
                        <span className="text-xl">{icon.icon}</span>
                      </button>
                    ))}
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
                        onClick={() => setCategoryForm({...categoryForm, color})}
                        className={`w-8 h-8 rounded-full border-2 ${
                          categoryForm.color === color ? 'border-primary ring-2 ring-primary/30' : 'border-border'
                        }`}
                        style={{ backgroundColor: color }}
                        disabled={loading}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : (editingCategory ? 'Update' : 'Add')} Category
                </button>
                <button
                  onClick={() => {
                    setIsAddingCategory(false);
                    setEditingCategory(null);
                    setCategoryForm({ name: '', type: 'outgoing', color: '#3B82F6', icon: 'tag', description: '' });
                  }}
                  className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Categories List */}
          <div className="space-y-3">
            {loading && getFilteredCategories(activeTab).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Loading categories...</p>
              </div>
            ) : getFilteredCategories(activeTab).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No {activeTab === 'outgoing' ? 'expense' : 'income'} categories yet</p>
                <p className="text-sm">Create your first category to get started</p>
              </div>
            ) : (
              getFilteredCategories(activeTab).map((category) => (
                <div 
                  key={category.id} 
                  className="bg-secondary/30 rounded-lg p-4 border-l-4 transition-all hover:bg-secondary/50"
                  style={{ borderLeftColor: category.color || '#3B82F6' }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-lg text-white text-lg"
                        style={{ backgroundColor: category.color || '#3B82F6' }}
                      >
                        {getIconEmoji(category.icon)}
                      </div>
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        {category.description && (
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground capitalize">
                          {category.type === 'outgoing' ? 'Expense' : 'Income'} Category
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                        disabled={loading}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id, category.name)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded-lg transition-colors"
                        disabled={loading}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-primary/10 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <span className="block text-2xl font-bold text-green-600">
                  {getFilteredCategories('incoming').length}
                </span>
                <span className="text-sm text-muted-foreground">Income Categories</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-red-600">
                  {getFilteredCategories('outgoing').length}
                </span>
                <span className="text-sm text-muted-foreground">Expense Categories</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
