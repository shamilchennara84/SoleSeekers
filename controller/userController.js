const config = require('../config/config');

const User = require('../models/userModel');

const bcrypt = require('bcrypt');
// const twilio = require('twilio');
const client = require('twilio')(config.accountSID, config.authToken);

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

// ================load Rgister Page========================

const loadSignup = async (req, res) => {
  try {
    res.render('users/signup');
  } catch (error) {
    console.log(error.message);
  }
};
// ================load User Page========================

const loadUserPage = async (req, res) => {
  try {
    res.send(req.session.userData);
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
// ================sending otp========================

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
    // } else {
    //   if (req.session.verifypage) {
    //     const otp = req.query.otp;
    //     User.findOne({ token: otp })
    //       .then((result) => {
    //         if (result) {
    //           if (req.session.changePassword) {
    //             res.render('user/changePassword');
    //           } else {
    //             req.session.userData = result;
    //             req.session.user = true;
    //             res.redirect('/user');
    //             resolve();
    //           }
    //         } else {
    //           res.render('users/otpVerify', { message: 'the otp is incorrect' });
    //         }
    //       })
    //       .catch((error) => {
    //         console.log(error.message);
    //         reject(error);
    //       });
    //   }
    }
  });
};

// ==========================================================

const mobileOtp = async (req, res) => {
  try {
    res.render('users/mobileOtp');
  } catch (error) {
    console.log(error.message);
  }
};

// ================signup backend validation and OTP generating ========================

const signupUser = async (req, res) => {
  try {
    console.log('signup user');
    console.log(req.body);
    const { email, mobile, password, cPassword, name } = req.body;
    console.log('1');

    const [emailExist, mobileExist] = await Promise.all([User.findOne({ email }), User.findOne({ mobile })]);
    console.log(emailExist);
    console.log(mobileExist);

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
      return res.render('users/otpVerify');
    } else {
      console.log('why');
    }
  } catch (error) {
    console.log(error.message);
  }
};

// const spassword = await securePassword(req.body.password)

module.exports = { loadSignup, signupUser, sendOTP, mobileOtp, verifyOTP, loadUserPage };
