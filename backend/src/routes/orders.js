const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, ordersController.createOrder);
router.get('/admin/all', ordersController.getAllOrders);
router.get('/:id', authenticate, ordersController.getOrderById);
router.get('/', authenticate, ordersController.getOrdersForUser);
router.put('/:id', authenticate, ordersController.updateOrder);

module.exports = router;
