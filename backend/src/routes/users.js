const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

// Specific routes must come before parameterized routes
router.get('/profile', usersController.getProfile);
router.put('/profile', usersController.updateProfile);
router.get('/role/:role', usersController.getByRole);
router.put('/role-update/:id', usersController.updateRole);

router.get('/', usersController.getAll);
router.get('/:id', usersController.getById);
router.post('/', usersController.create);
router.put('/:id', usersController.update);
router.delete('/:id', usersController.remove);

module.exports = router;
