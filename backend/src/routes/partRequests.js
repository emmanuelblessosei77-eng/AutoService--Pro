const express = require('express');
const router = express.Router();
const partRequestsController = require('../controllers/partRequestsController');
const { authenticate } = require('../middleware/auth');

router.get('/', partRequestsController.getAll);
router.get('/mechanic/mine', authenticate, partRequestsController.getMine);
router.get('/:id', partRequestsController.getById);
router.post('/', authenticate, partRequestsController.create);
router.put('/:id', partRequestsController.update);
router.delete('/:id', partRequestsController.remove);

module.exports = router;
