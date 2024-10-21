const express = require('express');
const router = express.Router();
const authController = require('../controllers/').auth;
const { authenticate } = require('../helpers/auth.helper');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/profile', authenticate, authController.currentUser);
router.post('/update-password', authenticate, authController.updatePassword);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
