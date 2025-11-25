const express = require('express');
const {
  initializePayment,
  verifyPayment,
  manualVerify
} = require('../controllers/paymentController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/initialize', auth, initializePayment);
router.post('/verify', verifyPayment); // Chapa webhook
router.get('/verify/:transactionId', manualVerify);

module.exports = router;