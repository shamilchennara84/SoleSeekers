/* eslint-disable semi */
const express = require('express');
const userRoute = express.Router();
const auth = require('../middleware/auth');
const userControlleer = require('../controller/users/userController');
const orderController = require('../controller/users/orderController');
const profileController = require('../controller/users/profileController');
const wishListController = require('../controller/users/wishListController');
const cartController = require('../controller/users/cartController');

userRoute.get('/', function (req, res) {
  return res.redirect('/user');
});

userRoute.get('/user', userControlleer.loadUserPage); // need to add banner and wishlist
userRoute.get('/login', userControlleer.loadLogin);
userRoute.get('/logout', auth.userLogout);
userRoute.get('/register', userControlleer.loadSignup);
userRoute.get('/otpVerify', userControlleer.verifyOTP);
userRoute.get('/otp', userControlleer.mobileOtp);
userRoute.get('/why', userControlleer.why);

userRoute.post('/register', userControlleer.signupUser);
userRoute.post('/login', userControlleer.signIn);
userRoute.post('/otp', userControlleer.sendOtp);

userRoute.get('/forgotPassword', userControlleer.sendEmailOtp);
userRoute.post('/forgotPassword', userControlleer.emailOtp);
userRoute.post('/verifyPassword', userControlleer.verifyPassword);
// =================================================================
userRoute.get('/displayCategory', userControlleer.displayCategory);
userRoute.get('/search', userControlleer.proSearch);

// =====================<cartcontroller>=========================================

userRoute.get('/productView', cartController.productView);
userRoute.post('/user/addtoCart', auth.isBlocked, cartController.addToCart);
userRoute.get('/cart', auth.isBlocked, auth.userLoggedIn, cartController.cart);
userRoute.post('/addToCart/operation', auth.isBlocked, auth.userLoggedIn, cartController.cartOperation);
userRoute.post('/deleteFromCart', cartController.deleteCart);
userRoute.get('/cart/checkout', auth.isBlocked, auth.userLoggedIn, cartController.checkout);
userRoute.get('/cart/checkout/payment', auth.isBlocked, auth.userLoggedIn, cartController.payment);
userRoute.post('/cart/checkout/payment', auth.isBlocked, auth.userLoggedIn, cartController.paymentLoad);
userRoute.post('/cart/checkout/paymentMode', auth.isBlocked, auth.userLoggedIn, cartController.paymentMode);
userRoute.post('/applyCoupon', auth.isBlocked, cartController.applyCoupon);

// ===============<profilecontroller>=================================================
userRoute.get('/profile', auth.isBlocked, auth.userLoggedIn, profileController.userProfile);
userRoute.post('/profile/addAddress', auth.isBlocked, auth.userLoggedIn, profileController.userAddress);
userRoute.post('/profile/uploadAddress', auth.isBlocked, auth.userLoggedIn, profileController.updateAddress);
userRoute.get('/profile/deleteAddress', auth.isBlocked, auth.userLoggedIn, profileController.deleteAddress);
userRoute.post('/profile/changePassword', auth.isBlocked, auth.userLoggedIn, profileController.changePassword);
userRoute.post('/profile/userEdit', auth.isBlocked, auth.userLoggedIn, profileController.updateUser);

// ==============<wishlistcontroller>=========================================================

userRoute.get('/wishlist', auth.userLoggedIn, wishListController.wishlist);
userRoute.post('/wishlist/add', auth.userLoggedIn, wishListController.addToWishlist);
userRoute.post('/wishlist/delete', wishListController.deleteWishlist);

// =========<ordercontroller>==============================================================

userRoute.get('/orderRedirect', auth.isBlocked, auth.userLoggedIn, orderController.orderSuccessRedirect);
userRoute.get('/orders', auth.isBlocked, auth.userLoggedIn, orderController.orders);
userRoute.post('/cancelOrder', orderController.cancelOrder);
userRoute.patch('/returnOrder/:id', orderController.returnOrder);
userRoute.get('/orderSuccess', auth.userLoggedIn, orderController.orderSuccess);
userRoute.get('/razorpay', auth.userLoggedIn, orderController.razorpayRedirect);
userRoute.get('/createinvoice', orderController.invoice);
userRoute.patch('/rateProduct/:id', orderController.rateProduct);

userRoute.get('/error', function (req, res) {
  if (req.session.user) {
    res.redirect('/user');
  } else if (req.session.admin) {
    res.redirect('/admin');
  } else {
    res.redirect('/user');
  }
});

module.exports = userRoute;

// ----------------------------------------------------------------------------------------
