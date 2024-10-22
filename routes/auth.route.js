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

// Route to generate 2FA secret
router.post('/generate-2fa', authController.generate2FA);
router.post('/verify-2fa', authController.verify2FA);
// sms
router.post('/sent-sms', authController.sendSms);


module.exports = router;
