const express = require('express');
const router = express.Router();
const usersController = require('../controllers/').user;
const { authenticate } = require('../helpers/auth.helper');

router.post('/signup', usersController.signup);
router.post('/login', usersController.login);
router.get('/profile', authenticate, usersController.currentUser);
router.post('/update-password', authenticate, usersController.updatePassword);
router.post('/forgot-password', usersController.forgotPassword);
router.post('/reset-password', usersController.resetPassword);

module.exports = router;
