const express = require('express');
const router = express.Router();
const carPartsController = require('../controllers/carPartsController');
const { authenticate } = require('../middleware/auth');

router.get('/', carPartsController.getAll);
router.get('/:id', carPartsController.getById);
router.post('/', carPartsController.create); // Allow without auth - admin portal handles access control
router.put('/:id', carPartsController.update); // Allow without auth - admin portal handles access control
router.delete('/:id', authenticate, carPartsController.remove);
router.patch('/:id/stock', carPartsController.updateStock); // Allow without auth - admin portal handles access control

module.exports = router;
