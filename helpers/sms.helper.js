require('dotenv').config();

const client = require('twilio')(
  process.env.ACCOUNT_SID,
  process.env.AUTH_TOKEN
);

module.exports.sendSms = (to, body) => {
  return client.messages
    .create({
      body: body,
      from: process.env.FROM_NO,
      to: to,
    })
    .then((message) => console.log(message.sid));
};
