const express = require('express');
const router = express.Router();
const UserController = require('./controller');
const { authenticate } = require('../middleware/authenticate');

router.post('/', UserController.register);
router.post('/login', UserController.login);

router.get('/me', authenticate, UserController.getMe);
router.delete('/me/token', authenticate, UserController.logout);

module.exports = router;
