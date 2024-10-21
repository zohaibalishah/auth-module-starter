const express = require('express');
require('dotenv').config();
const cors = require('cors');
const morgan = require('morgan');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api/auth', require('./routes/auth.route'));

const PORT = process.env.PORT || 5000;

const RESPONSE_MESSAGES = require('./config/constant').RESPONSE_MESSAGES;

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: RESPONSE_MESSAGES.SERVER_ERROR,
    error: err.message, 
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
