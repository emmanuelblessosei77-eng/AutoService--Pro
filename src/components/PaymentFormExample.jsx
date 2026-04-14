import React, { useState } from 'react';
import { 
  showSuccess, 
  showError, 
  showConfirm, 
  showLoading, 
  showWarning,
  closeAlert,
  showToast,
  showCustom
} from '../utils/alertUtils';

/**
 * Example Payment Component with SweetAlert2 Integration
 * This demonstrates how to use alerts for payment processing
 */
const PaymentFormExample = () => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const validatePayment = () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      showError('Invalid Amount', 'Please enter a valid amount.');
      return false;
    }
    return true;
  };

  const handleProcessPayment = async () => {
    if (!validatePayment()) {
      return;
    }

    const formattedAmount = parseFloat(amount).toFixed(2);

    // Show confirmation with detailed information
    const result = await showConfirm(
      'Confirm Payment?',
      `Amount: $${formattedAmount}\nMethod: ${paymentMethod}\n\nPlease review and confirm your payment.`,
      'Proceed with Payment',
      'Cancel'
    );

    if (!result.isConfirmed) {
      showToast('Payment cancelled', 'info', 2000);
      return;
    }

    // Process payment
    try {
      setLoading(true);
      showLoading('Processing payment...');

      // Simulate API call
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: formattedAmount,
          method: paymentMethod,
        }),
      });

      closeAlert();
      setLoading(false);

      if (response.ok) {
        const payment = await response.json();

        // Show success with transaction details
        showCustom(
          'Payment Successful! ✓',
          `
            <div style="text-align: left;">
              <p><strong>Transaction ID:</strong> ${payment.id}</p>
              <p><strong>Amount:</strong> $${formattedAmount}</p>
              <p><strong>Status:</strong> Completed</p>
              <p style="color: green; margin-top: 10px;">A confirmation email has been sent to you.</p>
            </div>
          `,
          'success'
        );

        // Reset form
        setAmount('');
        setPaymentMethod('card');

        // Show quick notification
        showToast('Payment received!', 'success', 3000);

      } else {
        const error = await response.json();
        showError('Payment Failed', error.message || 'Unable to process payment.');
      }
    } catch (error) {
      closeAlert();
      setLoading(false);
      
      // Check if it's a network error
      if (!navigator.onLine) {
        showWarning(
          'No Internet Connection',
          'Please check your connection and try again.'
        );
      } else {
        showError('Payment Error', error.message);
      }
    }
  };

  const handleRefund = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      showError('Invalid Amount', 'Please enter a valid refund amount.');
      return;
    }

    const result = await showConfirm(
      'Request Refund?',
      `Refund Amount: $${parseFloat(amount).toFixed(2)}\n\nAre you sure you want to request a refund?`,
      'Yes, Refund',
      'Cancel'
    );

    if (result.isConfirmed) {
      try {
        showLoading('Processing refund request...');

        const response = await fetch('/api/refunds', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: parseFloat(amount).toFixed(2),
          }),
        });

        closeAlert();

        if (response.ok) {
          const refund = await response.json();
          showSuccess(
            'Refund Requested!',
            `Refund ID: ${refund.id}\nYou will receive your refund within 3-5 business days.`
          );
          setAmount('');
        } else {
          showError('Refund Failed', 'Unable to process refund request.');
        }
      } catch (error) {
        closeAlert();
        showError('Error', error.message);
      }
    }
  };

  const handleQuickAmount = (quickAmount) => {
    setAmount(quickAmount.toString());
    showToast(`Amount set to $${quickAmount}`, 'info', 1500);
  };

  const handleClear = () => {
    if (amount) {
      const result = showConfirm(
        'Clear Form?',
        'Are you sure you want to clear the form?',
        'Yes, Clear',
        'Cancel'
      );

      if (result.isConfirmed) {
        setAmount('');
        setPaymentMethod('card');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Payment</h2>

      {/* Amount Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Amount ($)</label>
        <input
          type="number"
          value={amount}
          onChange={handleAmountChange}
          placeholder="Enter amount"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          step="0.01"
          min="0"
          disabled={loading}
        />
      </div>

      {/* Quick Amount Buttons */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[50, 100, 200].map(quickAmount => (
          <button
            key={quickAmount}
            onClick={() => handleQuickAmount(quickAmount)}
            disabled={loading}
            className="py-2 bg-gray-100 hover:bg-gray-200 rounded disabled:bg-gray-300 text-sm"
          >
            ${quickAmount}
          </button>
        ))}
      </div>

      {/* Payment Method */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Payment Method</label>
        <select
          value={paymentMethod}
          onChange={handlePaymentMethodChange}
          disabled={loading}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
        >
          <option value="card">Credit Card</option>
          <option value="debit">Debit Card</option>
          <option value="paypal">PayPal</option>
          <option value="bank">Bank Transfer</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={handleProcessPayment}
          disabled={loading}
          className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 font-medium"
        >
          {loading ? 'Processing...' : 'Process Payment'}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleRefund}
            disabled={loading}
            className="py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-gray-400 text-sm"
          >
            Request Refund
          </button>
          <button
            onClick={handleClear}
            disabled={loading}
            className="py-2 bg-gray-400 text-white rounded hover:bg-gray-500 disabled:bg-gray-300 text-sm"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Security Notice */}
      <p className="text-xs text-gray-500 mt-4 text-center">
        🔒 Your payment information is secure and encrypted.
      </p>
    </div>
  );
};

export default PaymentFormExample;
