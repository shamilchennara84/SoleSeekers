const config = require('../config/config');
const Admin = require('../models/adminModel');

const User = require('../models/userModel');

module.exports = {
  getAdminLogin: async (req, res) => {
    try {
      if (req.session.admin) {
        res.render('admin/adminDashboard'); ////////////////////to change
      } else {
        res.render('admin/adminLogin', { message: '' });
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  adminLogin:async(req,res)=>{
      const {email,password} = req.body
      console.log(email)
      console.log(password)
      try{
         const adminData = await Admin.findOne({email,password})
         if(adminData){
            req.session.admin = true
            res.render('admin/adminDashboard');        ////////////////////to change
         }else{
          req.session.admin = false;
          res.render('admin/adminLogin', { message: 'wrong credentials' });
         }
        
      }catch(error){
        console.log(error.message)
      }
     
  }







};
