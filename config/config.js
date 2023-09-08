const mongoose = require('mongoose');

const sessionSecret = 'mysiteSessionSecret';

// Define the MongoDB connection URL
const dbURL = 'mongodb://127.0.0.1:27017/soleSeekers';

// Establish the database connection
mongoose
  .connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Database connected');
  })
  .catch((error) => {
    console.error('Database connection error:', error);
  });

module.exports = {
  sessionSecret,
};
