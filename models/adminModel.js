/* eslint-disable comma-dangle */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const adminSchema = new Schema({
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
})

const Admin = mongoose.model('Admin', adminSchema)

module.exports = Admin
