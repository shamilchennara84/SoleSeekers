const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define a schema for addresses
const addressSchema = new Schema({
  address1: String,
  address2: String,
  city: String,
  state: String,
  zip: String,
});

// Define the user schema
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    blockStatus: {
      type: Boolean,
      default: false, // Default value is false (not blocked)
      required: true,
    },
    token: {
      type: Number,
    },
    wishList: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    cart: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        
      },
    ],
    addresses: [addressSchema], // Use the address schema for addresses
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
