const express = require('express');
const router = express.Router();
const { sendBookingConfirmation, sendGenericEmail } = require('../controllers/emailsController');

router.post('/booking-confirmation', sendBookingConfirmation);
router.post('/send', sendGenericEmail);

module.exports = router;
