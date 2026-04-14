import Swal from 'sweetalert2';

/**
 * Success Alert
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {function} onConfirm - Callback function when confirmed
 */
export const showSuccess = (title = 'Success!', message = '', onConfirm = null) => {
  return Swal.fire({
    title,
    text: message,
    icon: 'success',
    confirmButtonText: 'OK',
    confirmButtonColor: '#16a34a',
    background: '#f0fdf4',
    color: '#166534',
    didClose: onConfirm,
  });
};

/**
 * Error Alert
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {function} onConfirm - Callback function when confirmed
 */
export const showError = (title = 'Error!', message = '', onConfirm = null) => {
  return Swal.fire({
    title,
    text: message,
    icon: 'error',
    confirmButtonText: 'OK',
    confirmButtonColor: '#dc2626',
    background: '#fef2f2',
    color: '#7f1d1d',
    didClose: onConfirm,
  });
};

/**
 * Warning Alert
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {function} onConfirm - Callback function when confirmed
 */
export const showWarning = (title = 'Warning!', message = '', onConfirm = null) => {
  return Swal.fire({
    title,
    text: message,
    icon: 'warning',
    confirmButtonText: 'OK',
    confirmButtonColor: '#f59e0b',
    background: '#fffbeb',
    color: '#92400e',
    didClose: onConfirm,
  });
};

/**
 * Info Alert
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {function} onConfirm - Callback function when confirmed
 */
export const showInfo = (title = 'Information', message = '', onConfirm = null) => {
  return Swal.fire({
    title,
    text: message,
    icon: 'info',
    confirmButtonText: 'OK',
    confirmButtonColor: '#2563eb',
    background: '#eff6ff',
    color: '#1e3a8a',
    didClose: onConfirm,
  });
};

/**
 * Confirmation Alert
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {string} confirmText - Confirm button text
 * @param {string} cancelText - Cancel button text
 * @returns {Promise} - Resolves with result object
 */
export const showConfirm = (
  title = 'Are you sure?',
  message = '',
  confirmText = 'Yes, proceed!',
  cancelText = 'Cancel'
) => {
  return Swal.fire({
    title,
    text: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: '#16a34a',
    cancelButtonColor: '#6b7280',
    background: '#f9fafb',
    color: '#111827',
  });
};

/**
 * Loading Alert - Cannot be dismissed by user
 * @param {string} message - Loading message
 */
export const showLoading = (message = 'Loading...') => {
  Swal.fire({
    title: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: async () => {
      Swal.showLoading();
    },
  });
};

/**
 * Close any open alert
 */
export const closeAlert = () => {
  Swal.close();
};

/**
 * Toast notification (appears in corner)
 * @param {string} message - Toast message
 * @param {string} type - 'success', 'error', 'warning', 'info'
 * @param {number} timer - Duration in milliseconds
 */
export const showToast = (message, type = 'success', timer = 3000) => {
  return Swal.fire({
    title: message,
    icon: type,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer,
    timerProgressBar: true,
    background: type === 'success' ? '#f0fdf4' : 
                type === 'error' ? '#fef2f2' :
                type === 'warning' ? '#fffbeb' : '#eff6ff',
    color: type === 'success' ? '#166534' :
           type === 'error' ? '#7f1d1d' :
           type === 'warning' ? '#92400e' : '#1e3a8a',
  });
};

/**
 * Custom Alert with HTML content
 * @param {string} title - Alert title
 * @param {string} htmlContent - HTML content
 * @param {string} icon - Icon type
 */
export const showCustom = (title, htmlContent, icon = 'info') => {
  return Swal.fire({
    title,
    html: htmlContent,
    icon,
    confirmButtonText: 'OK',
    confirmButtonColor: '#2563eb',
  });
};

/**
 * Input Alert - Prompts user for input
 * @param {string} title - Alert title
 * @param {string} placeholder - Input placeholder
 * @returns {Promise} - Resolves with user input
 */
export const showInput = (title = 'Enter value', placeholder = '') => {
  return Swal.fire({
    title,
    input: 'text',
    inputPlaceholder: placeholder,
    showCancelButton: true,
    confirmButtonText: 'Submit',
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#6b7280',
    inputValidator: (value) => {
      if (!value) {
        return 'Please enter a value!';
      }
    },
  });
};
