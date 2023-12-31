/* eslint-disable eqeqeq */
/* eslint-disable semi */
/* eslint-disable comma-dangle */
const config = require('../../config/config');
const { User } = require('../../models/userModel');
const bcrypt = require('bcrypt');
const client = require('twilio')(config.accountSID, config.authToken);
const nodemailer = require('nodemailer');
const Category = require('../../models/categoryModel');
const Product = require('../../models/productModel');
const { error } = require('jquery');
const mongoose = require('mongoose');
const Banner = require('../../models/bannerModel');

// ============OTP Generation============================================

const generateOTP = function () {
  return Math.floor(100000 + Math.random() * 900000);
};

// ================password hasi=hing using Bcrypt========================

const securePassword = async (password) => {
  try {
    const saltRound = 10;
    const passwordHash = await bcrypt.hash(password, saltRound);
    return passwordHash;
  } catch (err) {
    console.log(error.message);
  }
};

// ================Get all active categories========================

const getCategory = async function () {
  try {
    const categories = await Category.find({ active: true });
    return categories;
  } catch (error) {
    throw new Error('Could not find categories');
  }
};
// ================get products========================

const getProducts = async function () {
  try {
    const products = await Product.find({ isDeleted: false });
    return products;
  } catch (error) {
    console.error(error.message);
    throw new Error('Error fetching products');
  }
};

// ================load Rgister Page========================

const loadSignup = async (req, res) => {
  try {
    res.render('users/signup', { message: '' });
  } catch (error) {
    console.log(error.message);
  }
};

// ============why==============================================
const why = async (req, res) => {
  try {
    const categories = await getCategory();
    if (!req.session.user) {
      return res.render('users/why', { categories });
    }

    const user = req.session.userData;
    const userData = await User.findOne({ _id: user._id }).populate({
      path: 'cart.prod_id',
      model: 'Product',
      populate: {
        path: 'category',
        model: 'Category',
      },
    });
    return res.render('users/why', { userData, categories });
  } catch (error) {
    console.log(error.message);
  }
};

