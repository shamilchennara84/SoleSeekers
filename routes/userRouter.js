const express = require('express')
const user_route = express.Router();
const path = require('path');
const auth = require('../middleware/auth');
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

// ==============================================================
user_route.get('/productView', user_controller.productView);

// ================================================================
user_route.get('/profile', auth.userLoggedIn, user_controller.userProfile);
user_route.post('/profile/addAddress', user_controller.userAddress);
user_route.post('/profile/uploadAddress', user_controller.updateAddress);
user_route.get('/profile/deleteAddress', auth.userLoggedIn, user_controller.deleteAddress);
user_route.post('/profile/changePassword', user_controller.changePassword);
user_route.post('/profile/userEdit', user_controller.updateUser);




module.exports = user_route



// ----------------------------------------------------------------------------------------
