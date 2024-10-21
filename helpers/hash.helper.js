const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');
const crypto = require('crypto');

module.exports.getHashValue = async (value) => {
  const salt = await bcrypt.genSalt(10);
  const hashValue = await bcrypt.hash(value, salt);
  return hashValue;
};

module.exports.isPasswordMatch = async (password, userpassword) => {
  const isMatch = await bcrypt.compare(password, userpassword);
  return isMatch;
};

module.exports.signAccessToken = async (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    user_type: user.user_type,
  };
  const token = await JWT.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
  return token;
};

module.exports.generateResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  return resetToken;
};

module.exports.verifyResetToken = (token, hashedToken) => {
  const hashedInputToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  return hashedInputToken === hashedToken;
};
