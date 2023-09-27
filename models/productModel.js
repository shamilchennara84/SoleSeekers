const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    img1: {
      type: String,
      required: true,
    },
    img2: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId, // Reference to Category schema
      ref: 'Category', // Reference to the 'Category' model
      required: true,
    },
    bgColor: {
      type: String,
    },
    trending: {
      type: Boolean,
      default: false,
    },
    offer: {
      type: Number,
    },
    isDeleted: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
