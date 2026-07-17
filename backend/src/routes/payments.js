const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/paymentsController');
const { authenticate } = require('../middleware/auth');

// Initialize payment (start transaction with Paystack)
router.post('/initialize', paymentsController.initializePayment);

// Verify payment (confirm transaction)
router.post('/verify', paymentsController.verifyPayment);

// Check if payment is verified (polling endpoint)
router.get('/check/:reference', paymentsController.checkPaymentVerified);

// More specific routes BEFORE generic ones
// Generate and download invoice for booking (no auth needed - payment reference is verification)
router.get('/invoice/:booking_id', paymentsController.generateInvoice);

// Generate and download invoice for parts order (no auth needed - payment reference is verification)
router.get('/invoice/order/:order_id', paymentsController.generateOrderInvoice);

// Get payment status for a booking
router.get('/status/:booking_id', authenticate, paymentsController.getPaymentStatus);

// Get payment history for a booking
router.get('/history/:booking_id', authenticate, paymentsController.getPaymentHistory);

// Get all payments (admin only) - generic route last
router.get('/', authenticate, paymentsController.getPayments);

// Process refund
router.post('/refund', authenticate, paymentsController.processRefund);

// Paystack webhook (no auth needed)
router.post('/webhook', paymentsController.handlePaystackWebhook);

module.exports = router;
