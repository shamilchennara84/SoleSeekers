const mongoose = require('mongoose');
const schema = mongoose.Schema;

const adminSchema = new schema({
  adminEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
