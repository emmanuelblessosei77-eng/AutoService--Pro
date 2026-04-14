// Notification utilities for creating notifications across the app
const db = require('../db');
const { enqueueEmail } = require('../lib/emailQueue');
const { EmailLogo } = require('../utils/emailLogo');

const NeutralEmailLogo = EmailLogo.replace(/#00AEEF/g, '#4B5563');

// ─── Shared email layout wrapper ───────────────────────────────────────────────
function emailLayout(bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>AutoService Pro</title>
  <style>
    * { box-sizing: border-box; }
    body { margin:0; padding:0; background:#f0f4f8; font-family:'Segoe UI', Helvetica, Arial, sans-serif; color:#1a1a2e; }
    .wrapper { max-width:600px; margin:40px auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,.10); }
    /* Header */
    .header { background:linear-gradient(180deg, #f5f5f5 0%, #e5e7eb 100%); padding:28px 40px; text-align:center; }
    .header-logo-wrap { margin-bottom:8px; }
    .header h1 { margin:0; color:#6b8e73; font-size:22px; font-weight:800; letter-spacing:-.3px; }
    .header-tagline { margin:4px 0 0; color:#6b7280; font-size:13px; letter-spacing:.2px; }
    /* Body */
    .body { padding:36px 40px; }
    .body p { margin:0 0 18px; font-size:15px; line-height:1.7; color:#374151; }
    .body p:last-child { margin-bottom:0; }
    /* Info boxes */
    .info-box { background:#f8faff; border:1px solid #e0e7ff; border-radius:12px; padding:18px 22px; margin:18px 0; }
    .info-box-green { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:18px 22px; margin:18px 0; }
    .info-label { font-size:10px; text-transform:uppercase; letter-spacing:.8px; color:#9ca3af; font-weight:700; margin:0 0 6px; }
    .info-value { font-size:15px; font-weight:600; color:#111827; margin:0; }
    /* Amount */
    .amount-box { background:linear-gradient(135deg, #f1f5f1 0%, #e7efe7 100%); border:1px solid #9db39d; border-radius:12px; padding:22px 24px; margin:18px 0; text-align:center; }
    .amount { font-size:32px; font-weight:800; color:#15803d; line-height:1; margin:0 0 8px; }
    .badge { display:inline-flex; align-items:center; gap:6px; background:#dcfce7; color:#15803d; font-size:12px; font-weight:700; padding:5px 14px; border-radius:20px; border:1px solid #bbf7d0; }
    /* Divider */
    .divider { border:none; border-top:1px solid #e5e7eb; margin:28px 0; }
    /* CTA Button */
    .cta-wrap { text-align:center; margin:28px 0 8px; }
    .cta-btn { display:inline-block; background:linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%); color:#ffffff !important; text-decoration:none; padding:14px 36px; border-radius:10px; font-size:14px; font-weight:700; letter-spacing:.2px; box-shadow:0 4px 12px rgba(29,78,216,.25); }
    /* Note text */
    .note { font-size:13px; color:#9ca3af; line-height:1.6; }
    /* Footer */
    .footer { background:#f9fafb; border-top:1px solid #e5e7eb; padding:24px 40px; text-align:center; }
    .footer p { margin:0; font-size:12px; color:#9ca3af; line-height:1.7; }
    .footer a { color:#6b7280; text-decoration:underline; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      ${NeutralEmailLogo}
      <h1>AutoService Pro</h1>
      <p class="header-tagline">Ghana's Premier Car Service &amp; Repair</p>
    </div>
    <div class="body">${bodyHtml}</div>
    <div class="footer">
      <p>
        © ${new Date().getFullYear()} AutoService Pro Ghana. All rights reserved.<br/>
        This is an automated message — please do not reply directly to this email.<br/>
        <a href="${process.env.APP_URL || 'http://localhost:5173'}">Visit our website</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Create a notification for a user
 * @param {number} userId - The user to notify
 * @param {string} type - Notification type: 'reminder', 'alert', 'info', 'success', 'error'
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {Object} options - Additional options
 * @param {string} options.actionUrl - URL to navigate to when notification is clicked
 * @param {string} options.relatedEntityType - Type of related entity (booking, service, payment, part_request, order)
 * @param {number} options.relatedEntityId - ID of related entity
 * @returns {Promise<Object>} Created notification object
 */
const createNotification = async (userId, type, title, message, options = {}) => {
  try {
    const { actionUrl, relatedEntityType, relatedEntityId } = options;

    const query = `
      INSERT INTO notifications (user_id, type, title, message, action_url, related_entity_type, related_entity_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `;

    const result = await db.query(query, [
      userId,
      type,
      title,
      message,
      actionUrl || null,
      relatedEntityType || null,
      relatedEntityId || null
    ]);

    console.log(`✉️ Notification created for user ${userId}:`, result.rows[0]);
    return result.rows[0];
  } catch (err) {
    console.error('❌ Error creating notification:', err.message);
    return null;
  }
};

/**
 * Create notification for part request approval
 */
const notifyPartRequestApproved = async (partRequestId, approverId) => {
  try {
    // Get part request details
    const prQuery = `
      SELECT pr.*, b.user_id as customer_id, b.id as booking_id,
             m.first_name as mechanic_first_name, m.last_name as mechanic_last_name
      FROM part_requests pr
      JOIN bookings b ON pr.booking_id = b.id
      JOIN users m ON pr.mechanic_id = m.id
      WHERE pr.id = $1
    `;

    const prResult = await db.query(prQuery, [partRequestId]);
    if (!prResult.rows[0]) return null;

    const partRequest = prResult.rows[0];
    const mechanicName = `${partRequest.mechanic_first_name} ${partRequest.mechanic_last_name}`;

    // Notify mechanic that their part request was approved
    await createNotification(
      partRequest.mechanic_id,
      'success',
      'Part Request Approved ✅',
      `Your request for ${partRequest.part_name} (Qty: ${partRequest.quantity}) has been approved by admin.`,
      {
        actionUrl: '/dashboard?tab=bookings',
        relatedEntityType: 'part_request',
        relatedEntityId: partRequestId
      }
    );

    // Notify customer that parts have been approved for their booking
    await createNotification(
      partRequest.customer_id,
      'info',
      'Service Parts Approved',
      `Parts requested by your mechanic (${mechanicName}) for your service have been approved and will be used.`,
      {
        actionUrl: '/dashboard?tab=bookings',
        relatedEntityType: 'booking',
        relatedEntityId: partRequest.booking_id
      }
    );

    console.log('📦 Part request approval notifications sent');
  } catch (err) {
    console.error('❌ Error notifying part request approval:', err.message);
  }
};

/**
 * Create notification for part request rejection
 */
const notifyPartRequestRejected = async (partRequestId, reason) => {
  try {
    const prQuery = `
      SELECT pr.*, b.user_id as customer_id, b.id as booking_id,
             m.first_name as mechanic_first_name, m.last_name as mechanic_last_name
      FROM part_requests pr
      JOIN bookings b ON pr.booking_id = b.id
      JOIN users m ON pr.mechanic_id = m.id
      WHERE pr.id = $1
    `;

    const prResult = await db.query(prQuery, [partRequestId]);
    if (!prResult.rows[0]) return null;

    const partRequest = prResult.rows[0];
    const mechanicName = `${partRequest.mechanic_first_name} ${partRequest.mechanic_last_name}`;

    // Notify mechanic
    await createNotification(
      partRequest.mechanic_id,
      'alert',
      'Part Request Rejected ❌',
      `Your request for ${partRequest.part_name} (Qty: ${partRequest.quantity}) has been rejected${reason ? `. Reason: ${reason}` : '.'}`,
      {
        actionUrl: '/dashboard?tab=bookings',
        relatedEntityType: 'part_request',
        relatedEntityId: partRequestId
      }
    );

    // Notify customer
    await createNotification(
      partRequest.customer_id,
      'alert',
      'Service Parts Request Rejected',
      `The parts requested by mechanic ${mechanicName} for your service could not be approved${reason ? `. Reason: ${reason}` : '.'}`,
      {
        actionUrl: '/dashboard?tab=bookings',
        relatedEntityType: 'booking',
        relatedEntityId: partRequest.booking_id
      }
    );

    console.log('❌ Part request rejection notifications sent');
  } catch (err) {
    console.error('❌ Error notifying part request rejection:', err.message);
  }
};

/**
 * Create notification for service completion
 */
const notifyServiceCompleted = async (bookingId) => {
  try {
    const bookingQuery = `
      SELECT b.*,
             u.first_name as customer_first_name, u.last_name as customer_last_name, u.id as customer_id,
             u.email as customer_email,
             m.first_name as mechanic_first_name, m.last_name as mechanic_last_name, m.id as mechanic_id,
             s.name as service_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN users m ON b.mechanic_assigned = m.id
      LEFT JOIN services s ON b.service_id = s.id
      WHERE b.id = $1
    `;

    const bookingResult = await db.query(bookingQuery, [bookingId]);
    if (!bookingResult.rows[0]) return null;

    const booking = bookingResult.rows[0];
    const serviceName = booking.service_name || 'Car Service';
    const mechanicName = booking.mechanic_first_name && booking.mechanic_last_name
      ? `${booking.mechanic_first_name} ${booking.mechanic_last_name}`
      : 'Our mechanic';
    const customerName = [booking.customer_first_name, booking.customer_last_name].filter(Boolean).join(' ') || 'Valued Customer';
    const finalAmount = parseFloat(booking.total_cost || 0).toFixed(2);

    // Send service completion email to customer
    if (booking.customer_email) {
      const emailHtml = emailLayout(`
        <p>Dear <strong>${customerName}</strong>,</p>
        <p>Your vehicle is ready for pickup, ${customerName}!</p>
        <p>Great news! Your car service has been completed and your vehicle is ready for pickup.</p>

        <div class="info-box">
          <p class="info-label">Booking Reference</p>
          <p class="info-value">#${bookingId}</p>
        </div>

        <div class="info-box">
          <p class="info-label">Service Completed</p>
          <p class="info-value">${serviceName}</p>
        </div>

        <div class="info-box">
          <p class="info-label">Completed By</p>
          <p class="info-value">${mechanicName}</p>
        </div>

        <div class="amount-box">
          <p class="info-label" style="color:#15803d;">Total Amount:</p>
          <p class="amount">GH₵${finalAmount}</p>
          <span class="badge">✓ Ready for Pickup</span>
        </div>

        <div class="info-box-green">
          <p class="info-label">Status</p>
          <p class="info-value" style="color:#15803d;">✅ Service Completed — Vehicle Ready for Pickup</p>
        </div>

        <hr class="divider" />
        <p>Thank you for choosing AutoService Pro. Your vehicle is ready whenever you are.</p>
      `);

      enqueueEmail({
        to: booking.customer_email,
        subject: `✅ Service Complete — Your Vehicle is Ready | AutoService Pro`,
        text: `Dear ${customerName},\n\nYour ${serviceName} service (Booking #${bookingId}) has been completed by ${mechanicName}. Your vehicle is ready for pickup!\n\nThank you for choosing AutoService Pro!`,
        html: emailHtml,
      }).catch((err) => console.error('⚠️ Failed to queue service completion email:', err.message));
    }

    // Notify customer via in-app notification
    await createNotification(
      booking.customer_id,
      'success',
      'Service Completed Successfully ✅',
      `Your ${serviceName} service has been completed by ${mechanicName}. Your vehicle is ready for pickup!`,
      {
        actionUrl: '/dashboard?tab=bookings',
        relatedEntityType: 'booking',
        relatedEntityId: bookingId
      }
    );

    // Notify mechanic (if assigned)
    if (booking.mechanic_id) {
      await createNotification(
        booking.mechanic_id,
        'success',
        'Service Marked Complete ✓',
        `You have successfully completed the ${serviceName} service for booking #${bookingId}.`,
        {
          actionUrl: '/dashboard?tab=bookings',
          relatedEntityType: 'booking',
          relatedEntityId: bookingId
        }
      );
    }

    console.log('✅ Service completion notifications + email sent');
  } catch (err) {
    console.error('❌ Error notifying service completion:', err.message);
  }
};

/**
 * Create notification for booking confirmation
 */
const notifyBookingConfirmed = async (bookingId, mechanicId) => {
  try {
    const bookingQuery = `
      SELECT b.*,
             u.first_name as customer_first_name, u.last_name as customer_last_name, u.id as customer_id,
             s.name as service_name,
             m.first_name as mechanic_first_name, m.last_name as mechanic_last_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN users m ON b.mechanic_assigned = m.id
      WHERE b.id = $1
    `;

    const bookingResult = await db.query(bookingQuery, [bookingId]);
    if (!bookingResult.rows[0]) return null;

    const booking = bookingResult.rows[0];
    const bookingDate = new Date(booking.booking_datetime).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const mechanicName = booking.mechanic_first_name && booking.mechanic_last_name
      ? `${booking.mechanic_first_name} ${booking.mechanic_last_name}`
      : 'Our team';

    // Notify customer
    await createNotification(
      booking.customer_id,
      'success',
      'Booking Confirmed ✅',
      `Your ${booking.service_name} service for ${bookingDate} has been confirmed. Mechanic: ${mechanicName}`,
      {
        actionUrl: '/dashboard?tab=bookings',
        relatedEntityType: 'booking',
        relatedEntityId: bookingId
      }
    );

    // Notify mechanic
    if (mechanicId || booking.mechanic_assigned) {
      await createNotification(
        mechanicId || booking.mechanic_assigned,
        'info',
        'New Booking Assigned 📋',
        `You have been assigned to a ${booking.service_name} service for ${bookingDate}`,
        {
          actionUrl: '/dashboard?tab=bookings',
          relatedEntityType: 'booking',
          relatedEntityId: bookingId
        }
      );
    }

    console.log('✅ Booking confirmation notifications sent');
  } catch (err) {
    console.error('❌ Error notifying booking confirmation:', err.message);
  }
};

/**
 * Create notification for payment received
 */
const notifyPaymentReceived = async (paymentId, transactionType = 'booking') => {
  try {
    let paymentQuery;

    if (transactionType === 'booking') {
      paymentQuery = `
        SELECT p.*, b.user_id as customer_id, b.id as booking_id,
               b.booking_datetime,
               s.name as service_name,
               u.first_name, u.last_name, u.email as customer_email
        FROM payments p
        JOIN bookings b ON p.booking_id = b.id
        LEFT JOIN services s ON b.service_id = s.id
        JOIN users u ON b.user_id = u.id
        WHERE p.id = $1
      `;
    } else {
      paymentQuery = `
        SELECT p.*, o.user_id as customer_id, o.id as order_id,
               u.first_name, u.last_name, u.email as customer_email
        FROM payments p
        JOIN orders o ON p.order_id = o.id
        JOIN users u ON o.user_id = u.id
        WHERE p.id = $1
      `;
    }

    const paymentResult = await db.query(paymentQuery, [paymentId]);
    if (!paymentResult.rows[0]) return null;

    const payment = paymentResult.rows[0];
    const amount = parseFloat(payment.amount).toFixed(2);
    const customerName = [payment.first_name, payment.last_name].filter(Boolean).join(' ') || 'Valued Customer';

    let title, message, actionUrl, relatedEntityType, relatedEntityId;

    if (transactionType === 'booking') {
      title = 'Payment Received ✅';
      message = `Your payment of GH₵${amount} for ${payment.service_name} has been successfully processed.`;
      actionUrl = '/customer/bookings';
      relatedEntityType = 'booking';
      relatedEntityId = payment.booking_id;
      // Booking confirmation email is handled in the payment notification flow.

    } else {
      title = 'Order Payment Received ✅';
      message = `Your payment of GH₵${amount} for your parts order has been successfully processed.`;
      actionUrl = '/customer/parts';
      relatedEntityType = 'order';
      relatedEntityId = payment.order_id;

      // Intentionally no email here: order-received email is already sent at order creation.
    }

    await createNotification(
      payment.customer_id,
      'success',
      title,
      message,
      { actionUrl, relatedEntityType, relatedEntityId }
    );

    console.log('💳 Payment received in-app notification sent');
  } catch (err) {
    console.error('❌ Error notifying payment received:', err.message);
  }
};

/**
 * Create notification for new payment request
 */
const notifyPaymentDue = async (bookingId) => {
  try {
    const bookingQuery = `
      SELECT b.*,
             u.first_name as customer_first_name, u.last_name as customer_last_name, u.id as customer_id,
             s.name as service_name, s.price as service_price
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN services s ON b.service_id = s.id
      WHERE b.id = $1
    `;

    const bookingResult = await db.query(bookingQuery, [bookingId]);
    if (!bookingResult.rows[0]) return null;

    const booking = bookingResult.rows[0];
    const amount = parseFloat(booking.service_price || 0).toFixed(2);

    await createNotification(
      booking.customer_id,
      'reminder',
      'Payment Due for Your Service',
      `Please complete your payment of GH₵${amount} for your ${booking.service_name} service.`,
      {
        actionUrl: '/dashboard?tab=bookings',
        relatedEntityType: 'booking',
        relatedEntityId: bookingId
      }
    );

    console.log('⏰ Payment due reminder sent');
  } catch (err) {
    console.error('❌ Error notifying payment due:', err.message);
  }
};

module.exports = {
  createNotification,
  notifyPartRequestApproved,
  notifyPartRequestRejected,
  notifyServiceCompleted,
  notifyBookingConfirmed,
  notifyPaymentReceived,
  notifyPaymentDue
};
