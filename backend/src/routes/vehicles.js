const express = require('express');
const router = express.Router();
const vehiclesController = require('../controllers/vehiclesController');
const { authenticate } = require('../middleware/auth');

// Get all vehicles (admin)
router.get('/', vehiclesController.getAll);

// Get vehicles for a specific user
router.get('/user/:userId', vehiclesController.getByUser);

// Get specific vehicle
router.get('/:id', vehiclesController.getById);

// Create new vehicle (allow unauthenticated requests)
router.post('/', vehiclesController.create);

// Update vehicle (authenticated)
router.put('/:id', authenticate, vehiclesController.update);

// Delete vehicle (authenticated)
router.delete('/:id', authenticate, vehiclesController.remove);

module.exports = router;
