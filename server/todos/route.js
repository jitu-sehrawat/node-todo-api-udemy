const express = require('express');
const router = express.Router();
const TodoController = require('./controller');
const { authenticate } = require('../middleware/authenticate');

router.post('/', authenticate, TodoController.create);
router.get('/', authenticate, TodoController.getall);
router.get('/:id', authenticate, TodoController.getById);
router.delete('/:id', authenticate, TodoController.deleteById);
router.put('/:id', authenticate, TodoController.update);

module.exports = router;