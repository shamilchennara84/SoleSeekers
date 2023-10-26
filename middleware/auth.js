const { User } = require('../models/userModel');

exports.userLoggedIn = (req, res, next) => {
  if (req.session.user) {
    return next();
  } else {
    return res.redirect('/login');
  }
};

exports.userLogout = (req, res) => {
  req.session.user = false;
  req.session.destroy();
  return res.redirect('/login');
};

exports.adminLoggedIn = (req, res, next) => {
  if (req.session.admin) {
    return next();
  } else {
    return res.redirect('/admin');
  }
};

exports.adminLogout = (req, res) => {
  req.session.admin = false;
  req.session.destroy();
  return res.redirect('/admin');
};

exports.isBlocked = async (req, res, next) => {
  try {
    const userData = req.session.userData;
    if (!userData) {
      return next();
    }
    const user = await User.findById(userData._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.blockStatus) {
      req.session.user = false;
      req.session.destroy();
      return res.redirect('/admin');
    }
    return next();
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
