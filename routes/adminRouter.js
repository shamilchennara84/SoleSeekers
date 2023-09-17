const express = require('express');
const adminRoute = express.Router();
const admin_controller = require("../controller/adminController")
const auth = require("../middleware/auth")
const store = require("../middleware/multer")

// admin login and dashboard routing========================
adminRoute.get('/admin', admin_controller.getAdminLogin);
adminRoute.post('/admin', admin_controller.adminLogin);
adminRoute.get('/admin/dashboard', auth.adminLoggedIn, admin_controller.userDashboard);


// admin user management routing=====================
adminRoute.get('/admin/users', auth.adminLoggedIn, admin_controller.userManagement);
adminRoute.post('/admin/users/search', admin_controller.userSearch);
adminRoute.get('/admin/users/edit', admin_controller.userEdit);
adminRoute.post('/admin/users/edit', admin_controller.userUpdate);
adminRoute.post('/admin/users/block', admin_controller.userBlock);
adminRoute.post('/admin/users/unblock', admin_controller.userUnBlock);

// admin category management routing=========================
adminRoute.get('/admin/category', auth.adminLoggedIn, admin_controller.adminCategory);
adminRoute.post('/admin/category', admin_controller.adminCategoryLoad);
adminRoute.get('/admin/category/delete', admin_controller.categoryDelete);
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

module.exports = adminRoute;
     