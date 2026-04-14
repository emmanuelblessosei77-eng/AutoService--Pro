/**
 * SWEETALERT2 INTEGRATION GUIDE
 * ==============================
 * 
 * This file contains examples of how to use SweetAlert2 throughout your application
 */

import { 
  showSuccess, 
  showError, 
  showWarning, 
  showConfirm, 
  showLoading, 
  closeAlert, 
  showToast,
  showCustom,
  showInput 
} from '../utils/alertUtils';

// ============================================
// 1. FORM SUBMISSION EXAMPLE
// ============================================
export const handleFormSubmit = async (formData) => {
  try {
    showLoading('Submitting form...');
    
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    closeAlert();

    if (response.ok) {
      const data = await response.json();
      showSuccess('Success!', 'Your form has been submitted successfully.');
      // Handle success logic
    } else {
      showError('Error', 'Failed to submit form. Please try again.');
    }
  } catch (error) {
    closeAlert();
    showError('Error', error.message);
  }
};

// ============================================
// 2. DELETE CONFIRMATION EXAMPLE
// ============================================
export const handleDelete = async (itemId, itemName) => {
  const result = await showConfirm(
    'Delete Item?',
    `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
    'Yes, Delete',
    'Cancel'
  );

  if (result.isConfirmed) {
    try {
      showLoading('Deleting...');
      
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
      });

      closeAlert();

      if (response.ok) {
        showSuccess('Deleted!', `${itemName} has been deleted successfully.`);
      } else {
        showError('Error', 'Failed to delete item.');
      }
    } catch (error) {
      closeAlert();
      showError('Error', error.message);
    }
  }
};

// ============================================
// 3. LOGIN/AUTHENTICATION EXAMPLE
// ============================================
export const handleLogin = async (email, password) => {
  try {
    showLoading('Logging in...');

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    closeAlert();

    if (response.ok) {
      showSuccess('Login Successful!', `Welcome back, ${data.user.name}!`);
      // Store token and redirect
      localStorage.setItem('token', data.token);
      return true;
    } else {
      showError('Login Failed', data.message || 'Invalid credentials.');
      return false;
    }
  } catch (error) {
    closeAlert();
    showError('Error', error.message);
    return false;
  }
};

// ============================================
// 4. BOOKING CONFIRMATION EXAMPLE
// ============================================
export const handleBookingSubmit = async (bookingData) => {
  try {
    showLoading('Processing your booking...');

    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });

    closeAlert();

    if (response.ok) {
      const booking = await response.json();
      showSuccess(
        'Booking Confirmed!',
        `Your booking ID is ${booking.id}. You will receive a confirmation email shortly.`
      );
      return booking;
    } else {
      showError('Booking Failed', 'Unable to complete your booking. Please try again.');
      return null;
    }
  } catch (error) {
    closeAlert();
    showError('Error', error.message);
    return null;
  }
};

// ============================================
// 5. PAYMENT PROCESSING EXAMPLE
// ============================================
export const handlePayment = async (paymentData) => {
  try {
    const result = await showConfirm(
      'Confirm Payment',
      `Please confirm to pay $${paymentData.amount}`,
      'Proceed with Payment',
      'Cancel'
    );

    if (result.isConfirmed) {
      showLoading('Processing payment...');

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      closeAlert();

      if (response.ok) {
        const payment = await response.json();
        showSuccess(
          'Payment Successful!',
          `Transaction ID: ${payment.id}. Amount: $${payment.amount}`
        );
        return payment;
      } else {
        showError('Payment Failed', 'Your payment could not be processed. Please try again.');
      }
    }
  } catch (error) {
    closeAlert();
    showError('Payment Error', error.message);
  }
};

// ============================================
// 6. VALIDATION ERROR EXAMPLE
// ============================================
export const handleValidationError = (errors) => {
  const errorList = Object.entries(errors)
    .map(([field, message]) => `<li><strong>${field}:</strong> ${message}</li>`)
    .join('');

  showCustom(
    'Validation Errors',
    `<ul style="text-align: left;">${errorList}</ul>`,
    'error'
  );
};

// ============================================
// 7. TOAST NOTIFICATIONS EXAMPLE
// ============================================
export const handleToastNotifications = () => {
  // Success toast
  showToast('Operation completed successfully!', 'success', 3000);

  // Error toast
  showToast('Something went wrong!', 'error', 3000);

  // Warning toast
  showToast('Are you sure about that?', 'warning', 3000);

  // Info toast
  showToast('New updates available!', 'info', 3000);
};

// ============================================
// 8. USER INPUT EXAMPLE
// ============================================
export const handleReasonInput = async (reason) => {
  try {
    const result = await showInput(
      'Why are you cancelling?',
      'Please tell us why you want to cancel...'
    );

    if (result.isConfirmed) {
      showLoading('Processing cancellation...');

      const response = await fetch('/api/cancellations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: result.value, id: reason }),
      });

      closeAlert();

      if (response.ok) {
        showSuccess('Cancelled', 'Your cancellation has been processed.');
      }
    }
  } catch (error) {
    closeAlert();
    showError('Error', error.message);
  }
};

// ============================================
// 9. PROFILE UPDATE EXAMPLE
// ============================================
export const handleProfileUpdate = async (formData) => {
  try {
    const result = await showConfirm(
      'Update Profile?',
      'Are you sure you want to update your profile information?',
      'Yes, Update',
      'Cancel'
    );

    if (result.isConfirmed) {
      showLoading('Updating profile...');

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      closeAlert();

      if (response.ok) {
        showSuccess('Profile Updated!', 'Your profile has been updated successfully.');
      } else {
        showError('Update Failed', 'Unable to update your profile.');
      }
    }
  } catch (error) {
    closeAlert();
    showError('Error', error.message);
  }
};

// ============================================
// 10. FILE UPLOAD EXAMPLE
// ============================================
export const handleFileUpload = async (file) => {
  try {
    if (file.size > 5 * 1024 * 1024) {
      showWarning('File Too Large', 'Please upload a file smaller than 5MB.');
      return;
    }

    showLoading('Uploading file...');

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    closeAlert();

    if (response.ok) {
      const data = await response.json();
      showSuccess('Upload Successful!', `File "${file.name}" uploaded successfully.`);
    } else {
      showError('Upload Failed', 'Unable to upload file.');
    }
  } catch (error) {
    closeAlert();
    showError('Error', error.message);
  }
};

// ============================================
// 11. SERVICE BOOKING EXAMPLE
// ============================================
export const handleServiceBooking = async (serviceData) => {
  try {
    showLoading('Booking service...');

    const response = await fetch('/api/services/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serviceData),
    });

    closeAlert();

    if (response.ok) {
      const booking = await response.json();
      showSuccess(
        'Service Booked!',
        `Your ${serviceData.serviceName} service is booked for ${serviceData.date} at ${serviceData.time}`
      );
      // Show toast for quick notification
      showToast('Check your email for confirmation', 'success', 3000);
      return booking;
    } else {
      showError('Booking Failed', 'Unable to book the service. Please try again.');
    }
  } catch (error) {
    closeAlert();
    showError('Error', error.message);
  }
};

// ============================================
// 12. NETWORK ERROR HANDLING
// ============================================
export const handleNetworkError = (error) => {
  if (!navigator.onLine) {
    showWarning(
      'No Internet Connection',
      'Please check your internet connection and try again.'
    );
  } else if (error.status === 404) {
    showError('Not Found', 'The requested resource was not found.');
  } else if (error.status === 500) {
    showError('Server Error', 'The server encountered an error. Please try again later.');
  } else if (error.status === 403) {
    showError('Access Denied', 'You do not have permission to perform this action.');
  } else {
    showError('Error', error.message || 'An unexpected error occurred.');
  }
};

// ============================================
// USAGE IN REACT COMPONENTS
// ============================================
/*
import { handleFormSubmit, handleDelete, showSuccess } from './alertExamples';

export function MyComponent() {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    handleFormSubmit(Object.fromEntries(formData));
  };

  const handleDeleteItem = (itemId, itemName) => {
    handleDelete(itemId, itemName);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* form fields */}
        <button type="submit">Submit</button>
      </form>
      <button onClick={() => handleDeleteItem(1, 'Item Name')}>Delete</button>
    </>
  );
}
*/
