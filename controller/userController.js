const config = require('../config/config');
const { User } = require('../models/userModel');
const { Address } = require('../models/userModel');

const bcrypt = require('bcrypt');
const client = require('twilio')(config.accountSID, config.authToken);
const nodemailer = require('nodemailer');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const Razorpay = require('razorpay');
const { error } = require('jquery');

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
    throw new Error('Could not find products');
  }
};
// ================get address========================

const getAddress = async function (id) {
  try {
    const userData = await User.findById(id);
    const address = userData.addresses;
    return address;
  } catch (error) {
    throw new Error('error while getting address');
  }
};
// ================getTotalSum========================

const getTotalSum = async function (id) {
  try {
    const user = await User.findById({ _id: id });
    if (user.cart) {
      const cart = user.cart;
      const sum = cart.reduce((sum, item) => sum + item.total_price, 0);
      return sum;
    } else return 0;
  } catch (error) {
    throw new Error('error while calculating net total price');
  }
};
// ================getTotalCount========================

const getTotalCount = async function (id) {
  try {
    const user = await User.findById({ _id: id });
    if (user.cart) {
      const cart = user.cart;
      const count = cart.reduce((count, item) => count + item.qty, 0);
      return count;
    } else return 0;
  } catch (error) {
    throw new Error('error while calculating net total price');
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
      const user = req.session.userData;
      const userData = await User.findById(user._id);

      if (userData.blockStatus === true) {
        req.session.user = false;
      }
      res.render('users/index', {
        userData: userData,
        products: products,
        categories: categories,
      });
    } else {
      res.render('users/index', {
        products: products,
        categories: categories,
      });
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
    const user = req.session.userData;
    const userData = await User.findById(user._id);
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
        const message = 'Profile edited Successfully ';
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
    console.log(updatedUser);
    const message = 'Address Updated Successfully';
    req.session.errorMessage = '';
    req.session.successMessage = message;
    if (req.query.checkout) {
      req.query.checkout = false;
      return res.redirect('/cart/checkout');
    } else res.redirect('/profile');
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

    // console.log('user: ', user);

    const existingCartItem = user.cart.find((item) => item.prod_id.toString() === id.toString() && item.size == size);

    if (existingCartItem && existingCartItem.qty < product.stock) {
      existingCartItem.qty += 1;
      existingCartItem.total_price = existingCartItem.qty * existingCartItem.unit_price;
      const updatedUser = await user.save();
<<<<<<< Updated upstream
=======
      console.log('updating done', updatedUser);
>>>>>>> Stashed changes
      if (updatedUser) {
        res.json('updated');
      }
    } else {
      const newItem = {
        prod_id: id,
        qty: 1,
        unit_price: product.price,
        total_price: product.price,
        size: size,
      };
      user.cart.push(newItem);
      const updatedUser = await user.save();
      if (updatedUser) {
        res.json('added');
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const cart = async (req, res) => {
  try {
    const userData = req.session.userData;
    const id = req.query.id;
    const cartMessage = req.session.cartMessage ? req.session.cartMessage : '';
    req.session.cartMessage = '';
    const categories = await getCategory();

    const user = await User.findById({ _id: id }).populate({
      path: 'cart.prod_id', // Path to the product reference field
      model: 'Product', // Model to populate from (should match ref in schema)
      populate: {
        path: 'category',
        model: 'Category',
      },
    });

    const cart = user ? user.cart : [];

    if (cart.length === 0 || !cart) {
      res.render('users/cart', {
        cart,
        categories,
        userData: user,
        cartBill: 0,
        message: cartMessage,
      });
    } else {
      const result = await getTotalSum(id);

      res.render('users/cart', {
        cart,
        categories,
        cartBill: result,
        userData: user,
        message: cartMessage,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const cartOperation = async (req, res) => {
  try {
    const user = req.session.userData;
    req.session.cartMessage = '';

    if (!user.cart) {
      return res.redirect(`/cart?id=${user._id}`);
    }
    const userData = await User.findById(user._id);
    const itemID = req.body.id;
    const existingCartItemIndex = userData.cart.findIndex(
      (item) => item._id.toString() === itemID.toString() && item.size == req.body.size
    );

    if (req.body.add) {
      if (existingCartItemIndex !== -1) {
        const existingCartItem = userData.cart[existingCartItemIndex];
        existingCartItem.qty += 1;
        existingCartItem.total_price = existingCartItem.qty * existingCartItem.unit_price;
        await userData.save();
        const totalSum = await getTotalSum(user._id);
        const count = await getTotalCount(user._id);
        res.json({ totalSum, count });
      }
    } else if (req.body.sub) {
      if (existingCartItemIndex !== -1) {
        const existingCartItem = userData.cart[existingCartItemIndex];
        existingCartItem.qty -= 1;

        if (existingCartItem.qty === 0) {
          userData.cart.splice(existingCartItemIndex, 1);
          await userData.save();
          const totalSum = await getTotalSum(userData._id);
          const count = await getTotalCount(userData._id);
          return res.json({ totalSum, count });
        }

        existingCartItem.total_price = existingCartItem.qty * existingCartItem.unit_price;
        await userData.save();
        const totalSum = await getTotalSum(userData._id);
        const count = await getTotalCount(userData._id);
        res.json({ totalSum, count });
      }
    }

    // Handle other cases if needed
  } catch (error) {
    console.log(error.message);
  }
};

const deleteCart = async (req, res) => {
  try {
    const user = req.session.userData;

    const itemID = req.query.id;
    const userData = await User.findById(user._id);
    const existingCartItemIndex = userData.cart.findIndex(
      (item) => item._id.toString() === itemID.toString() && item.size == req.query.size
    );

    console.log('existingCartItemIndex:', existingCartItemIndex);

    userData.cart.splice(existingCartItemIndex, 1);
    await userData.save();
    message = 'item deleted';
    req.session.cartMessage = message;
    return res.redirect(`/cart?id=${userData._id}`);
  } catch (error) {
    console.log(error.message);
  }
};

const checkout = async (req, res) => {
  try {
    const user = req.session.userData;
    const categories = await getCategory();
    const userData = await User.findById(user._id).populate({
      path: 'cart.prod_id', // Path to the product reference field
      model: 'Product', // Model to populate from (should match ref in schema)
      populate: {
        path: 'category',
        model: 'Category',
      },
    });
    if (userData.cart.length === 0) {
      return res.redirect('/cart');
    } else {
      const address = await getAddress(user._id);
      console.log(address);
      if (req.session.user) {
        const totalBill = await getTotalSum(user._id);
        req.session.oldBill = totalBill;
        res.render('users/checkout', {
          userData,
          address,
          categories,
          totalBill,
          cart: userData.cart,
        });
      } else {
        return res.redirect('/login');
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const paymentLoad = (req, res) => {
  try {
    req.session.selectedAddressIndex = req.body.selectedAddressIndex;
    return res.redirect(`/cart/checkout/payment?index=${req.body.selectedAddressIndex}`);
  } catch (error) {
    console.log(error.message);
  }
};

const payment = async (req, res) => {
  try {
    const selectedAddress = req.query.index;
    const user = req.session.userData;
    req.session.selectedAddress = selectedAddress;
    const categories = await getCategory();
    const userData = await User.findById(user._id).populate({
      path: 'cart.prod_id', // Path to the product reference field
      model: 'Product', // Model to populate from (should match ref in schema)
      populate: {
        path: 'category',
        model: 'Category',
      },
    });
    if (userData.cart.length == 0) {
      return res.redirect('/cart');
    } else {
      const cart = userData.cart;
      const totalBill = await getTotalSum(user._id);
      req.session.orderBill = totalBill;
      res.render('users/payment', {
        categories,
        selectedAddress,
        cart,
        userData,
        totalBill,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const paymentMode = async (req, res) => {
  try {
    console.log('paymentmode========>');
    const user = req.session.userData;
    const paymentMode = req.body.radio;
    const addressId = req.session.selectedAddress;
    const orderBill = req.session.orderBill;
    const userData = await User.findById(user._id).populate({
      path: 'cart.prod_id',
      model: 'Product',
      populate: {
        path: 'category',
        model: 'Category',
      },
    });
    const cart = userData.cart;
    const cartItems = [];
    cart.forEach((item) => {
      cartItems.push({
        productId: item.prod_id._id,
        productName: item.prod_id.productName,
        price: item.unit_price,
        category: item.prod_id.category.category,
        img1: item.prod_id.img1,
        bill: item.total_price,
        size: item.size,
        quantity: item.qty,
      });
    });

    const addressR = await User.findOne(
      { _id: user._id, 'addresses._id': addressId }, // Match the user and address ID
      { _id: 0, 'addresses.$': 1 } // Use projection to get only the matched address
    );
    const addressData = addressR.addresses[0]; // Get the first (and only) address

    const address = {
      name: addressData.name,
      mobile: addressData.mobile,
      address1: addressData.address1,
      address2: addressData.address2,
      city: addressData.city,
      state: addressData.state,
      zip: addressData.zip,
    };
    console.log('address : ', address);
    function createOrders(cart, paymentMode, address, orderBill) {
      const newOrder = {
        owner: userData._id,
        address: address,
        items: cartItems,
        paymentMode: paymentMode,
        orderBill: orderBill,
        orderDate: Date(),
      };
      req.session.order = newOrder;
    }
    if (paymentMode == 'COD') {
      createOrders(cart, paymentMode, address, orderBill);
      res.json({ codSuccess: true });
    } else if (paymentMode == 'razorpay') {
      createOrders(cart, paymentMode, address, orderBill);
      res.redirect('/razorpay');
    }
  } catch (error) {
    console.log(error.message);
  }
};

const orderSuccessRedirect = async (req, res) => {
  try {
    const user = req.session.userData;
    const order = req.session.order;
    order.items.forEach((item) => {
      item.orderStatus = 'Processed';
    });
    const newOrder = new Order(order);
    const orderSaved = await newOrder.save();
    const userData = await User.findOneAndUpdate({ _id: user._id }, { $set: { cart: [] } }, { new: true });
    console.log(userData);
    console.log(orderSaved);

    return res.redirect('/orders?user=true');
  } catch (error) {
    console.log('error while storing the order data');
  }
};

const orders = async (req, res) => {
  try {
    const user = req.session.userData;
    const categories = await getCategory();
    const userData = await User.findById(user._id).populate({
      path: 'cart.prod_id',
      model: 'Product',
      populate: {
        path: 'category',
        model: 'Category',
      },
    });
    const cart = userData.cart;
    const data = await Order.find({ owner: user._id }).sort({ orderDate: -1 }).lean();
    const oldBill = req.session.oldBill;
    res.render('users/orders', {
      data,
      userData,
      cart,
      categories,
      oldBill,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const cancelOrder = async (req, res) => {
  try {
    const userData = req.session.userData;
    const id = req.body.id;
    const result = await Order.findOneAndUpdate(
      {
        owner: userData._id,
        'items._id': id,
      },
      {
        $set: { 'items.$.orderStatus': 'Cancelled' },
      }
    );
    const result2 = await Product.findOneAndUpdate(
      { _id: result.items[0].productId },
      { $inc: { stock: result.items[0].quantity } }
    );
    res.json(result2);
  } catch (error) {
    console.log(error.message);
  }
};

const returnOrder = async (req, res) => {
  try {
    const userData = req.session.userData;
    const id = req.body.id;
    const result = await Order.findOneAndUpdate(
      {
        owner: userData._id,
        'items._id': id,
      },
      {
        $set: { 'items.$.orderStatus': 'Return initiated' },
      }
    );
    const result2 = await Product.findOneAndUpdate(
      { _id: result.items[0].productId },
      { $inc: { stock: result.items[0].quantity } }
    );
    res.redirect('/orders?user=true');
  } catch (error) {
    console.log(error.message);
  }
};

const displayCategory = async (req, res) => {
  try {
    const categoryId = req.query.id;
    console.log('categoryId:', categoryId);
    let page = 1;

    if (req.query.page) {
      page = req.query.page;
    }
    const limit = 4;

    if (categoryId === 'All') {
      console.log('1');
      const categories = await getCategory();
      const count = await Product.count({ isDeleted: false });
      const products = await Product.find({ isDeleted: false })
        .sort(getSortQuery(req.query.sort))
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const user = req.session.userData;
      if (user) {
        console.log('2');
        const userData = await User.findById(user._id);

        const carts = userData.cart;
        const wishList = userData.wishList;

        res.render('users/shop', {
          products,
          count: count / limit + 1,
          cart: carts,
          cLength: count,
          wishlist: wishList,
          categoryName: 'All',
          userData: userData,
          page: page,
          categories: categories,
        });
      } else {
        console.log('3');
        res.render('users/shop', {
          products,
          count: count / limit + 1,
          cLength: count,
          categoryName: 'All',
          page: page,
          categories: categories,
        });
      }
    } else {
      console.log('4');
      const categories = await getCategory();
      const category = await Category.findById(categoryId);
      console.log('categories', categories);
      console.log('category.categoryName', category.categoryName);

      const count = await Product.count({
        $and: [{ category: category._id }, { isDeleted: false }],
      });
      const products = await Product.find({
        $and: [{ category: category._id }, { isDeleted: false }],
      })
        .sort(getSortQuery(req.query.sort))
        .limit(limit * 1)
        .skip((page - 1) * limit);

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
          categoryName: category.categoryName,
          userData: userData,
          page: page,
          categories: categories,
        });
      } else {
        res.render('users/shop', {
          products,
          count: count / limit + 1,
          cLength: count,
          categoryName: category.categoryName,
          page: page,
          categories: categories,
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

function getSortQuery(sortType) {
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

<<<<<<< Updated upstream
=======
const proSearch = async (req, res) => {
  try {
    const user = req.session.userData;
    const userData = await User.findById(user._id).populate({
      path: 'cart.prod_id',
      model: 'Product',
      populate: {
        path: 'category',
        model: 'Category',
      },
    });
    const searchText = req.query.search;
    const matchingCategories = await Category.find({
      category: { $regex: searchText, $options: 'i' },
    });
    console.log('matching:', matchingCategories);
    const categoryIds = matchingCategories.map((category) => category._id);
    const result = await Product.find({
      $and: [
        { isDeleted: false },
        {
          $or: [{ productName: { $regex: searchText, $options: 'i' } }, { category: { $in: categoryIds } }],
        },
      ],
    }).populate('category');

    const categories = await getCategory();
    if (req.session.user) {
      res.render('users/index', { userData, categories, products: result });
    } else {
      res.render('users/index', { categories, products: result });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const razorpayRedirect = async(req, res) => {
  try {
    const bill = req.session.orderBill;
    const razorpay = new Razorpay({
      key_id: config.secretId,
      key_secret: config.secretKey,
    });

    const options = {
      amount: bill * 100,
      currency: 'INR',
    };

    const order = await razorpay.orders.create(options)
    if(order){
      res.json({razorpay:true,order,bill})
    }
    else{
      throw new error("error while creating order")
    }
  } catch (error) {
    console.log(error.message);
  }
};

>>>>>>> Stashed changes
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
  cartOperation,
  deleteCart,
  checkout,
  paymentLoad,
  payment,
  paymentMode,
  orderSuccessRedirect,
  orders,
  cancelOrder,
  returnOrder,
  displayCategory,
<<<<<<< Updated upstream
=======
  proSearch,
  razorpayRedirect,
>>>>>>> Stashed changes
};

// Use aggregation to populate product data in the cart
// const cart = await User.aggregate([
//   {
//     $match: { _id: user._id },
//   },
//   {
//     $unwind: '$cart',
//   },
//   {
//     $lookup: {
//       from: 'products', // Collection name for Product model
//       localField: 'cart.prod_id',
//       foreignField: '_id',
//       as: 'cart.prod_data',
//     },
//   },
//   {
//     $unwind: '$cart.prod_data',
//   },
//   {
//     $group: {
//       _id: '$_id',
//       cart: {
//         $push: '$cart',
//       },
//     },
//   },
// ]);
