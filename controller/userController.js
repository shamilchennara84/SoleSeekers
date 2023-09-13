const config = require('../config/config');
const User = require('../models/userModel');

const bcrypt = require('bcrypt');
const client = require('twilio')(config.accountSID, config.authToken);
const nodemailer = require('nodemailer');

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
    res.render('users/signup', { message: '' });
  } catch (error) {
    console.log(error.message);
  }
};
// ================load User Page========================

const loadUserPage = async (req, res) => {
  try {if(req.session.user){
    res.send(req.session.userData);
  } 
    else{
      res.redirect("/login")
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
                res.render('users/changePassword',{message:""});
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
      console.log("email has been sent")
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
const verifyPassword = async(req,res)=>{
  const {password,cPassword}=req.body
  const id=req.session.userId
  try{
    if(password!="" &&cPassword!=""){
      if(password==cPassword){
        const passwordhash = await securePassword(password)
        if(passwordhash){
          const update = await User.updateOne({_id:id},{$set:{password:passwordhash}})
          if(update){
            req.session.user = false;
            res.redirect('/login')
          }else{
            throw new Error("couldn't update the user")
          }
        }
        else{
          throw new Error("password hasing is not working")
        }
      }
      else{
        throw new Error('both password are not matching')
      }
    }
  }
  catch(error){
    console.log(error.message);
  }
}

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
  verifyPassword
  
};
