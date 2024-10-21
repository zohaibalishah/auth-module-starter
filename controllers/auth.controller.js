const Users = require('../models/User');
const {
  isPasswordMatch,
  signAccessToken,
  getHashValue,
  generateResetToken,
} = require('../helpers/hash.helper');
const { RESPONSE_MESSAGES } = require('../config/constant');

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({
      where: { email: email.toLowerCase() },
    });
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

    await Users.update(
      { lastLogin: new Date() },
      {
        where: { id: user.id },
      }
    );
    const token = await signAccessToken(user);
    const { password: _, ...userWithoutPassword } = user.toJSON();
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
    const existingUser = await Users.findOne({
      where: { email: email.toLowerCase() },
    });
    if (existingUser) {
      return res.status(409).json({
        message: RESPONSE_MESSAGES.EMAIL_ALREADY_EXISTS,
        success: false,
      });
    }
    const hashedPassword = await getHashValue(password);
    const newUser = await Users.create({
      name: name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });
    const { password: _, ...newUserWithoutPassword } = newUser.toJSON();
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
    const user = await Users.findByPk(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ message: RESPONSE_MESSAGES.USER_NOT_FOUND, success: false });
    }
    const { password: _, ...userWithoutPassword } = user.toJSON();
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
    const user = await Users.findByPk(req.user.id);
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
    await user.update({ password: hashedPassword });
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
    const user = await Users.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res
        .status(404)
        .json({ message: RESPONSE_MESSAGES.USER_NOT_FOUND, success: false });
    }
    const resetToken = generateResetToken();
    await user.update({ resetToken });
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
    const user = await Users.findOne({ where: { resetToken } });
    if (!user) {
      return res.status(404).json({
        message: RESPONSE_MESSAGES.INVALID_RESET_TOKEN,
        success: false,
      });
    }
    const hashedPassword = await getHashValue(newPassword);
    await user.update({ password: hashedPassword, resetToken: null });
    return res.status(200).json({
      success: true,
      message: RESPONSE_MESSAGES.PASSWORD_RESET_SUCCESSFULLY,
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};
