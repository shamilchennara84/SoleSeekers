/* ==================== Node JS Express MongoDB - Sole Seekers ==================== */

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const nocache = require('nocache');
const config = require('./config/config')

// ====================Express Instance Setup====================

const app = express();

// ====================View Engine Setup====================

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); 

// ====================Directory Path to Different Routes====================


const userRouter = require('./routes/userRouter');
const adminRouter = require('./routes/adminRouter');

// ====================Application-Level Middlewares====================
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(nocache());

app.use(
  session({ secret: 'config.sessionSecret', cookie: { maxAge: 6000000 }, resave: false, saveUninitialized: true })
);

// ====================ROUTES====================

app.use('/', userRouter);
app.use('/admin', adminRouter);

// ====================404 Not Found Middleware====================
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// ====================Error-handling Middleware====================
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;