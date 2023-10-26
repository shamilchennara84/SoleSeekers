const express = require('express');
const user_route = express.Router();
const auth = require('../middleware/auth');
const user_controller = require('../controller/users/userController');
const orderController = require('../controller/users/orderController');
const profileController = require('../controller/users/profileController');
const wishListController = require('../controller/users/wishListController');
const cartController = require('../controller/users/cartController');

user_route.get('/', function (req, res) {
  return res.redirect('/user');
});

user_route.get('/user', user_controller.loadUserPage); //need to add banner and wishlist
user_route.get('/login', user_controller.loadLogin);
user_route.get('/logout', auth.userLogout);
user_route.get('/register', user_controller.loadSignup);
user_route.get('/otpVerify', user_controller.verifyOTP);
user_route.get('/otp', user_controller.mobileOtp);
user_route.get('/why', user_controller.why);

user_route.post('/register', user_controller.signupUser);
user_route.post('/login', user_controller.signIn);
user_route.post('/otp', user_controller.sendOtp);

user_route.get('/forgotPassword', user_controller.sendEmailOtp);
user_route.post('/forgotPassword', user_controller.emailOtp);
user_route.post('/verifyPassword', user_controller.verifyPassword);
// =================================================================
user_route.get('/displayCategory', user_controller.displayCategory);
user_route.get('/search', user_controller.proSearch);

// =====================<cartcontroller>=========================================

user_route.get('/productView', cartController.productView);
user_route.post('/user/addtoCart', auth.isBlocked, cartController.addToCart);
user_route.get('/cart', auth.isBlocked, auth.userLoggedIn, cartController.cart);
user_route.post('/addToCart/operation', auth.isBlocked, auth.userLoggedIn, cartController.cartOperation);
user_route.post('/deleteFromCart', cartController.deleteCart);
user_route.get('/cart/checkout', auth.isBlocked, auth.userLoggedIn, cartController.checkout);
user_route.get('/cart/checkout/payment', auth.isBlocked, auth.userLoggedIn, cartController.payment);
user_route.post('/cart/checkout/payment', auth.isBlocked, auth.userLoggedIn, cartController.paymentLoad);
user_route.post('/cart/checkout/paymentMode', auth.isBlocked, auth.userLoggedIn, cartController.paymentMode);
user_route.post('/applyCoupon', auth.isBlocked, cartController.applyCoupon);

// ===============<profilecontroller>=================================================
user_route.get('/profile', auth.isBlocked, auth.userLoggedIn, profileController.userProfile);
user_route.post('/profile/addAddress', auth.isBlocked, auth.userLoggedIn, profileController.userAddress);
user_route.post('/profile/uploadAddress', auth.isBlocked, auth.userLoggedIn, profileController.updateAddress);
user_route.get('/profile/deleteAddress', auth.isBlocked, auth.userLoggedIn, profileController.deleteAddress);
user_route.post('/profile/changePassword', auth.isBlocked, auth.userLoggedIn, profileController.changePassword);
user_route.post('/profile/userEdit', auth.isBlocked, auth.userLoggedIn, profileController.updateUser);

// ==============<wishlistcontroller>=========================================================

user_route.get('/wishlist', auth.userLoggedIn, wishListController.wishlist);
user_route.post('/wishlist/add', auth.userLoggedIn, wishListController.addToWishlist);
user_route.post('/wishlist/delete', wishListController.deleteWishlist);

// =========<ordercontroller>==============================================================

user_route.get('/orderRedirect', auth.isBlocked, auth.userLoggedIn, orderController.orderSuccessRedirect);
user_route.get('/orders', auth.isBlocked, auth.userLoggedIn, orderController.orders);
user_route.post('/cancelOrder', orderController.cancelOrder);
user_route.patch('/returnOrder/:id', orderController.returnOrder);
user_route.get('/orderSuccess', auth.userLoggedIn, orderController.orderSuccess);
user_route.get('/razorpay', auth.userLoggedIn, orderController.razorpayRedirect);
user_route.get('/createinvoice', orderController.invoice);
user_route.patch('/rateProduct/:id', orderController.rateProduct);

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
