const config = require('../config/config');
const { User } = require('../models/userModel');
const { Address } = require('../models/userModel');

const bcrypt = require('bcrypt');
const client = require('twilio')(config.accountSID, config.authToken);
const nodemailer = require('nodemailer');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');

// otp=======================

const generateOTP = function () {
  return Math.floor(100000 + Math.random() * 900000);
};

// ================brypt========================

const securePassword = async (password) => {
  try {
    const saltRound = 10; // Number of salt rounds for bcrypt hashing

    const passwordHash = await bcrypt.hash(password, saltRound);
    return passwordHash;
  } catch (err) {
    console.log(error.message);
  }
};
// ================get categories========================

const getCategory = async function () {
  try {
    const categories = await Category.find();
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
    throw new Error('Could not find products');
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
// ================load User Page========================

const loadUserPage = async (req, res) => {
  try {
    const categories = await getCategory();
    const products = await getProducts();
    if (req.session.user) {
      const userData = req.session.userData;
      const result = await User.findById({ _id: userData._id });
      if (result.blockStatus === true) {
        req.session.user = false;
      }
      res.render('users/index', {
        userData: userData,
        products: products,
        categories: categories,
      });
    } else {
      // res.render('users/index', {
      //   products: products,
      //   categories: categories,
      // });
      res.send('user not logged in');
    }
  } catch (error) {
    console.log(error.message);
  }
};
// ================load load Login========================

const loadLogin = async (req, res) => {
  try {
    res.render('users/login', { successmessage: '', message: '' });
  } catch (error) {
    console.log(error.message);
  }
};

// ================sending otp========================

const sendOTP = (mobile, OTP) => {
  return new Promise((resolve, reject) => {
    const phoneNumber = `+91${mobile}`; // Add the country code
    client.messages
      .create({ body: `DO NOT SHARE: your SoleSeeker OTP is ${OTP}`, to: phoneNumber, from: '+14788181316' })
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
    console.log('signup user');
    console.log(req.body);
    const { email, mobile, password, cPassword, name } = req.body;

    const [emailExist, mobileExist] = await Promise.all([User.findOne({ email }), User.findOne({ mobile })]);

    if (emailExist != null) {
      return res.render('users/signup', { message: ' Email already used' });
    } else if (mobileExist != null) {
      return res.render('users/signup', { message: 'Mobile number already exists' });
    } else if (password != cPassword) {
      return res.render('users/signup', { message: "passwords doesn't match" });
    } else if (password != '' && cPassword != '' && email != '' && mobile != '' && name != '') {
      const OTP = generateOTP();
      req.session.OTPofuser = OTP;
      req.session.otpmobile = { mobile, name, email, password };
      sendOTP(mobile, OTP);
      return res.render('users/otpVerify', { message: '' });
    } else {
      console.log('why');
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
      if (req.query.otp == OTP && req.query.otp != '') {
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

// / ================simple signin   ========================

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (password != '' && email != '') {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Email or passwrod is incorrect,try again');
      }
      const passwordmatch = await bcrypt.compare(password, user.password);
      if (!passwordmatch) {
        throw new Error('Email or passwrod is incorrect,try again');
      }

      if (user.blockStatus) {
        throw new Error('youru account is blocked, please contact admin');
      }

      req.session.userData = user;
      req.session.user = true;
      res.redirect('/user');
    }
  } catch (error) {
    console.log(error.message);
    req.session.user = false;
    res.render('users/login', { message: error.message });
  }
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
  if (mobile.length == 10 && mobile != '') {
    User.findOne({ mobile: mobile })
      .then((user) => {
        if (user) {
          const OTP = generateOTP();
          sendOTP(mobile, OTP);
          User.updateOne({ mobile: mobile }, { $set: { token: OTP } })
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
    console.log(OTP);
    const result = await User.findOneAndUpdate({ email: enteredEmail }, { $set: { token: OTP } });
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
      console.log('email has been sent');
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
    if (password != '' && cPassword != '') {
      if (password == cPassword) {
        const passwordhash = await securePassword(password);
        if (passwordhash) {
          const update = await User.updateOne({ _id: id }, { $set: { password: passwordhash } });
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

const productView = async (req, res) => {
  try {
    const id = req.query.id;
    // const name = req.query.name
    const productDetails = await Product.findById({ _id: id }).populate('category');
    if (productDetails) {
      if (req.session.userData) {
        res.render('users/productView', {
          userData: req.session.userData,
          product: productDetails,
        });
      } else {
        res.send('User is loggedout');
      }
    } else {
      throw new Error('error while fetching the product');
    }
  } catch (error) {
    console.log(error.message);
  }
};

const userProfile = async (req, res) => {
  try {
    const userData = req.session.userData;
    const errorMessage = req.session.errorMessage;
    const successMessage = req.session.successMessage;
    console.log(successMessage);

    const categories = await getCategory();

    if (req.query.add) {
      const addAddress = 'for add address panel';
      if (req.query.checkout) {
        const toCheckout2 = 'to go checkout';
        console.log('1');
        return res.render('users/userProfile', {
          addAddress,
          toCheckout2,
          userData,
          // cart: carts,
          // wishlist: wishlists,
          categories,
        });
      } else {
        console.log('2');
        return res.render('users/userProfile', {
          addAddress,
          userData,
          // cart: carts,
          // wishlist: wishlists,
          categories,
        });
      }
    } else if (req.query.edit) {
      const id = req.query.edit;
      if (req.query.checkout) {
        const address = userData.addresses.find((address) => address._id === id);
        console.log(address);
        const toEditAddress = 'this for edit purpose it redirected to profile';
        const toCheckout = 'this for checkout';
        console.log('3');
        return res.render('users/userProfile', {
          toEditAddress,
          editAddress: address,
          toCheckout,
          // wishlist: wishlists,
          // cart: carts,
          userData,
          categories,
        });
      } else {
        const address = userData.addresses.find((address) => address._id === id);
        console.log(address);
        const toEditAddress = 'this for edit purpose it redirected to profile';
        console.log('4');
        return res.render('users/userProfile', {
          toEditAddress,
          editAddress: address,
          userData,
          // wishlist: wishlists,
          // cart: carts,
          categories,
        });
      }
    } else if (req.query.passEdit) {
      const toEditPassword = 'this for password editing';
      console.log('5');
      return res.render('users/userProfile', {
        toEditPassword,
        userData,
        errorMessage,
        // cart: carts,
        // wishlist: wishlists,
        categories,
      });
    } else if (req.query.userEdit) {
      const toEditUser = 'this for Edit user Page';
      console.log('6');
      return res.render('users/userProfile', {
        toEditUser,
        userData,
        categories,
        // cart: carts,
        // wishlist: wishlists,
        errorMessage,
      });
    } else {
      const address = userData.addresses;
      if (address) {
        console.log('7');
        return res.render('users/userProfile', {
          userData,
          address,
          // wishlist: wishlists,
          // cart: carts,
          categories,
          successMessage,
        });
      } else {
        console.log('8');
        return res.render('users/userProfile', { userData, categories });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const updateUser = async (req, res) => {
  try {
    const id = req.query.id;
    const { name, email, mobile } = req.body;
    if (name != '' && email != '' && mobile != '') {
      const existingUser = await User.findOne({
        $and: [
          {
            $or: [{ email }, { mobile }],
          },
          {
            _id: { $ne: id },
          },
        ],
      });

      if (existingUser) {
        const message = 'email or password are already taken';
        req.session.errorMessage = message;
        req.session.successMessage = '';
        return res.redirect('/profile?userEdit=true');
      } else {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: id },
          {
            $set: {
              name,
              mobile,
              email,
            },
          },
          { new: true }
        );
        console.log(updatedUser);
        const message = 'Profile edited Successfully (reflects made by after login)';
        req.session.userData = updatedUser;
        req.session.successMessage = message;
        req.session.errorMessage = '';
        return res.redirect('/profile');
      }
    } else {
      const message = 'Name, email, and mobile fields cannot be empty.';
      req.session.errorMessage = message;
      req.session.successMessage = '';
      return res.redirect('/profile?userEdit=true');
    }
  } catch (error) {
    console.log(error.message);
  }
};

const userAddress = async (req, res) => {
  try {
    const userData = req.session.userData;
    const id = userData._id;
    const address = new Address({
      name: req.body.name,
      mobile: req.body.mobile,
      address1: req.body.address1,
      address2: req.body.address2,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
    });
    const updatedUser = await User.findByIdAndUpdate({ _id: id }, { $push: { addresses: address } }, { new: true });
    req.session.userData = updatedUser;
    const message = 'Address added successfully';
    req.session.successMessage = message;
    req.session.errorMessage = '';
    if (req.query.checkout) {
      req.query.checkout = false;
      res.redirect('/cart/checkout');
    } else {
      res.redirect('/profile');
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteAddress = async (req, res) => {
  try {
    const userID = req.session.userData._id;
    const addressId = req.query.id;
    const updatedUser = await User.findByIdAndUpdate(
      { _id: userID },
      { $pull: { addresses: { _id: addressId } } },
      { new: true }
    );
    req.session.userData = updatedUser;
    const message = 'Address Deleted Successfully';
    req.session.errorMessage = '';
    req.session.successMessage = message;
    res.redirect('/profile');
  } catch (error) {
    console.log(error.message);
  }
};

const updateAddress = async (req, res) => {
  try {
    const userID = req.session.userData._id;
    const addressId = req.query.id;
    console.log(userID, '    ', addressId);
    const addressNew = {
      name: req.body.name,
      mobile: req.body.mobile,
      address1: req.body.address1,
      address2: req.body.address2,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
    };
    const updatedUser = await User.findOneAndUpdate(
      { _id: userID, 'addresses._id': addressId },
      { $set: { 'addresses.$': addressNew } },
      { new: true }
    );
    req.session.userData = updatedUser;
    const message = 'Address Updated Successfully';
    req.session.errorMessage = '';
    req.session.successMessage = message;
    res.redirect('/profile');
  } catch (error) {
    console.log(error.message);
  }
};

const changePassword = async (req, res) => {
  try {
    const id = req.query.id;
    const { currPass, newPass, repeatPass } = req.body;
    if (currPass != '' && newPass != '' && repeatPass != '') {
      if (newPass === repeatPass) {
        const user = await User.findById({ _id: id });
        const passwordmatch = await bcrypt.compare(currPass, user.password);
        if (passwordmatch) {
          const passwordHash = await securePassword(newPass);
          await User.findByIdAndUpdate({ _id: id }, { $set: { password: passwordHash } });
          req.query.passEdit = false;
          const message = 'password has been changed successfully';
          req.session.user = true;
          req.session.errorMessage = '';
          req.session.successMessage = message;
          res.redirect('/profile');
        } else {
          const message = ' previous password is incorrect';
          req.session.errorMessage = message;
          req.session.successMessage = '';
          res.redirect('/profile?passEdit=true');
        }
      }
    } else {
      const message = 'password and fields dont be blank';
      req.session.errorMessage = message;
      req.session.successMessage = '';
      res.redirect('/profile?passEdit=true');
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addToCart = async (req, res) => {
  try {
    const id = req.body.id;
    const userData = req.session.userData;

    if (!userData) {
      return res.status(401).json('login required');
    }
    const result = await Product.findOne({ _id: id });
    if (!result) {
      return res.status(401).json('Product not found');
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userData._id },
      {
        $push: {
          cart: {
            prod_id: result._id,
            qty: 1,
            unit_price: result.price,
            total_price: result.price,
            size: req.body.size,
          },
        },
      },
      { new: true }
    );
    console.log(updatedUser);
    req.session.userData = updateUser;

    if (!updatedUser) {
      return res.status(404).json({ message: 'updation failed' });
    }
    res.json('added');
  } catch (error) {
    console.log(error.message);
  }
};

const cart = async (req, res) => {
  try {
    const userData = req.session.userData;
    const id = req.query.id;
    // const cartMessage = res.session.cartMessage;
    const categories = await getCategory();

    const user = await User.findById({ _id: id });
    const cart = user ? user.cart : [];

    if (cart.length === 0 || !cart) {
      return res.render('user/cart', {
        cart,
        categories,
        userData,
        cartBill: 0,
        message: cartMessage,
      });
    }
    else{
      const result = await getTotalSum(id)
      req.session.cartBill = result
      return res.render("user/cart",{
        cart,categories,cartBill:result,userData,message:cartMessage
      })
    }
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
  productView,
  userProfile,
  updateUser,
  userAddress,
  deleteAddress,
  updateAddress,
  changePassword,
  addToCart,
  cart,
};
