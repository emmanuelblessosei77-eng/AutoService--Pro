const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookingsController');
const { authenticate } = require('../middleware/auth');

router.get('/', bookingsController.getAll);
router.get('/user/:userId', bookingsController.getByUser);
router.get('/status/:status', bookingsController.getByStatus);
router.get('/mechanic/:mechanicId', bookingsController.getByMechanic);
router.get('/:id', bookingsController.getById);
router.post('/', bookingsController.create); // Allow without auth - admin portal handles access control
router.put('/:id', bookingsController.update); // Allow without auth - admin portal handles access control
router.delete('/:id', authenticate, bookingsController.remove);

module.exports = router;