// ================load User Page========================
// need to add banners here ---------------IMPORTANT---------------
const loadUserPage = async (req, res) => {
  try {
    const categories = await getCategory();
    const products = await getProducts();
    const banners = await Banner.find({ status: 'Active' });
    if (req.session.user) {
      const user = req.session.userData;
      const userData = await User.findById(user._id);

      if (userData.blockStatus === true) {
        req.session.user = false;
        return res.redirect('/');
      }
      res.render('users/index', {
        userData,
        products,
        categories,
        banners,
      });
    } else {
      res.render('users/index', {
        products,
        categories,
        banners,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
// ================load load Login========================

const loadLogin = async (req, res) => {
  try {
    const message = req.session.loginError;
    delete req.session.loginError;
    return res.render('users/login', { message });
  } catch (error) {
    console.log(error.message);
  }
};

// / ================ signin   ========================

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // eslint-disable-next-line eqeqeq
    if (password.trim() != '' && email.trim() != '') {
      const user = await User.findOne({ email });

      if (!user) {
        throw new Error('Email or passwrod is incorrect,try again');
      }
      const passwordmatch = await bcrypt.compare(password, user.password);
      if (!passwordmatch) {
        throw new Error('Email or passwrod is incorrect,try again');
      }

      if (user.blockStatus) {
        throw new Error('your account is blocked, please contact admin');
      }
      req.session.userData = user;
      req.session.user = true;
      return res.redirect('/user');
    }
  } catch (error) {
    console.log(error.message);
    req.session.loginError = error.message;
    req.session.user = false;
    return res.redirect('/login');
  }
};

// ================sending otp========================

const sendOTP = (mobile, OTP) => {
  return new Promise((resolve, reject) => {
    const phoneNumber = `+91${mobile}`; // Add the country code
    client.messages
      .create({
        body: `DO NOT SHARE: your SoleSeeker OTP is ${OTP}`,
        to: phoneNumber,
        from: '+14788181316',
      })
      .then((send) => {
        resolve(send);
      })
      .catch((error) => {
        console.log('error sending OTP' + error.message);
        reject(error);
      });
  });
};
// ================sending email otp========================

const sendemailOtp = (email, OTP) => {
  return new Promise((resolve, reject) => {
    // Add the country code
    const transporter = nodemailer
      .createTransport({
        service: 'gmail',
        auth: {
          user: config.email,
          pass: config.pass,
        },
      })
    const options = {
      from: 'soleseeker12345@gmail.com',
      to: email,
      subject: 'Sole Seeker OTP Verification',
      text: `DO NOT SHARE: Your Mzee OTP is ${OTP}`,
    };

    transporter.sendMail(options)
      .then((send) => {
        resolve(send);
      })
      .catch((error) => {
        console.log('error sending OTP' + error.message);
        reject(error);
      });
  });
};

// / ================signup backend validation and OTP generating ========================

const signupUser = async (req, res) => {
  try {
    const { email, mobile, password, cPassword, name } = req.body;

    const [emailExist, mobileExist] = await Promise.all([
      User.findOne({ email }),
      User.findOne({ mobile }),
    ]);

    if (emailExist != null) {
      return res.render('users/signup', { message: ' Email already used' });
    } else if (mobileExist != null) {
      return res.render('users/signup', { message: 'Mobile number already exists' });
    } else if (password != cPassword) {
      return res.render('users/signup', { message: "passwords doesn't match" });
    } else if (
      password.trim() != '' &&
      cPassword.trim() != '' &&
      email.trim() != '' &&
      mobile.trim() != '' &&
      name.trim() != ''
    ) {
      const OTP = generateOTP();
      req.session.OTPofuser = OTP;
      req.session.otpmobile = { mobile, name, email, password };
      // sendOTP(mobile, OTP);
      sendemailOtp(email, OTP)
      return res.render('users/otpVerify', { message: '' });
    } else {
      throw new Error('error while signup');
    }
  } catch (error) {
    console.log(error.message);
  }
};
// ================verify otp========================

const verifyOTP = (req, res) => {
  return new Promise((resolve, reject) => {
    if (req.session.otpmobile) {
      const otpdata = req.session.otpmobile;
      const OTP = req.session.OTPofuser;
      if (req.query.otp == OTP && req.query.otp.trim() != '') {
        securePassword(otpdata.password)
          .then((passwordHash) => {
            const user = new User({
              name: otpdata.name,
              mobile: otpdata.mobile,
              email: otpdata.email,
              password: passwordHash,
              token: OTP,
            });
            return user.save();
          })
          .then((userData) => {
            if (userData) {
              req.session.userData = userData;
              req.session.user = true;
              res.redirect('/user');
              resolve();
            } else {
              res.render('users/otpVerify', { message: 'the registration failed' });
              reject(new Error('Registration failed'));
            }
          })
          .catch((error) => {
            console.log(error.message);
            reject(error);
          });
      } else {
        res.render('users/otpVerify', { message: 'the otp is incorrect' });
      }
    } else {
      if (req.session.verifyPage) {
        const otp = req.query.otp;
        User.findOne({ token: otp })
          .then((result) => {
            if (result) {
              if (req.session.changePassword) {
                res.render('users/changePassword', { message: '' });
              } else {
                req.session.userData = result;
                req.session.user = true;
                res.redirect('/user');
                resolve();
              }
            } else {
              res.render('users/otpVerify', { message: 'the otp is incorrect' });
            }
          })
          .catch((error) => {
            console.log(error.message);
            reject(error);
          });
      }
    }
  });
};

// ======================mobile otp login=============================

const mobileOtp = async (req, res) => {
  try {
    res.render('users/mobileOtp', { message: '' });
  } catch (error) {
    console.log(error.message);
  }
};

const sendOtp = (req, res) => {
  const mobile = req.body.mobile;
  if (mobile.length == 10 && mobile.trim() != '') {
    User.findOne({ mobile })
      .then((user) => {
        if (user) {
          const OTP = generateOTP();
          sendOTP(mobile, OTP);
          User.updateOne({ mobile }, { $set: { token: OTP } })
            .then(() => {
              req.session.verifyPage = true;
              res.render('users/otpVerify', { message: '' });
            })
            .catch((error) => {
              console.log(error.message);
            });
        } else {
          const message = 'invalid credintials';
          res.render('users/mobileOtp', { message });
        }
      })
      .catch((error) => {
        console.log(error.message);
      });
  } else {
    const message = 'fields cannot be empty';
    res.render('users/mobileOtp', { message });
  }
};

const sendEmailOtp = async (req, res) => {
  try {
    res.render('users/emailOtp', { message: '' });
  } catch (error) {
    console.log(error.message);
  }
};
// =====================email logic=============================
const emailOtp = async (req, res) => {
  try {
    const enteredEmail = req.body.email;
    const OTP = generateOTP();
    if (enteredEmail === '') {
      return res.render('users/emailOtp', { message: 'fields should not be empty' });
    }

    const result = await User.findOneAndUpdate(
      { email: enteredEmail },
      { $set: { token: OTP } }
    );
    if (result) {
      req.session.userId = result._id;
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: config.email,
          pass: config.pass,
        },
      });

      const options = {
        from: 'soleseeker12345@gmail.com',
        to: enteredEmail,
        subject: 'Sole Seeker OTP Verification',
        text: `DO NOT SHARE: Your Mzee OTP is ${OTP}`,
      };

      await transporter.sendMail(options);

      req.session.verifyPage = true;
      req.session.changePassword = true;

      return res.render('users/otpVerify', { message: '' });
    } else {
      return res.render('users/emailOtp', { message: 'incorrect credentials' });
    }
  } catch (error) {
    console.log(error.message);
  }
};
// =======================change password====================
const verifyPassword = async (req, res) => {
  const { password, cPassword } = req.body;
  const id = req.session.userId;
  try {
    if (password.trim() != '' && cPassword.trim() != '') {
      if (password == cPassword) {
        const passwordhash = await securePassword(password);
        if (passwordhash) {
          const update = await User.updateOne(
            { _id: id },
            { $set: { password: passwordhash } }
          );
          if (update) {
            req.session.user = false;
            res.redirect('/login');
          } else {
            throw new Error("couldn't update the user");
          }
        } else {
          throw new Error('password hasing is not working');
        }
      } else {
        throw new Error('both password are not matching');
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const displayCategory = async (req, res) => {
  try {
    const categoryId = req.query.id;

    let page = 1;

    if (req.query.page) {
      page = req.query.page;
    }
    const limit = 4;

    const minPrice = parseFloat(req.query.minPrice) || 0; // Minimum price
    const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_VALUE; // Maximum price

    const categoriesPromise = await getCategory();
    let countPromise, productsPromise;
    if (categoryId === 'All') {
      countPromise = Product.aggregate([
        {
          $match: { isDeleted: false, price: { $gte: minPrice, $lte: maxPrice } },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            count: 1,
          },
        },
      ]);
      productsPromise = Product.find({
        isDeleted: false,
        price: { $gte: minPrice, $lte: maxPrice },
      })
        .sort(getSortQuery(req.query.sort))
        .limit(limit * 1)
        .skip((page - 1) * limit);
    } else {
      countPromise = Product.aggregate([
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'categoryData',
          },
        },
        {
          $match: {
            'categoryData.categoryName': categoryId,
            isDeleted: false,
            price: { $gte: minPrice, $lte: maxPrice },
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            count: 1,
          },
        },
      ]);

      productsPromise = Product.aggregate([
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'categoryData',
          },
        },
        {
          $match: {
            'categoryData.categoryName': categoryId,
            isDeleted: false,
            price: { $gte: minPrice, $lte: maxPrice },
          },
        },
        {
          $sort: getSortQuery(req.query.sort), // Sort by your criteria
        },
        {
          $skip: (page - 1) * limit, // Skip documents based on the page number
        },
        {
          $limit: limit, // Limit the number of documents per page
        },
      ]);
    }
    const [countObj, products, categories] = await Promise.all([
      countPromise,
      productsPromise,
      categoriesPromise,
    ]);
    if (countObj.length !== 0) {
      const count = countObj[0].count;

      const user = req.session.userData;
      if (user) {
        const userData = await User.findById(user._id);

        const carts = userData.cart;
        const wishList = userData.wishList;

        res.render('users/shop', {
          products,
          count: count / limit + 1,
          cart: carts,
          cLength: count,
          wishlist: wishList,
          categoryName: categoryId,
          userData,
          page,
          categories,
        });
      } else {
        res.render('users/shop', {
          products,
          count: count / limit + 1,
          cLength: count,
          categoryName: categoryId,
          page,
          categories,
        });
      }
    } else {
      return res
        .status(404)
        .render('error/404', { err404Msg: 'The requested resource was not found' });
    }
  } catch (error) {
    console.log(error.message);
  }
};

