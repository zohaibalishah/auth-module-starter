const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  }
);

const databaseLoader = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({alter:true});
    console.log('DB connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
  }
};

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.databaseLoader = databaseLoader;

module.exports = db;
