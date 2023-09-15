const config = require('../config/config');
const Admin = require('../models/adminModel');

const user = require('../models/userModel');
// const ObjectId = mongoose.Types.ObjectId;

module.exports = {
  getAdminLogin: async (req, res) => {
    try {
      if (req.session.admin) {
        res.render('admin/adminDashboard'); ////////////////////to change
      } else {
        res.render('admin/adminLogin', { message: '' });
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  adminLogin: async (req, res) => {
    const { email, password } = req.body;
    console.log(email);
    console.log(password);
    try {
      const adminData = await Admin.findOne({ email, password });
      if (adminData) {
        req.session.admin = true;
        res.render('admin/adminDashboard', { message: '' });
      } else {
        req.session.admin = false;
        res.render('admin/adminLogin', { message: 'wrong credentials' });
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  userDashboard: async (req, res) => {
    try {
      res.render('admin/adminDashboard', { message: '' });
    } catch (error) {
      console.log(error.message);
    }
    //need working===================================================
  },

  userManagement: async (req, res) => {
    try {
      const users = await user.find({});
      if (users) {
        req.session.users = users;
        res.render('admin/adminUsers', { users, adminMessage: req.session.adminMessage });
        // userblock message
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  userBlock: async (req, res) => {
    const id = req.body.id;
    req.session.adminMessage = '';
    try {
      const response = await user.findByIdAndUpdate({ _id: id }, { $set: { blockStatus: true } });
      if (response) {
        req.session.adminMessage = 'User Blocked Successfully';
        res.redirect('/admin/users');
      }
    } catch (error) {
      console.log(error.message);
      req.session.adminMessage = 'An error occurred while unblocking the user';
      res.redirect('/admin/users');
    }
  },

  userUnBlock: async (req, res) => {
    const id = req.body.id;
    req.session.adminMessage = '';

    try {
      const response = await user.findByIdAndUpdate({ _id: id }, { $set: { blockStatus: false } });
      if (response) {
        req.session.adminMessage = 'User Unblocked Successfully';
        res.redirect('/admin/users');
      }
    } catch (error) {
      console.log(error.message);
      req.session.adminMessage = 'An error occurred while unblocking the user';
      res.redirect('/admin/users');
    }
  },

  userEdit: async (req, res) => {
    const id = req.query.id;
    req.session.adminMessage = '';
    req.session.userId = id;
    try {
      const userdata = await user.findOne({ _id: id });
      if (userdata) {
        res.render('admin/adminEditUser', { user: userdata });
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  userUpdate: async (req, res) => {
    req.session.adminMessage = '';
    const { name, email, mobile } = req.body;
    try {
      const updateData = await user.updateOne({ _id: req.session.userId }, { $set: { name, email, mobile } });
      if (updateData) {
        req.session.adminMessage = 'User Updated successfully';
        res.redirect('/admin/users');
      }
    } catch (error) {
      console.log(error.message);
    }
  },
};
