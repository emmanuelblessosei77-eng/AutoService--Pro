const { enqueueEmail } = require('../lib/emailQueue');
const db = require('../db');
const { EmailLogo } = require('../utils/emailLogo');

const NeutralEmailLogo = EmailLogo.replace(/#00AEEF/g, '#4B5563');

// Shared email layout
function emailLayout(bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>AutoService Pro</title>
  <style>
    body{margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#1a1a2e;}
    .wrapper{max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.10);}
    .header{background:linear-gradient(180deg,#f5f5f5 0%,#e5e7eb 100%);padding:28px 40px;text-align:center;}
    .header-logo-wrap{margin-bottom:8px;}
    .header h1{margin:0;color:#6b8e73;font-size:22px;font-weight:800;letter-spacing:-.3px;}
    .header p{margin:4px 0 0;color:#6b7280;font-size:13px;}
    .body{padding:36px 40px;}
    .body p{margin:0 0 16px;font-size:15px;line-height:1.7;color:#374151;}
    .info-box{background:#f8faff;border:1px solid #e0e7ff;border-radius:12px;padding:18px 22px;margin:18px 0;}
    .info-label{font-size:10px;text-transform:uppercase;letter-spacing:.8px;color:#9ca3af;font-weight:700;margin:0 0 4px;}
    .info-value{font-size:15px;font-weight:600;color:#111827;margin:0;}
    .amount-box{background:linear-gradient(135deg,#f1f5f1,#e7efe7);border:1px solid #9db39d;border-radius:12px;padding:22px 24px;margin:18px 0;text-align:center;}
    .amount{font-size:32px;font-weight:800;color:#15803d;line-height:1;margin:0 0 8px;}
    .badge{display:inline-flex;align-items:center;gap:6px;background:#dcfce7;color:#15803d;font-size:12px;font-weight:700;padding:5px 14px;border-radius:20px;}
    .footer{background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;}
    .footer p{margin:0;font-size:12px;color:#9ca3af;line-height:1.7;}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      ${NeutralEmailLogo}
      <h1>AutoService Pro</h1>
      <p>Ghana's Premier Car Service &amp; Repair</p>
    </div>
    <div class="body">${bodyHtml}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} AutoService Pro Ghana. All rights reserved.<br/>
      This is an automated message — please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>`;
}

const sendBookingConfirmation = async (req, res) => {
  try {
    const { bookingId, userEmail, customerName, serviceType, bookingDate, bookingTime, amount } = req.body;

    if (!userEmail || !bookingId) {
      return res.status(400).json({ error: 'userEmail and bookingId are required' });
    }

    const displayAmount = parseFloat(amount || 0).toFixed(2);
    const displayTime = bookingTime ? ` at ${bookingTime}` : '';

    const html = emailLayout(`
      <p>Dear <strong>${customerName || userEmail}</strong>,</p>
      <p>Your service appointment is all set, ${customerName || userEmail}!</p>
      <p>Your booking has been confirmed and your payment received. Here are the details:</p>

      <div class="info-box">
        <p class="info-label">Booking Reference</p>
        <p class="info-value">#${bookingId}</p>
      </div>

      <div class="info-box">
        <p class="info-label">Service</p>
        <p class="info-value">${serviceType || 'Car Service'}</p>
      </div>

      <div class="info-box">
        <p class="info-label">Scheduled Date</p>
        <p class="info-value">${bookingDate || 'To be confirmed'}${displayTime}</p>
      </div>

      <div class="amount-box">
        <p class="info-label" style="color:#15803d;">Total Amount:</p>
        <p class="amount">GH₵${displayAmount}</p>
        <span class="badge">✓ Payment Confirmed</span>
      </div>

      <p>Our team will be in touch to confirm your appointment. Thank you for choosing AutoService Pro!</p>
    `);

    const text = `Booking Confirmed!\n\nDear ${customerName || userEmail},\n\nYour booking #${bookingId} for ${serviceType || 'Car Service'} on ${bookingDate || 'TBD'} has been confirmed.\nAmount paid: GH₵${displayAmount}\n\nThank you for choosing AutoService Pro!`;

    await enqueueEmail({
      to: userEmail,
      subject: `✅ Booking Confirmed — #${bookingId} | AutoService Pro`,
      html,
      text,
    });

    console.log(`📧 Booking confirmation queued for ${userEmail} (booking #${bookingId})`);
    res.json({ success: true, message: 'Confirmation email queued' });
  } catch (err) {
    console.error('❌ sendBookingConfirmation error:', err.message);
    // Non-fatal: return success so payment flow isn't blocked
    res.json({ success: false, message: 'Email queued but may have failed', error: err.message });
  }
};

const sendGenericEmail = async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;
    if (!to || !subject) {
      return res.status(400).json({ error: 'to and subject are required' });
    }
    await enqueueEmail({ to, subject, html, text });
    res.json({ success: true, message: 'Email queued' });
  } catch (err) {
    console.error('❌ sendGenericEmail error:', err.message);
    res.status(500).json({ error: 'Failed to queue email', details: err.message });
  }
};

module.exports = { sendBookingConfirmation, sendGenericEmail };
