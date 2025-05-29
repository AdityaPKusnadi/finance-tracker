import Swal from 'sweetalert2';

// Custom theme configuration for SweetAlert2
const swalTheme = {
  customClass: {
    popup: 'rounded-xl',
    title: 'text-lg font-semibold',
    content: 'text-sm text-muted-foreground',
    confirmButton: 'bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors',
    cancelButton: 'bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg font-medium transition-colors mr-2',
    actions: 'gap-2'
  },
  buttonsStyling: false
};

// Success alert
export const showSuccess = (title, text = '') => {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    timer: 3000,
    showConfirmButton: false,
    toast: true,
    position: 'top-end',
    ...swalTheme
  });
};

// Error alert
export const showError = (title, text = '') => {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'OK',
    ...swalTheme
  });
};

// Warning alert
export const showWarning = (title, text = '') => {
  return Swal.fire({
    icon: 'warning',
    title,
    text,
    confirmButtonText: 'OK',
    ...swalTheme
  });
};

// Info alert
export const showInfo = (title, text = '') => {
  return Swal.fire({
    icon: 'info',
    title,
    text,
    confirmButtonText: 'OK',
    ...swalTheme
  });
};

// Confirmation dialog
export const showConfirmation = (title, text = '', confirmText = 'Yes', cancelText = 'Cancel') => {
  return Swal.fire({
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    ...swalTheme
  });
};

// Delete confirmation
export const showDeleteConfirmation = (itemName = 'this item') => {
  return Swal.fire({
    title: 'Are you sure?',
    text: `You won't be able to revert deleting ${itemName}!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#ef4444',
    ...swalTheme
  });
};

// Loading alert
export const showLoading = (title = 'Loading...') => {
  return Swal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
    ...swalTheme
  });
};

// Close any open Swal
export const closeSwal = () => {
  Swal.close();
};

// Simple notification (replaces basic alert)
export const notify = (message, type = 'info') => {
  const icons = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info'
  };

  return Swal.fire({
    title: message,
    icon: icons[type] || 'info',
    timer: 3000,
    showConfirmButton: false,
    toast: true,
    position: 'top-end',
    ...swalTheme
  });
};
