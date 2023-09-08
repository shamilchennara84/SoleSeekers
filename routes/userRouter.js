const express = require('express')
const user_route = express.Router();
const path = require('path');
// const auth = require('../middleware/auth');
const user_controller = require('../controller/userController')


// ----------------------------------------------------------------------------------------
user_route.get('/', function (req, res) {
  if(req.session.user || req.session.admin){
    res.redirect("/user")
  }
  else{
    res.redirect("/user")
  }
  }
)

user_route.get('/register',user_controller.loadSignup)
user_route.post('/register',user_controller.signupUser)
user_route.post('/otpVerify', user_controller.verifyOtp);


module.exports = user_route