function getSortQuery (sortType) {
  let sortQuery = { createdAt: -1 };
  switch (sortType) {
    case '1':
      sortQuery = { price: 1 };
      break;
    case '2':
      sortQuery = { price: -1 };
      break;
    case '3':
      sortQuery = { createdAt: -1 };
      break;
    case '4':
      sortQuery = { createdAt: 1 };
      break;
  }
  return sortQuery;
}

const proSearch = async (req, res) => {
  try {
    const searchText = req.query.search;
    const matchingCategories = await Category.find({
      categoryName: { $regex: searchText, $options: 'i' },
    });
    const categoryIds = matchingCategories.map((category) => category._id);
    const result = await Product.find({
      $and: [
        { isDeleted: false },
        {
          $or: [
            { productName: { $regex: searchText, $options: 'i' } },
            { category: { $in: categoryIds } },
          ],
        },
      ],
    }).populate('category');

    const categories = await getCategory();
    if (req.session.user) {
      const user = req.session.userData;

      const userData = await User.findById(user._id).populate({
        path: 'cart.prod_id',
        model: 'Product',
        populate: {
          path: 'category',
          model: 'Category',
        },
      });
      res.render('users/index', { userData, categories, products: result });
    } else {
      res.render('users/index', { categories, products: result });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { id, size } = req.body;
    const userData = req.session.userData;
    if (!userData) {
      return res.status(401).json('login');
    }
    const product = await Product.findOne({ _id: id });
    if (!product) {
      return res.status(401).json('Product not found');
    }
    const user = await User.findById(userData._id);

    const existingListItem = user.wishList.find(
      (item) => item.prod_id.toString() === id.toString() && item.size == size
    );

    if (existingListItem) {
      return res.json('exists');
    } else {
      const newItem = {
        prod_id: id,
        unit_price: product.price,
        size,
      };
      user.wishList.push(newItem);
      const updatedUser = await user.save();
      if (updatedUser) {
        return res.json('added');
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const wishlist = async (req, res) => {
  try {
    const user = req.session.userData;
    const userId = new mongoose.Types.ObjectId(user._id);
    const userData = await User.findById(user._id);
    const categories = await getCategory();
    const cart = userData.cart;

    const wishlist = await User.aggregate([
      { $match: { _id: userId } },
      {
        $unwind: '$wishList',
      },
      {
        $lookup: {
          from: 'products', // Replace with the actual name of your products collection
          localField: 'wishList.prod_id',
          foreignField: '_id',
          as: 'wishList.product',
        },
      },
      {
        $unwind: '$wishList.product',
      },
      {
        $group: {
          _id: 0,
          wishList: { $push: '$wishList' },
        },
      },
      {
        $project: {
          _id: 0, // Exclude the _id field
          wishList: 1, // Include only the wishlist field
        },
      },
    ]);
    if (wishlist.length === 0) {
      return res.render('users/wishlist', {
        userData,
        categories,
        cart,
        wishlist,
      });
    }

    return res.render('users/wishlist', {
      userData,
      categories,
      cart,
      wishlist: wishlist[0].wishList,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const deleteWishlist = async (req, res) => {
  try {
    const id = req.body.id;
    const user = req.session.userData;
    const updated = await User.findOneAndUpdate(
      { _id: user._id },
      { $pull: { wishList: { _id: id } } }
    );
    if (!updated) {
      throw new Error('error while deleting the wishlist item');
    }
    res.json('done');
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadSignup,
  signupUser,
  sendOTP,
  mobileOtp,
  verifyOTP,
  loadUserPage,
  loadLogin,
  signIn,
  sendOtp,
  sendEmailOtp,
  emailOtp,
  verifyPassword,
  displayCategory,
  proSearch,
  addToWishlist,
  wishlist,
  deleteWishlist,
  why,
};
