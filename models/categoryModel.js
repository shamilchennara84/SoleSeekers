/* eslint-disable comma-spacing */
const mongoose = require('mongoose')

const Schema = mongoose.Schema

const categorySchema = new Schema({
  categoryName: {
    type: String,
    trim: 'true',
    uppercase: 'true'

  },
  active: {
    type: Boolean,
    default: true
  }
})

const Category = mongoose.model('Category',categorySchema)

module.exports = Category
