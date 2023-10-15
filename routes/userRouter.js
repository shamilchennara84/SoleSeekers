const express = require('express');
const user_route = express.Router();
// const path = require('path');
const auth = require('../middleware/auth');
const user_controller = require('../controller/userController');

user_route.get('/', function (req, res) {
  return res.redirect('/user');
});

user_route.get('/user', user_controller.loadUserPage); //need to add banner and wishlist
user_route.get('/login', user_controller.loadLogin);
user_route.get('/logout', auth.userLogout);
user_route.get('/register', user_controller.loadSignup);
user_route.get('/otpVerify', user_controller.verifyOTP);
user_route.get('/otp', user_controller.mobileOtp);

user_route.post('/register', user_controller.signupUser);
user_route.post('/login', user_controller.signIn);
user_route.post('/otp', user_controller.sendOtp);

user_route.get('/forgotPassword', user_controller.sendEmailOtp);
user_route.post('/forgotPassword', user_controller.emailOtp);
user_route.post('/verifyPassword', user_controller.verifyPassword);
// =================================================================
user_route.get('/displayCategory', auth.userLoggedIn, user_controller.displayCategory);
user_route.get('/search', user_controller.proSearch);
// ==============================================================
user_route.get('/productView', user_controller.productView);
user_route.post('/user/addtoCart', user_controller.addToCart);
user_route.get('/cart', auth.userLoggedIn, user_controller.cart);
user_route.post('/addToCart/operation', auth.userLoggedIn, user_controller.cartOperation);
user_route.post('/deleteFromCart', user_controller.deleteCart);
user_route.get('/cart/checkout', auth.userLoggedIn, user_controller.checkout);
user_route.get('/cart/checkout/payment', auth.userLoggedIn, user_controller.payment);
user_route.post('/cart/checkout/payment', auth.userLoggedIn, user_controller.paymentLoad);
user_route.post('/cart/checkout/paymentMode', auth.userLoggedIn, user_controller.paymentMode);
user_route.get('/orderRedirect', auth.userLoggedIn, user_controller.orderSuccessRedirect);
user_route.get('/orderSuccess', auth.userLoggedIn, user_controller.orderSuccess);
user_route.get('/razorpay', auth.userLoggedIn, user_controller.razorpayRedirect);
user_route.post('/applyCoupon', user_controller.applyCoupon);

// ================================================================
user_route.get('/profile', auth.userLoggedIn, user_controller.userProfile);
user_route.post('/profile/addAddress', auth.userLoggedIn, user_controller.userAddress);
user_route.post('/profile/uploadAddress', auth.userLoggedIn, user_controller.updateAddress);
user_route.get('/profile/deleteAddress', auth.userLoggedIn, auth.userLoggedIn, user_controller.deleteAddress);
user_route.post('/profile/changePassword', auth.userLoggedIn, user_controller.changePassword);
user_route.post('/profile/userEdit', auth.userLoggedIn, user_controller.updateUser);

// =======================================================================
user_route.get('/wishlist', auth.userLoggedIn, user_controller.wishlist);
user_route.post('/wishlist/add', auth.userLoggedIn, user_controller.addToWishlist);
user_route.post('/wishlist/delete', user_controller.deleteWishlist);
// =======================================================================

user_route.get('/orders', auth.userLoggedIn, user_controller.orders);
user_route.post('/cancelOrder', user_controller.cancelOrder);
user_route.post('/returnOrder', user_controller.returnOrder);
user_route.get('/create-invoice', user_controller.invoice);

user_route.get('/error', function (req, res) {
  if (req.session.user) {
    res.redirect('/user');
  } else if (req.session.admin) {
    res.redirect('/admin');
  } else {
    res.redirect('/user');
  }
});


module.exports = user_route;

// ----------------------------------------------------------------------------------------
