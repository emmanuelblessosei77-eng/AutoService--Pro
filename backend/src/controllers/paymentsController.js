const db = require('../db');
const axios = require('axios');
const crypto = require('crypto');
const { notifyPaymentReceived } = require('../utils/notificationHelper');

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC = process.env.PAYSTACK_PUBLIC_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

console.log('🔑 Paystack Keys Loaded:');
console.log('  Public Key:', PAYSTACK_PUBLIC ? '✓ Loaded' : '❌ MISSING');
console.log('  Secret Key:', PAYSTACK_SECRET ? '✓ Loaded' : '❌ MISSING');

// Validate amount
const validateAmount = (amount) => {
  return amount > 0 && !isNaN(amount);
};

// Verify Paystack webhook signature
const verifyWebhookSignature = (req) => {
  const signature = req.headers['x-paystack-signature'];
  const body = JSON.stringify(req.body);
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET)
    .update(body)
    .digest('hex');
  return hash === signature;
};

// Initialize Payment - Generate Paystack authorization URL
const initializePayment = async (req, res) => {
  try {
    const { email, amount, booking_id, order_id, full_name, return_url } = req.body;

    // Accept either booking_id (for service bookings) or order_id (for parts orders)
    // OR neither (for new payment-first architecture where booking not created yet)
    const transactionId = booking_id || order_id;
    const transactionType = booking_id ? 'booking' : order_id ? 'order' : 'pending_booking';

    // Validation - Email and amount always required
    if (!email || !amount) {
      return res.status(400).json({ 
        error: 'Email and amount are required'
      });
    }

    // For pending bookings (no booking_id/order_id yet), we'll validate in different way
    // For existing bookings/orders, verify they exist
    let transactionData = null;
    if (transactionType === 'booking' && transactionId) {
      const existingCheck = await db.query(
        'SELECT id, total_cost, parts_cost FROM bookings WHERE id = $1',
        [transactionId]
      );
      transactionData = existingCheck.rows[0];
      if (!transactionData) {
        return res.status(404).json({ error: 'Booking not found' });
      }
    } else if (transactionType === 'order' && transactionId) {
      const existingCheck = await db.query(
        'SELECT id, total_amount FROM orders WHERE id = $1',
        [transactionId]
      );
      transactionData = existingCheck.rows[0];
      if (!transactionData) {
        return res.status(404).json({ error: 'Order not found' });
      }
    }

    // Use provided amount or default to transaction total_cost/total_amount
    let finalAmount = amount;
    if (!finalAmount) {
      if (transactionData) {
        finalAmount = transactionType === 'booking' ? transactionData.total_cost : transactionData.total_amount;
        console.log(`💡 Amount not provided, using ${transactionType} ${transactionType === 'booking' ? 'total_cost' : 'total_amount'}: ${finalAmount}`);
      }
    }

    if (!validateAmount(finalAmount)) {
      return res.status(400).json({ 
        error: 'Amount must be a positive number' 
      });
    }

    // SCENARIO 2 VALIDATION: For existing bookings, validate amount if total_cost is set
    if (transactionType === 'booking' && transactionData) {
      const expectedAmount = parseFloat(transactionData.total_cost) || 0;
      const receivedAmount = parseFloat(finalAmount);

      if (expectedAmount > 0) {
        // Only validate amount when total_cost is explicitly set in the booking
        if (Math.abs(receivedAmount - expectedAmount) > 0.01) {
          return res.status(400).json({
            error: `Payment amount must match booking total cost`,
            expected_amount: expectedAmount,
            received_amount: receivedAmount,
            parts_cost: parseFloat(transactionData.parts_cost) || 0,
            breakdown: `Service price + Approved parts = GH₵${expectedAmount}. You attempted to pay GH₵${receivedAmount}.`
          });
        }
        console.log(`✅ Booking #${transactionId} validation passed - Amount GH₵${receivedAmount} matches total_cost`);
      } else {
        // total_cost not set yet (booking created before price resolved) — accept provided amount
        console.log(`ℹ️  Booking #${transactionId} has no total_cost — using provided amount GH₵${receivedAmount}`);
      }
    }

    // Check for existing pending payment (only if we have a transaction ID)
    if (transactionId) {
      const existingPayment = await db.query(
        `SELECT id FROM payments WHERE ${transactionType === 'booking' ? 'booking_id' : 'order_id'} = $1 AND status = $2`,
        [transactionId, 'pending']
      );

      if (existingPayment.rows[0]) {
        return res.status(400).json({ 
          error: `Pending payment already exists for this ${transactionType}` 
        });
      }
    }

    // Create payment record - supports both existing bookings/orders and pending bookings
    let insertQuery, insertParams;
    if (transactionType === 'booking' && transactionId) {
      insertQuery = `INSERT INTO payments (booking_id, amount, email, status, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, booking_id, amount, reference`;
      insertParams = [transactionId, finalAmount, email, 'pending'];
    } else if (transactionType === 'order' && transactionId) {
      insertQuery = `INSERT INTO payments (order_id, amount, email, status, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, order_id, amount, reference`;
      insertParams = [transactionId, finalAmount, email, 'pending'];
    } else {
      // PAYMENT-FIRST ARCHITECTURE: No booking_id or order_id yet
      // Create standalone payment record for pending service booking (both booking_id and order_id are NULL)
      insertQuery = `INSERT INTO payments (booking_id, order_id, amount, email, status, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, amount, reference`;
      insertParams = [null, null, finalAmount, email, 'pending'];
    }

    const { rows } = await db.query(insertQuery, insertParams);

    const payment = rows[0];

    // Build Paystack payload
    console.log(`💰 Payment amount received: ${finalAmount} GH₵`);
    console.log(`📋 Payment Type: ${transactionType === 'booking' ? `Booking #${transactionId} (Service + Parts)` : `Order #${transactionId}`}`);
    const amountInPesewas = Math.round(finalAmount * 100);
    console.log(`💰 Converting to pesewas: ${amountInPesewas} pesewas (${(amountInPesewas / 100).toFixed(2)} GH₵)`);
    
    const paystackPayload = {
      email,
      amount: amountInPesewas, // Convert to pesewas (Paystack expects smallest unit)
      metadata: {
        full_name,
        payment_id: payment.id,
        transaction_type: transactionType
      }
    };

    // Add transaction ID to metadata (booking_id or order_id)
    if (transactionType === 'booking') {
      paystackPayload.metadata.booking_id = transactionId;
    } else {
      paystackPayload.metadata.order_id = transactionId;
    }

    // Add return URL if provided — Paystack API uses "callback_url", not "redirect_url"
    if (return_url) {
      paystackPayload.callback_url = return_url;
    }

    console.log('📦 Paystack payload metadata:', paystackPayload.metadata);

    // Initialize Paystack transaction
    console.log('🔄 Calling Paystack API...');
    console.log('   Endpoint:', `${PAYSTACK_BASE_URL}/transaction/initialize`);
    console.log('   Auth Header:', `Bearer ${PAYSTACK_SECRET ? PAYSTACK_SECRET.substring(0, 10) + '...' : 'MISSING'}`);
    
    let response;
    let attempts = 0;
    const maxAttempts = 3;
    let lastError;

    // Retry logic for transient network errors
    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`   Attempt ${attempts}/${maxAttempts}...`);

        response = await axios.post(
          `${PAYSTACK_BASE_URL}/transaction/initialize`,
          paystackPayload,
          {
            headers: {
              Authorization: `Bearer ${PAYSTACK_SECRET}`,
              'Content-Type': 'application/json'
            },
            timeout: 15000,
            httpAgent: require('http').globalAgent,
            httpsAgent: require('https').globalAgent
          }
        );

        console.log('✅ Paystack response received');
        break;
      } catch (err) {
        lastError = err;
        if (attempts < maxAttempts) {
          // Transient error, retry
          if (err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
            console.warn(`   ⚠️ Transient error (${err.code}), retrying in 1 second...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
        }
        throw err;
      }
    }

    if (!response) {
      throw lastError || new Error('Failed to get Paystack response after retries');
    }

    res.json({
      success: true,
      publicKey: PAYSTACK_PUBLIC,
      authorization_url: response.data.data.authorization_url,
      access_code: response.data.data.access_code,
      reference: response.data.data.reference,
      payment_id: payment.id
    });
    console.log('✅ Payment initialized successfully with publicKey:', PAYSTACK_PUBLIC ? '✓' : '❌');
  } catch (err) {
    console.error('❌ Payment initialization error:');
    console.error('  - Code:', err.code);
    console.error('  - Message:', err.message);
    console.error('  - Address:', err.address);
    console.error('  - Hostname:', err.hostname);
    console.error('  - Response Status:', err.response?.status);
    console.error('  - Response Data:', err.response?.data);
    console.error('  - Config URL:', err.config?.url);
    console.error('  - Full Error:', err);
    
    // Better error messages
    let details = err.message;
    if (err.code === 'ECONNREFUSED') {
      details = 'Cannot connect to Paystack API - network error';
    } else if (err.code === 'ENOTFOUND') {
      details = `DNS error resolving ${err.hostname || 'api.paystack.co'}`;
    } else if (err.code === 'ETIMEDOUT' || err.message.includes('timeout')) {
      details = 'Paystack API request timed out - please try again';
    } else if (err.code === 'EINVALID' || err.code === 'ERR_TLS_CERT_ALTNAME_INVALID') {
      details = 'SSL/TLS certificate error - check Paystack API endpoint';
    }
    
    res.status(500).json({ 
      error: 'Failed to initialize payment',
      details: details,
      errorCode: err.code
    });
  }
};

// Verify Payment - Confirm transaction with Paystack
const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ error: 'Reference is required' });
    }

    // Local shortcut: if a payment with this reference already exists and is completed,
    // return success without calling Paystack (useful for local testing/simulations).
    try {
      const { rows: existing } = await db.query(
        'SELECT id, booking_id, order_id, amount, status FROM payments WHERE reference = $1 LIMIT 1',
        [reference]
      );
      if (existing[0] && existing[0].status === 'completed') {
        const rec = existing[0];
        const transactionType = rec.booking_id ? 'booking' : (rec.order_id ? 'order' : null);

        // Do not re-send booking confirmation on shortcut re-check path.

        return res.json({
          success: true,
          message: 'Payment already recorded as completed (local)',
          amount: parseFloat(rec.amount),
          booking_id: rec.booking_id,
          order_id: rec.order_id,
          reference,
          transaction_type: transactionType
        });
      }
    } catch (dbCheckErr) {
      console.warn('Local verify shortcut DB check failed:', dbCheckErr.message);
    }

    // Verify transaction with Paystack (with retry logic)
    let response;
    let attempts = 0;
    const maxAttempts = 3;
    let lastError;

    console.log('🔍 Verifying Paystack transaction:', reference);

    while (attempts < maxAttempts) {
      try {
        attempts++;
        response = await axios.get(
          `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
          {
            headers: {
              Authorization: `Bearer ${PAYSTACK_SECRET}`
            },
            timeout: 15000,
            httpAgent: require('http').globalAgent,
            httpsAgent: require('https').globalAgent
          }
        );
        console.log('✅ Paystack verification successful');
        break;
      } catch (err) {
        lastError = err;
        if (attempts < maxAttempts && (err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED')) {
          console.warn(`⚠️ Verification attempt ${attempts} failed (${err.code}), retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          throw err;
        }
      }
    }

    if (!response) {
      throw lastError || new Error('Failed to verify payment after retries');
    }

    const { status, data } = response.data;

    if (status && data.status === 'success') {
      const bookingId = data.metadata?.booking_id;
      const orderId = data.metadata?.order_id;
      const transactionType = bookingId ? 'booking' : (orderId ? 'order' : null);
      const amount = data.amount / 100;

      if (!transactionType) {
        return res.status(400).json({
          success: false,
          message: 'Transaction metadata invalid - no booking_id or order_id found'
        });
      }

      let transactionId = bookingId || orderId;

      // Check if already verified - for both bookings and orders
      let checkQuery, checkParams;
      if (transactionType === 'booking') {
        checkQuery = 'SELECT status FROM payments WHERE booking_id = $1 AND reference = $2';
        checkParams = [transactionId, reference];
      } else {
        checkQuery = 'SELECT status FROM payments WHERE order_id = $1 AND reference = $2';
        checkParams = [transactionId, reference];
      }

      const existingPayment = await db.query(checkQuery, checkParams);

      if (existingPayment.rows[0]?.status === 'completed') {
        return res.json({
          success: true,
          verified: true,
          message: 'Payment already verified',
          booking_id: bookingId,
          order_id: orderId,
          amount,
          reference,
          transaction_type: transactionType
        });
      }

      // Update payment status
      let updateQuery, updateParams;
      if (transactionType === 'booking') {
        updateQuery = `UPDATE payments SET status = $1, reference = $2, updated_at = NOW() 
                       WHERE booking_id = $3`;
        updateParams = ['completed', reference, transactionId];

        // Also update booking: set payment_status and promote pending -> scheduled
        const bookingUpdate = await db.query(
          `UPDATE bookings SET payment_status = $1,
             status = CASE WHEN status = 'pending' THEN 'scheduled' ELSE status END,
             updated_at = NOW()
           WHERE id = $2`,
          ['completed', transactionId]
        );
        console.log(`Booking update (verify): booking_id=${transactionId} rows_affected=${bookingUpdate.rowCount}`);
      } else {
        updateQuery = `UPDATE payments SET status = $1, reference = $2, updated_at = NOW() 
                       WHERE order_id = $3`;
        updateParams = ['completed', reference, transactionId];

        // Also update order status
        await db.query(
          `UPDATE orders SET status = $1, updated_at = NOW() 
           WHERE id = $2`,
          ['completed', transactionId]
        );
      }

      await db.query(updateQuery, updateParams);

      // 🔔 Trigger payment received notification
      console.log('📌 Payment verified - triggering payment received notification');
      try {
        // Fetch the payment record to get payment ID
        let paymentQuery, paymentParams;
        if (transactionType === 'booking') {
          paymentQuery = 'SELECT id FROM payments WHERE booking_id = $1 AND status = $2 LIMIT 1';
          paymentParams = [transactionId, 'completed'];
        } else {
          paymentQuery = 'SELECT id FROM payments WHERE order_id = $1 AND status = $2 LIMIT 1';
          paymentParams = [transactionId, 'completed'];
        }
        
        const paymentRecord = await db.query(paymentQuery, paymentParams);
        if (paymentRecord.rows[0]) {
          await notifyPaymentReceived(paymentRecord.rows[0].id, transactionType);
          console.log('✅ Payment received notification sent');
        }
      } catch (notifErr) {
        console.error('⚠️ Failed to send payment notification:', notifErr.message);
      }

      res.json({
        success: true,
        message: 'Payment verified successfully',
        amount,
        booking_id: bookingId,
        order_id: orderId,
        reference,
        transaction_type: transactionType
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Payment verification failed',
        status: data.status 
      });
    }
  } catch (err) {
    console.error('Payment verification error:', err.response?.data || err.message);
    res.status(500).json({ 
      error: 'Failed to verify payment',
      details: err.response?.data?.message || err.message
    });
  }
};

// Get Payment Status
const getPaymentStatus = async (req, res) => {
  try {
    const { booking_id } = req.params;

    if (!booking_id || isNaN(booking_id)) {
      return res.status(400).json({ error: 'Valid booking_id is required' });
    }

    const { rows } = await db.query(
      `SELECT id, booking_id, amount, status, reference, created_at, updated_at 
       FROM payments WHERE booking_id = $1`,
      [booking_id]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'No payment found for this booking' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch payment status' });
  }
};

// Get All Payments (Admin)
const getPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { rows: payments } = await db.query(
      `SELECT p.id, p.booking_id, p.amount, p.status, p.reference, 
              p.created_at, p.updated_at, 
              u.first_name, u.last_name, u.email as customer_email,
              s.name as service_name
       FROM payments p
       LEFT JOIN bookings b ON p.booking_id = b.id
       LEFT JOIN users u ON b.user_id = u.id
       LEFT JOIN services s ON b.service_id = s.id
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const { rows: countResult } = await db.query('SELECT COUNT(*) FROM payments');
    const total = parseInt(countResult[0].count);

    res.json({
      success: true,
      data: payments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

// Process Refund
const processRefund = async (req, res) => {
  try {
    const { payment_id, reason } = req.body;

    if (!payment_id) {
      return res.status(400).json({ error: 'payment_id is required' });
    }

    // Get payment details
    const { rows: payments } = await db.query(
      'SELECT id, reference, amount, status FROM payments WHERE id = $1',
      [payment_id]
    );

    if (!payments[0]) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = payments[0];

    if (payment.status !== 'completed') {
      return res.status(400).json({ 
        error: `Cannot refund ${payment.status} payment` 
      });
    }

    // Check if already refunded
    const { rows: refundCheck } = await db.query(
      'SELECT id FROM refunds WHERE payment_id = $1 AND status = $2',
      [payment_id, 'approved']
    );

    if (refundCheck[0]) {
      return res.status(400).json({ error: 'Payment already refunded' });
    }

    // Request refund from Paystack
    const refundResponse = await axios.post(
      `${PAYSTACK_BASE_URL}/refund`,
      {
        transaction: payment.reference,
        amount: Math.round(payment.amount * 100)
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (refundResponse.data.status) {
      const refundData = refundResponse.data.data;

      // Record refund in database
      await db.query(
        `INSERT INTO refunds (payment_id, reference, amount, status, reason, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [payment_id, refundData.reference, payment.amount, 'approved', reason || 'No reason provided']
      );

      // Update payment status
      await db.query(
        'UPDATE payments SET status = $1, updated_at = NOW() WHERE id = $2',
        ['refunded', payment_id]
      );

      res.json({
        success: true,
        message: 'Refund processed successfully',
        refund_reference: refundData.reference,
        amount: payment.amount
      });
    } else {
      res.status(400).json({ 
        error: 'Refund processing failed',
        details: refundResponse.data.message 
      });
    }
  } catch (err) {
    console.error('Refund error:', err.response?.data || err.message);
    res.status(500).json({ 
      error: 'Failed to process refund',
      details: err.response?.data?.message || err.message
    });
  }
};

// Webhook - Paystack sends confirmation here
const handlePaystackWebhook = async (req, res) => {
  try {
    // Verify webhook signature
    if (!verifyWebhookSignature(req)) {
      console.log('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { event, data } = req.body;

    if (event === 'charge.success') {
      const { reference, metadata } = data;
      const bookingId = metadata.booking_id;
      const orderId = metadata.order_id;
      const transactionId = bookingId || orderId;
      const transactionType = bookingId ? 'booking' : 'order';

      // Get existing payment
      let checkQuery, checkParams;
      if (transactionType === 'booking') {
        checkQuery = 'SELECT id, status FROM payments WHERE booking_id = $1';
        checkParams = [bookingId];
      } else {
        checkQuery = 'SELECT id, status FROM payments WHERE order_id = $1';
        checkParams = [orderId];
      }

      const { rows: payments } = await db.query(checkQuery, checkParams);

      if (payments[0]?.status !== 'completed') {
        // Update payment
        let updateQuery, updateParams;
        if (transactionType === 'booking') {
          updateQuery = `UPDATE payments SET status = $1, reference = $2, updated_at = NOW() 
                         WHERE booking_id = $3`;
          updateParams = ['completed', reference, bookingId];
        } else {
          updateQuery = `UPDATE payments SET status = $1, reference = $2, updated_at = NOW() 
                         WHERE order_id = $3`;
          updateParams = ['completed', reference, orderId];
        }

        await db.query(updateQuery, updateParams);

        // Update booking or order
        if (transactionType === 'booking') {
          // Mark payment as completed and set booking status to scheduled so it appears in customer dashboards
          await db.query(
            `UPDATE bookings SET payment_status = $1, status = $2, updated_at = NOW() 
             WHERE id = $3`,
            ['completed', 'scheduled', bookingId]
          );
        } else {
          await db.query(
            `UPDATE orders SET status = $1, updated_at = NOW() 
             WHERE id = $2`,
            ['completed', orderId]
          );
        }

        // 🔔 Trigger payment received notification
        console.log('📌 Webhook charge.success - triggering payment received notification');
        try {
          if (payments[0]?.id) {
            await notifyPaymentReceived(payments[0].id, transactionType);
            console.log('✅ Payment received notification sent via webhook');
          }
        } catch (notifErr) {
          console.error('⚠️ Failed to send webhook payment notification:', notifErr.message);
          // Continue even if notification fails
        }

        console.log(`Payment confirmed for ${transactionType} ${transactionId}`);
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Get Payment History
const getPaymentHistory = async (req, res) => {
  try {
    const { booking_id } = req.params;

    if (!booking_id || isNaN(booking_id)) {
      return res.status(400).json({ error: 'Valid booking_id is required' });
    }

    const { rows } = await db.query(
      `SELECT p.id, p.amount, p.status, p.reference, p.created_at, p.updated_at,
              r.id as refund_id, r.reference as refund_reference, r.status as refund_status
       FROM payments p
       LEFT JOIN refunds r ON p.id = r.payment_id
       WHERE p.booking_id = $1
       ORDER BY p.created_at DESC`,
      [booking_id]
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
};

// Generate and Download Invoice
const generateInvoice = async (req, res) => {
  try {
    const { booking_id } = req.params;

    if (!booking_id || isNaN(booking_id)) {
      return res.status(400).json({ error: 'Valid booking_id is required' });
    }

    // Get booking details with payment and service information
    const { rows: bookingData } = await db.query(
      `SELECT b.id as booking_id, b.created_at, b.booking_datetime, b.status,
              u.first_name, u.last_name, u.email, u.phone, u.address, u.city,
              s.name as service_name, s.description as service_description, s.price,
              p.id as payment_id, p.amount, p.status as payment_status, p.reference,
              p.created_at as payment_created_at
       FROM bookings b
       LEFT JOIN users u ON b.user_id = u.id
       LEFT JOIN services s ON b.service_id = s.id
       LEFT JOIN payments p ON b.id = p.booking_id
       WHERE b.id = $1`,
      [booking_id]
    );

    if (!bookingData[0]) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingData[0];

    // Check if payment is completed
    if (booking.payment_status !== 'completed') {
      return res.status(400).json({ 
        error: 'Invoice can only be generated for completed payments',
        payment_status: booking.payment_status 
      });
    }

    // Generate filename with booking ID and current date
    const invoiceDate = new Date().toISOString().split('T')[0];
    const filename = `invoice_${booking_id}_${invoiceDate}.pdf`;

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Generate PDF using PDFKit
    const PDFDocument = require('pdfkit');
    const pdf = new PDFDocument({ margin: 50 });

    // Pipe to response
    pdf.pipe(res);

    // Invoice Header
    pdf.fontSize(24).font('Helvetica-Bold').text('INVOICE', 50, 50);
    pdf.fontSize(10).font('Helvetica').text(`Invoice #${booking_id}`, 50, 80);
    pdf.text(`Date: ${new Date(booking.payment_created_at).toLocaleDateString()}`, 50, 95);
    pdf.text(`Reference: ${booking.reference}`, 50, 110);

    // Company info (left side)
    pdf.fontSize(12).font('Helvetica-Bold').text('Car Service Management', 50, 150);
    pdf.fontSize(10).font('Helvetica')
      .text('Professional Auto Service', 50, 168)
      .text('Phone: +233 XXX XXX XXXX', 50, 183)
      .text('Email: service@carservice.com', 50, 198);

    // Customer info (right side)
    pdf.fontSize(12).font('Helvetica-Bold').text('Bill To:', 350, 150);
    pdf.fontSize(10).font('Helvetica')
      .text(`${booking.first_name} ${booking.last_name}`, 350, 168)
      .text(`Email: ${booking.email}`, 350, 183)
      .text(`Phone: ${booking.phone || 'N/A'}`, 350, 198)
      .text(`Address: ${booking.address || 'N/A'}`, 350, 213)
      .text(`${booking.city || ''}`, 350, 228);

    // Service Details Table
    pdf.moveTo(50, 270).lineTo(550, 270).stroke();
    pdf.fontSize(11).font('Helvetica-Bold');
    pdf.text('Description', 50, 280, { width: 250 });
    pdf.text('Booking Date', 310, 280, { width: 120 });
    pdf.text('Amount', 450, 280, { width: 100, align: 'right' });

    pdf.moveTo(50, 300).lineTo(550, 300).stroke();

    // Service line item
    pdf.fontSize(10).font('Helvetica');
    const serviceText = booking.service_name || 'Service';
    pdf.text(serviceText, 50, 310, { width: 250 });
    pdf.text(new Date(booking.booking_datetime).toLocaleDateString(), 310, 310, { width: 120 });
    pdf.text(`GHS ${parseFloat(booking.amount).toFixed(2)}`, 450, 310, { width: 100, align: 'right' });

    // Total line
    pdf.moveTo(50, 350).lineTo(550, 350).stroke();
    pdf.fontSize(12).font('Helvetica-Bold');
    pdf.text('TOTAL', 50, 360, { width: 400 });
    pdf.text(`GHS ${parseFloat(booking.amount).toFixed(2)}`, 450, 360, { width: 100, align: 'right' });
    pdf.moveTo(50, 380).lineTo(550, 380).stroke();

    // Payment Status
    pdf.fontSize(11).font('Helvetica-Bold').text('Payment Status', 50, 410);
    pdf.fontSize(10).font('Helvetica')
      .text(`Status: ${booking.payment_status.toUpperCase()}`, 50, 428)
      .text(`Reference: ${booking.reference}`, 50, 443)
      .text(`Payment Method: Paystack`, 50, 458);

    // Footer
    pdf.fontSize(9).font('Helvetica').fillColor('#999999');
    pdf.text('Thank you for your business!', 50, 700, { align: 'center' });
    pdf.text('This is an automatically generated invoice. No signature required.', 50, 715, { align: 'center' });

    // Finalize PDF
    pdf.end();

    console.log(`Invoice generated for booking ${booking_id}`);
  } catch (err) {
    console.error('Invoice generation error:', err);
    res.status(500).json({ 
      error: 'Failed to generate invoice',
      details: err.message
    });
  }
};

// Generate invoice for parts order
const generateOrderInvoice = async (req, res) => {
  try {
    const { order_id } = req.params;

    if (!order_id || isNaN(order_id)) {
      return res.status(400).json({ error: 'Valid order_id is required' });
    }

    // Get order details with items and customer information
    const { rows: orderData } = await db.query(
      `SELECT o.id as order_id, o.created_at, o.total_amount, o.status,
              u.first_name, u.last_name, u.email, u.phone, u.address, u.city,
              p.id as payment_id, p.amount, p.status as payment_status, p.reference,
              p.created_at as payment_created_at
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN payments p ON o.id = p.order_id
       WHERE o.id = $1`,
      [order_id]
    );

    if (!orderData[0]) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderData[0];

    // Check if order exists
    if (!order.order_id) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if payment exists
    if (!order.payment_id) {
      console.warn(`⚠️ No payment found for order ${order_id}`);
      return res.status(400).json({ 
        error: 'No payment found for this order. Please complete the payment first.',
        order_id: order_id,
        payment_status: 'not_found' 
      });
    }

    // Check if payment is completed
    if (!order.payment_status) {
      return res.status(400).json({ 
        error: 'Payment status is unknown. Please try again later.',
        payment_status: 'unknown' 
      });
    }

    if (order.payment_status !== 'completed') {
      console.warn(`⚠️ Payment not completed for order ${order_id}. Status: ${order.payment_status}`);
      return res.status(400).json({ 
        error: `Invoice can only be generated for completed payments. Current status: ${order.payment_status}`,
        payment_status: order.payment_status 
      });
    }

    // Get order items
    const { rows: orderItems } = await db.query(
      `SELECT oi.id, oi.quantity, oi.unit_price as price,
              cp.id as part_id, cp.name, cp.description
       FROM order_items oi
       LEFT JOIN car_parts cp ON oi.car_part_id = cp.id
       WHERE oi.order_id = $1
       ORDER BY oi.id ASC`,
      [order_id]
    );

    if (!orderItems || orderItems.length === 0) {
      console.warn(`⚠️ No items found for order ${order_id}`);
      return res.status(400).json({ 
        error: 'Order has no items. Cannot generate invoice.',
        order_id: order_id
      });
    }

    // Generate filename with order ID and current date
    const invoiceDate = new Date().toISOString().split('T')[0];
    const filename = `invoice_order_${order_id}_${invoiceDate}.pdf`;

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Generate PDF using PDFKit
    const PDFDocument = require('pdfkit');
    const pdf = new PDFDocument({ margin: 50 });

    // Pipe to response
    pdf.pipe(res);

    // Invoice Header
    pdf.fontSize(24).font('Helvetica-Bold').text('INVOICE', 50, 50);
    pdf.fontSize(10).font('Helvetica').text(`Invoice #${order_id}`, 50, 80);
    pdf.text(`Date: ${new Date(order.payment_created_at).toLocaleDateString()}`, 50, 95);
    pdf.text(`Reference: ${order.reference}`, 50, 110);

    // Company info (left side)
    pdf.fontSize(12).font('Helvetica-Bold').text('Car Service Management', 50, 150);
    pdf.fontSize(10).font('Helvetica')
      .text('Professional Auto Parts & Service', 50, 168)
      .text('Phone: +233 XXX XXX XXXX', 50, 183)
      .text('Email: parts@carservice.com', 50, 198);

    // Customer info (right side)
    pdf.fontSize(12).font('Helvetica-Bold').text('Bill To:', 350, 150);
    pdf.fontSize(10).font('Helvetica')
      .text(`${order.first_name} ${order.last_name}`, 350, 168)
      .text(`Email: ${order.email}`, 350, 183)
      .text(`Phone: ${order.phone || 'N/A'}`, 350, 198)
      .text(`Address: ${order.address || 'N/A'}`, 350, 213)
      .text(`${order.city || ''}`, 350, 228);

    // Items Table Header
    pdf.moveTo(50, 270).lineTo(550, 270).stroke();
    pdf.fontSize(11).font('Helvetica-Bold');
    pdf.text('Part Name', 50, 280, { width: 200 });
    pdf.text('Qty', 260, 280, { width: 50 });
    pdf.text('Unit Price', 320, 280, { width: 80 });
    pdf.text('Total', 450, 280, { width: 100, align: 'right' });

    pdf.moveTo(50, 300).lineTo(550, 300).stroke();

    // Order items
    let yPosition = 310;
    pdf.fontSize(10).font('Helvetica');
    
    orderItems.forEach((item) => {
      const itemTotal = (item.quantity * parseFloat(item.price)).toFixed(2);
      pdf.text(item.name || 'Part', 50, yPosition, { width: 200 });
      pdf.text(item.quantity.toString(), 260, yPosition, { width: 50 });
      pdf.text(`GHS ${parseFloat(item.price).toFixed(2)}`, 320, yPosition, { width: 80 });
      pdf.text(`GHS ${itemTotal}`, 450, yPosition, { width: 100, align: 'right' });
      yPosition += 20;
    });

    // Total line
    pdf.moveTo(50, yPosition + 10).lineTo(550, yPosition + 10).stroke();
    pdf.fontSize(12).font('Helvetica-Bold');
    pdf.text('TOTAL', 50, yPosition + 20, { width: 400 });
    pdf.text(`GHS ${parseFloat(order.total_amount).toFixed(2)}`, 450, yPosition + 20, { width: 100, align: 'right' });
    pdf.moveTo(50, yPosition + 40).lineTo(550, yPosition + 40).stroke();

    // Payment Status
    pdf.fontSize(11).font('Helvetica-Bold').text('Payment Status', 50, yPosition + 70);
    pdf.fontSize(10).font('Helvetica')
      .text(`Status: ${order.payment_status.toUpperCase()}`, 50, yPosition + 88)
      .text(`Reference: ${order.reference}`, 50, yPosition + 103)
      .text(`Payment Method: Paystack`, 50, yPosition + 118);

    // Footer
    pdf.fontSize(9).font('Helvetica').fillColor('#999999');
    pdf.text('Thank you for your business!', 50, 700, { align: 'center' });
    pdf.text('This is an automatically generated invoice. No signature required.', 50, 715, { align: 'center' });

    // Finalize PDF
    pdf.end();

    console.log(`Invoice generated for order ${order_id}`);
  } catch (err) {
    console.error('Order invoice generation error:', err);
    res.status(500).json({ 
      error: 'Failed to generate invoice',
      details: err.message
    });
  }
};

// Check Payment Verified - Poll endpoint to check if payment has been verified
const checkPaymentVerified = async (req, res) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({ 
        verified: false, 
        error: 'Payment reference required' 
      });
    }

    console.log(`🔍 [checkPaymentVerified] Checking reference: ${reference}`);

    // Query database for payment record
    const { rows } = await db.query(
      `SELECT id, booking_id, order_id, amount, status, reference, created_at 
       FROM payments WHERE reference = $1 LIMIT 1`,
      [reference]
    );

    if (!rows[0]) {
      console.log(`⚠️ No payment found for reference: ${reference}`);
      return res.json({ 
        verified: false, 
        status: 'not_found',
        message: 'Payment reference not found in system'
      });
    }

    const payment = rows[0];
    console.log(`   Payment found - Status: ${payment.status}`);

    // Return whether payment is verified
    if (payment.status === 'completed') {
      console.log(`✅ Payment is COMPLETED`);
      return res.json({
        verified: true,
        payment_id: payment.id,
        booking_id: payment.booking_id,
        order_id: payment.order_id,
        amount: payment.amount,
        status: payment.status
      });
    } else {
      console.log(`⏳ Payment is ${payment.status} (not completed yet)`);
      return res.json({
        verified: false,
        payment_id: payment.id,
        status: payment.status,
        message: `Payment is ${payment.status}, not completed yet`
      });
    }

  } catch (err) {
    console.error('❌ checkPaymentVerified error:', err);
    return res.status(500).json({
      verified: false,
      error: 'Failed to check payment status',
      details: err.message
    });
  }
};

module.exports = {
  initializePayment,
  verifyPayment,
  checkPaymentVerified,
  getPaymentStatus,
  getPayments,
  processRefund,
  handlePaystackWebhook,
  getPaymentHistory,
  generateInvoice,
  generateOrderInvoice
};
