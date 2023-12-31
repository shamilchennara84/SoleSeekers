const mongoose = require('mongoose')
require('dotenv').config()

// Establish the database connection
mongoose
  .connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Database connected')
  })
  .catch((error) => {
    console.error('Database connection error:', error)
  })

module.exports = {
  accountSID: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOCKEN,
  ServiceID: process.env.TWILIO_SERVICE_SID,
  email: process.env.EMAIL,
  secretKey: process.env.RP_SECRET_KEY,
  secretId: process.env.RP_SECRET_ID,
  pass: 'ulxpixshudkhjyoi'
}
