const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define a schema for addresses
const addressSchema = new Schema({
  name: String,
  mobile: Number,
  address1: String,
  address2: String,
  city: String,
  state: String,
  zip: Number,
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
      default: false,
      required: true,
    },

    token: {
      type: Number,
    },
    wallet: {
      type: Number,
      default: 0,
    },
    wishList: [
      {
        prod_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        unit_price: {
          type: Number,
          required: true,
        },
        size: {
          type: Number,
          required: true,
        },
      },
    ],

    cart: [
      {
        prod_id: {
          type: Schema.Types.ObjectId,
          ref: 'Product', // Reference to the Product model
          required: true,
        },
        qty: {
          type: Number,
          default: 1,
        },
        unit_price: {
          type: Number,
          required: true,
        },
        total_price: {
          type: Number,
          required: true,
        },
        size: {
          type: Number,
          required: true,
        },
      },
    ],
    addresses: [addressSchema], // Use the address schema for addresses
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
const Address = mongoose.model('Address', addressSchema);

module.exports = { User, Address };
