const {
  isPasswordMatch,
  signAccessToken,
  getHashValue,
  generateResetToken,
} = require('../helpers/hash.helper');
const { RESPONSE_MESSAGES } = require('../config/constant');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { dummyUsers } = require('../models/User');

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = dummyUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (!user) {
      return res
        .status(404)
        .json({ message: RESPONSE_MESSAGES.ACCOUNT_NOT_FOUND, success: false });
    }
    const isMatch = await isPasswordMatch(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: RESPONSE_MESSAGES.INVALID_PASSWORD, success: false });
    }

    const token = await signAccessToken(user);
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({
      success: true,
      token: token,
      user: userWithoutPassword,
    });
  } catch (e) {
    return res.status(500).json({ message: e.message, success: false });
  }
};

module.exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        message: RESPONSE_MESSAGES.REQUIRED_FIELDS_EMPTY,
        success: false,
      });
    }
    const existingUser = dummyUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (existingUser) {
      return res.status(409).json({
        message: RESPONSE_MESSAGES.EMAIL_ALREADY_EXISTS,
        success: false,
      });
    }
    const hashedPassword = await getHashValue(password);
    const newUser = {
      id: dummyUsers.length + 1,
      name: name,
      email: email.toLowerCase(),
      password: hashedPassword,
      resetToken: null,
      twoFASecret: null,
    };
    dummyUsers.push(newUser);
    const { password: _, ...newUserWithoutPassword } = newUser;
    return res.status(201).json({
      success: true,
      user: newUserWithoutPassword,
      message: RESPONSE_MESSAGES.ACCOUNT_CREATED_SUCCESSFULLY,
    });
  } catch (e) {
    return res.status(500).json({ message: e.message, success: false });
  }
};

module.exports.currentUser = async (req, res) => {
  try {
    const user = dummyUsers.find((u) => u.id === req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ message: RESPONSE_MESSAGES.USER_NOT_FOUND, success: false });
    }
    const { password: _, ...userWithoutPassword } = user;
    return res
      .status(200)
      .json({ success: true, profile: userWithoutPassword });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

module.exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: RESPONSE_MESSAGES.CURRENT_AND_NEW_PASSWORD_REQUIRED,
        success: false,
      });
    }
    const user = dummyUsers.find((u) => u.id === req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ message: RESPONSE_MESSAGES.USER_NOT_FOUND, success: false });
    }
    const isMatch = await isPasswordMatch(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: RESPONSE_MESSAGES.CURRENT_PASSWORD_INCORRECT,
        success: false,
      });
    }
    const hashedPassword = await getHashValue(newPassword);
    user.password = hashedPassword;
    return res.status(200).json({
      success: true,
      message: RESPONSE_MESSAGES.PASSWORD_UPDATED_SUCCESSFULLY,
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

module.exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ message: RESPONSE_MESSAGES.EMAIL_REQUIRED, success: false });
    }
    const user = dummyUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (!user) {
      return res
        .status(404)
        .json({ message: RESPONSE_MESSAGES.USER_NOT_FOUND, success: false });
    }
    const resetToken = generateResetToken();
    user.resetToken = resetToken;
    // Send resetToken to user's email (implementation not shown)
    return res.status(200).json({
      success: true,
      message: RESPONSE_MESSAGES.PASSWORD_RESET_TOKEN_SENT,
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

module.exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res.status(400).json({
        message: RESPONSE_MESSAGES.RESET_TOKEN_AND_NEW_PASSWORD_REQUIRED,
        success: false,
      });
    }
    const user = dummyUsers.find((u) => u.resetToken === resetToken);
    if (!user) {
      return res.status(404).json({
        message: RESPONSE_MESSAGES.INVALID_RESET_TOKEN,
        success: false,
      });
    }
    const hashedPassword = await getHashValue(newPassword);
    user.password = hashedPassword;
    user.resetToken = null;
    return res.status(200).json({
      success: true,
      message: RESPONSE_MESSAGES.PASSWORD_RESET_SUCCESSFULLY,
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

module.exports.generate2FA = async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: 'User ID is required' });
    }

    const user = dummyUsers.find((u) => u.id === userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const secret = speakeasy.generateSecret({ name: 'YourAppName' });
    user.twoFASecret = secret.base32;

    // Generate QR code
    QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: 'Error generating QR code' });
      }
      res.status(200).json({ success: true, qrCode: data_url });
    });
  } catch (error) {
    console.error('Error generating 2FA:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports.verify2FA = async (req, res) => {
  try {
    const { token, userId } = req.body;
    if (!token || !userId) {
      return res
        .status(400)
        .json({ success: false, message: 'Token and user ID are required' });
    }

    const user = dummyUsers.find((u) => u.id === userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }
    if (!user.twoFASecret) {
      return res
        .status(404)
        .json({ success: false, message: '2FA secret not found' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: 'base32',
      token: token,
    });

    if (!verified) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid 2FA token' });
    }

    res.status(200).json({ success: true, verified: verified });
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports.sendSms = async (req, res) => {
  try {
    const { to, body } = req.body;
    if (!to || !body) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'Recipient number and message body are required',
        });
    }

    const smsHelper = require('../helpers/sms.helper');
    await smsHelper.sendSms(to, body);

    res.status(200).json({ success: true, message: 'SMS sent successfully' });
  } catch (error) {
    console.error('Error sending SMS:', error);

    if (error.status === 401 && error.code === 20003) {
      res.status(401).json({
        success: false,
        message: 'Authentication Error - invalid username',
        moreInfo: error.moreInfo,
      });
    } else {
      res.status(500).json({ success: false, message: error.message});
    }
  }
};
