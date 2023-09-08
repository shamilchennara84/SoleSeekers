userLoggedIn = (req, res, next) => {
  if (req.session.user) {
    return next();
  } else {
    res.redirect('/login');
  }
};

userLogout = (req, res) => {
  req.session.user = false;
  req.session.destroy();
  req.redirect('/user');
};


exports.module={
  userLoggedIn,
  userLogout
}