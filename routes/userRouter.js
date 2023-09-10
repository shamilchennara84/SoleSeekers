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
user_route.get('/otpVerify', user_controller.verifyOTP);
user_route.get('/user',user_controller.loadUserPage);

user_route.post('/register',user_controller.signupUser)

user_route.get('/otp',user_controller.mobileOtp);


module.exports = user_route