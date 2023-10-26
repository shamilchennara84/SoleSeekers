/* ==================== Node JS Express MongoDB - Sole Seekers ==================== */

// const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const nocache = require('nocache');
const { errorHandler, err404handle, portHandle } = require('./middleware/errorHandler');


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
app.use(session({ secret: 'process.env.Secret', cookie: { maxAge: 6000000 }, resave: false, saveUninitialized: true }));

// ====================ROUTES====================

app.use(userRouter);
app.use(adminRouter);

// ====================404 Not Found Middleware====================

app.use(err404handle)

// ====================Error-handling Middleware====================
app.use(errorHandler);

app.listen(8000,portHandle)
