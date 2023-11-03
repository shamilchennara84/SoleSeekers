const express = require('express')
const adminRoute = express.Router()
const adminController = require('../controller/admin/adminController')
const auth = require('../middleware/auth')
const store = require('../middleware/multer')

// admin login and dashboard routing========================
adminRoute.get('/admin', adminController.getAdminLogin)
adminRoute.post('/admin', adminController.adminLogin)
adminRoute.get('/admin-logout', auth.adminLogout)
adminRoute.get('/admin/dashboard', auth.adminLoggedIn, adminController.userDashboard)

// admin user management routing=====================
adminRoute.get('/admin/users', auth.adminLoggedIn, adminController.userManagement)
adminRoute.post('/admin/users/search', auth.adminLoggedIn, adminController.userSearch)
adminRoute.get('/admin/users/edit', auth.adminLoggedIn, adminController.userEdit)
adminRoute.post('/admin/users/edit', auth.adminLoggedIn, adminController.userUpdate)
adminRoute.patch('/admin/users/block/:id', auth.adminLoggedIn, adminController.userBlock)
adminRoute.patch('/admin/users/unblock/:id', auth.adminLoggedIn, adminController.userUnBlock)

// admin category management routing=========================
adminRoute.get('/admin/category', auth.adminLoggedIn, auth.adminLoggedIn, adminController.adminCategory)
adminRoute.post('/admin/category', auth.adminLoggedIn, adminController.adminCategoryLoad)
adminRoute.get('/admin/category/delete', auth.adminLoggedIn, adminController.categoryDeactive)
adminRoute.get('/admin/category/active', auth.adminLoggedIn, adminController.categoryActivate)
adminRoute.get('/admin/category/edit', auth.adminLoggedIn, adminController.categoryEdit)
adminRoute.post('/admin/category/update', auth.adminLoggedIn, adminController.categoryUpdate)

// admin product management routing=======================================================================

adminRoute.get('/admin/products', auth.adminLoggedIn, auth.adminLoggedIn, adminController.productLoad)
adminRoute.get('/admin/products/add', auth.adminLoggedIn, adminController.productAdd)
adminRoute.post('/admin/products/add', auth.adminLoggedIn, store.any(), adminController.productUpload)
adminRoute.get('/admin/products/edit', auth.adminLoggedIn, adminController.productEdit)
adminRoute.post('/admin/products/edit', auth.adminLoggedIn, store.any(), adminController.productUpdate)
adminRoute.post('/admin/products/delete', auth.adminLoggedIn, adminController.productDelete)
adminRoute.post('/admin/products/search', auth.adminLoggedIn, auth.adminLoggedIn, adminController.productSearch)
adminRoute.post('/admin/products/crop-image', auth.adminLoggedIn, auth.adminLoggedIn, adminController.sharpcrop)

// admin order management routing===========================================================================

adminRoute.get('/admin/orders', auth.adminLoggedIn, adminController.ordersLoad)
adminRoute.get('/admin/orders/status', auth.adminLoggedIn, adminController.editStatusLoad)
adminRoute.post('/admin/orders/status', auth.adminLoggedIn, adminController.editStatus)

// admin Coupon management==================================================================================

adminRoute.get('/admin/coupons', auth.adminLoggedIn, adminController.couponLoad)
adminRoute.post('/admin/coupons/add', auth.adminLoggedIn, auth.adminLoggedIn, adminController.couponAdd)
adminRoute.get('/admin/coupon/Deactivate', auth.adminLoggedIn, adminController.couponDeactivate)
adminRoute.get('/admin/coupon/Activate', auth.adminLoggedIn, adminController.couponActivate)
adminRoute.get('/admin/coupon/edit', auth.adminLoggedIn, adminController.couponEdit)
adminRoute.post('/admin/coupon/update', auth.adminLoggedIn, auth.adminLoggedIn, adminController.couponUpdate)

// admin Reports============================================================================================

adminRoute.get('/admin/dashboard/report', auth.adminLoggedIn, adminController.orderReport)
adminRoute.get('/admin/exportExcel', auth.adminLoggedIn, adminController.orderExcel)
adminRoute.post('/admin/orderSearch', auth.adminLoggedIn, adminController.orderSearch)

// admin Banner============================================================================================

adminRoute.get('/admin/banner', auth.adminLoggedIn, adminController.bannerLoad)
adminRoute.post('/admin/banners/add', auth.adminLoggedIn, store.any(), adminController.bannerAdd)
adminRoute.get('/admin/banner/edit', auth.adminLoggedIn, adminController.bannerEdit)
adminRoute.post('/admin/banner/update', auth.adminLoggedIn, store.any(), adminController.bannerUpdate)
adminRoute.patch('/admin/banner/disable/:id', auth.adminLoggedIn, adminController.bannerDisable)
adminRoute.patch('/admin/banner/enable/:id', auth.adminLoggedIn, adminController.bannerEnable)

module.exports = adminRoute
