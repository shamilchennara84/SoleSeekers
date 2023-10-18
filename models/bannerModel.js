const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bannerSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true, 
    },
    subTitle: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      
    },
    status: {
      type: String,
      default: 'Active', 
    },
    redirect: {
      type: String,
    
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries (e.g., searching by title)
// bannerSchema.index({ title: 'text' });

const Banner = mongoose.model('Banner', bannerSchema);
module.exports = Banner;
