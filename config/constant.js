const USER_ROLES = {
  SUPER_ADMIN: 'SUPER ADMIN',
  USER: 'USER',
};

const RESPONSE_MESSAGES = {
  ACCOUNT_NOT_FOUND: 'Account not found',
  INVALID_PASSWORD: 'Invalid password',
  REQUIRED_FIELDS_EMPTY: 'Required fields cannot be empty',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  USER_NOT_FOUND: 'User not found',
  CURRENT_PASSWORD_INCORRECT: 'Current password is incorrect',
  PASSWORD_UPDATED_SUCCESSFULLY: 'Password updated successfully',
  EMAIL_REQUIRED: 'Email is required',
  PASSWORD_RESET_TOKEN_SENT: 'Password reset token sent to email',
  INVALID_RESET_TOKEN: 'Invalid reset token',
  PASSWORD_RESET_SUCCESSFULLY: 'Password reset successfully',
  ACCOUNT_CREATED_SUCCESSFULLY: 'Account created successfully',
  RESET_TOKEN_AND_NEW_PASSWORD_REQUIRED: 'Reset token and new password are required',
  CURRENT_AND_NEW_PASSWORD_REQUIRED: 'Current and new password are required',
  SERVER_ERROR: 'An unexpected server error occurred',
  AUTH_TOKEN_REQUIRED: 'Auth token required',
};

module.exports = {
  USER_ROLES,
  RESPONSE_MESSAGES,
};
