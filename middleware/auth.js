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
  return res.redirect('/user');
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
