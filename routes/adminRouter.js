const express = require('express');
const adminRoute = express.Router();
const admin_controller = require("../controller/adminController")
const auth = require("../middleware/auth")
const store = require("../middleware/multer")

// admin login and dashboard routing========================
adminRoute.get('/admin', admin_controller.getAdminLogin);
adminRoute.post('/admin', admin_controller.adminLogin);
adminRoute.get('/admin-logout', auth.adminLogout);
adminRoute.get('/admin/dashboard', auth.adminLoggedIn, admin_controller.userDashboard);


// admin user management routing=====================
adminRoute.get('/admin/users', auth.adminLoggedIn, admin_controller.userManagement);
adminRoute.post('/admin/users/search', admin_controller.userSearch);
adminRoute.get('/admin/users/edit', admin_controller.userEdit);
adminRoute.post('/admin/users/edit', admin_controller.userUpdate);
adminRoute.patch('/admin/users/block/:id', admin_controller.userBlock);
adminRoute.patch('/admin/users/unblock/:id', admin_controller.userUnBlock);

// admin category management routing=========================
adminRoute.get('/admin/category', auth.adminLoggedIn, admin_controller.adminCategory);
adminRoute.post('/admin/category', admin_controller.adminCategoryLoad);
adminRoute.get('/admin/category/delete', admin_controller.categoryDeactive);
adminRoute.get('/admin/category/active', admin_controller.categoryActivate);
adminRoute.get('/admin/category/edit', admin_controller.categoryEdit);
adminRoute.post('/admin/category/update', admin_controller.categoryUpdate);

// admin product management routing=======================================================================

adminRoute.get('/admin/products', auth.adminLoggedIn, admin_controller.productLoad);
adminRoute.get('/admin/products/add', admin_controller.productAdd);
adminRoute.post('/admin/products/add', store.any(), admin_controller.productUpload);
adminRoute.get('/admin/products/edit', admin_controller.productEdit);
adminRoute.post('/admin/products/edit', store.any(), admin_controller.productUpdate);
adminRoute.post('/admin/products/delete', admin_controller.productDelete);
adminRoute.post('/admin/products/search', auth.adminLoggedIn, admin_controller.productSearch);

//admin order management routing===========================================================================

adminRoute.get('/admin/orders', auth.adminLoggedIn, admin_controller.ordersLoad);
adminRoute.get('/admin/orders/status', auth.adminLoggedIn, admin_controller.editStatusLoad);
adminRoute.post('/admin/orders/status', admin_controller.editStatus);

//admin Coupon management==================================================================================

adminRoute.get('/admin/coupons', auth.adminLoggedIn, admin_controller.couponLoad);
adminRoute.post('/admin/coupons/add', admin_controller.couponAdd);
adminRoute.get('/admin/coupon/Deactivate', auth.adminLoggedIn, admin_controller.couponDeactivate);
adminRoute.get('/admin/coupon/Activate', auth.adminLoggedIn, admin_controller.couponActivate);
adminRoute.get('/admin/coupon/edit', auth.adminLoggedIn, admin_controller.couponEdit);
adminRoute.post('/admin/coupon/update', admin_controller.couponUpdate);


//admin Reports============================================================================================

adminRoute.get('/admin/dashboard/report', auth.adminLoggedIn, admin_controller.orderReport);
adminRoute.get('/admin/exportExcel', auth.adminLoggedIn, admin_controller.orderExcel);
adminRoute.post('/admin/orderSearch', auth.adminLoggedIn, admin_controller.orderSearch);

//admin Banner============================================================================================

adminRoute.get('/admin/banner', auth.adminLoggedIn, admin_controller.bannerLoad);
adminRoute.post('/admin/banners/add', store.any(), admin_controller.bannerAdd);
adminRoute.get('/admin/banner/edit', auth.adminLoggedIn, admin_controller.bannerEdit);
adminRoute.post('/admin/banner/update', store.any(), admin_controller.bannerUpdate);
adminRoute.patch('/admin/banner/disable/:id', admin_controller.bannerDisable);
adminRoute.patch('/admin/banner/enable/:id', admin_controller.bannerEnable);

module.exports = adminRoute;
     