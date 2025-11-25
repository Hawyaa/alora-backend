const express = require('express');
const {
  getOrders,
  getOrder
} = require('../controllers/orderController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', getOrders);
router.get('/:orderId', getOrder);

module.exports = router;