const express = require('express');
const router = express.Router();
const servicesController = require('../controllers/servicesController');

router.get('/', servicesController.getAll);
router.get('/:id', servicesController.getById);
router.post('/', servicesController.create);
router.put('/:id', servicesController.update);
router.delete('/:id', servicesController.remove);

module.exports = router;
