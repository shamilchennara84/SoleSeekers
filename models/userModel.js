const mongoose = require('mongoose')
const Schema = mongoose.Schema 


const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password:{
    type:String,
    required:true
  },
  blockStatus:{
    type:Boolean
  },
  wishList:[{
    type:Schema.Types.ObjectId,
    ref:"Product"
  }],
  cart:[{
    type:Schema.Types.ObjectId,
    ref:"Product"
  }],
  addresses:[{
        address1:{
            type:String
        },
        address2:{
            type:String
        },
        city:{
            type:String
        },
        state:{
            type:String
        },
        zip:{
            type:String
        },

  }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;