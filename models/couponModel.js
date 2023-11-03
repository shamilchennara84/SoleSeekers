/* eslint-disable comma-dangle */
/* eslint-disable semi */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const couponSchema = new Schema({
  code: {
    type: String,
    trim: true,
    uppercase: true,
  },
  value: {
    type: Number,
    required: true,
  },
  minBill: {
    type: Number,
    required: true,
  },
  maxAmount: {
    type: Number,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  Status: {
    type: String,
    required: true,
    default: 'Active',
  },
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
