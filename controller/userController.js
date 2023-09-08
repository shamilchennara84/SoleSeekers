const user = require('../models/userModel');
const bcrypt = require('bcrypt');

// otp=======================

const generateOTP = function () {
  return Math.floor(100000 + Math.random() * 900000);
};

// ================brypt========================

const securePassword = async (password) => {
  try {
    const saltRound = 10; // Number of salt rounds for bcrypt hashing

    const passwordHash = await bcrypt.hash(password, saltRounds);
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

// ================sending otp========================

const sendOTP = (mobile,OTP)=>{
  return new Promise((resolve,reject)=>{
    client.messages.create({body:`DO NOT SHARE: your SoleSeeker OTP is ${OTP}`,
    to: "+91"+mobile,
    from: "+1385"
})
  .then((send)=>{
    resolve(send);
  })
  .catch((error)=>{
    console.log("error sending OTP" + error.message)
  })
})
}












// ================signup backend validation and OTP generating ========================

const signupUser = async (req, res) => {
  try {
    const {email,mobile,password,cPassword,name} =req.body

    const emailExist = await User.findOne({ email });
    const mobileExist = await User.findone({ mobile });
    if (emailExist) {
      return res.render('users/signup', { message: ' Email already used' });
    } 
    if (mobileExist) {
      return res.render('users/signup', { message: 'Mobile number already exists' });
      }
    if (req.body.password != req.body.sPassword) {
      return res.render('users/signup', { message: "passwords doesn't match" });
      } 
    if (
        req.body.password != '' &&
        req.body.cPassword != '' &&
        req.body.email != '' &&
        req.body.mobile != '' &&
        req.body.name != ''
      ) {
        const OTP = generateOTP();
        req.session.OTPofuser = OTP;
        req.session.otpmobile = {mobile,name};
        sendOTP(mobile, OTP);
        return res.render('users/otpVerify');
      }
    }
   catch (error) {
    console.log(error.message);
  }
};

// const spassword = await securePassword(req.body.password)

module.exports = { loadSignup, signupUser };
