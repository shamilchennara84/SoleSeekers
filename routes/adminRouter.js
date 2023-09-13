const express = require('express');
const admin_router = express.Router();
const admin_controller = require("../controller/adminController")

/* GET users listing. */
admin_router.get('/admin', admin_controller.getAdminLogin);
admin_router.post('/admin', admin_controller.adminLogin);

router.get('/admin/dashboard', auth.adminLoggedIn, controlls.userDashboard);
// admin_router.post('/admin', admin_controller.adminLogin);


// admin_router.get('/admin/users', auth.adminLoggedIn, controlls.userManagement);
// admin_router.post('/admin/users/search', controlls.userSearch);
// admin_router.get('/admin/users/edit', controlls.userEdit);
// admin_router.post('/admin/users/edit', controlls.userUpdate);
// admin_router.post('/admin/users/block', controlls.userBlock);
// admin_router.post('/admin/users/unblock', controlls.userUnBlock);


module.exports = admin_router;
