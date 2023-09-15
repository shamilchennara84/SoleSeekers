const express = require('express');
const adminRoute = express.Router();
const admin_controller = require("../controller/adminController")
const auth = require("../middleware/auth")

/* GET users listing. */
adminRoute.get('/admin', admin_controller.getAdminLogin);
adminRoute.post('/admin', admin_controller.adminLogin);

adminRoute.get('/admin/dashboard', auth.adminLoggedIn, admin_controller.userDashboard);
// adminRoute.post('/admin', admin_controller.adminLogin);


adminRoute.get('/admin/users', auth.adminLoggedIn, admin_controller.userManagement);
// adminRoute.post('/admin/users/search', admin_controller.userSearch);
adminRoute.get('/admin/users/edit', admin_controller.userEdit);
adminRoute.post('/admin/users/edit', admin_controller.userUpdate);
adminRoute.post('/admin/users/block', admin_controller.userBlock);
adminRoute.post('/admin/users/unblock', admin_controller.userUnBlock);


module.exports = adminRoute;
