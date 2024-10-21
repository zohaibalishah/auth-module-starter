const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');
const constant = require('../config/constant');

const User = sequelize.define(
  'users',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    role: {
      type: DataTypes.STRING,
      defaultValue: constant.USER_ROLES.USER,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {}
);

module.exports = User;
