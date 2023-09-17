const express = require('express')
const user_route = express.Router();
const path = require('path');
// const auth = require('../middleware/auth');
const user_controller = require('../controller/userController')



user_route.get('/',user_controller.loadUserPage);
user_route.get('/user',user_controller.loadUserPage);
user_route.get('/register',user_controller.loadSignup)
user_route.get('/login',user_controller.loadLogin)
user_route.get('/otpVerify', user_controller.verifyOTP);
user_route.get('/otp',user_controller.mobileOtp);

user_route.post('/register',user_controller.signupUser)
user_route.post('/login', user_controller.signIn);
user_route.post('/otp', user_controller.sendOtp);

user_route.get('/forgotPassword', user_controller.sendEmailOtp);
user_route.post('/forgotPassword', user_controller.emailOtp);
user_route.post('/verifyPassword', user_controller.verifyPassword);

user_route.get('/productView', user_controller.productView);
module.exports = user_route



// ----------------------------------------------------------------------------------------
// user_route.get('/', function (req, res) {
//   if(req.session.user || req.session.admin){
//     res.redirect("/user")
//   }
//   else{
//     res.redirect("/user")
//   }
//   }
// )
