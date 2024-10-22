const jwt = require('jsonwebtoken');
const { dummyUsers } = require('../models/User');
const { RESPONSE_MESSAGES } = require('../config/constant');

module.exports.authenticate = async (req, res, next) => {
  const authorization = req.header('Authorization');
  if (!authorization) {
    return res.status(401).json({
      success: false,
      message: RESPONSE_MESSAGES.AUTH_TOKEN_REQUIRED,
    });
  }

  try {
    const token = authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = dummyUsers.find((u) => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: RESPONSE_MESSAGES.ACCOUNT_NOT_FOUND,
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      message: err.message,
    });
  }
};

module.exports.isAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admins only.',
    });
  }

  next();
};
