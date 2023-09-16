exports.userLoggedIn = (req, res, next) => {
  if (req.session.user) {
    return next();
  } else {
    res.redirect('/login');
  }
};

exports.userLogout = (req, res) => {
  req.session.user = false;
  req.session.destroy();
  req.redirect('/user');
};

exports.adminLoggedIn = (req, res, next) => {
  if (req.session.admin) {
    return next();
  } else {
    return res.redirect('/admin');
  }
};

exports.userLogout = (req, res) => {
  req.session.user = false;
  req.session.destroy();
  return req.redirect('/admin');
};
