const { User } = require('../../models/userModel');
const { Address } = require('../../models/userModel');
const Category = require('../../models/categoryModel');
const bcrypt = require('bcrypt');


const securePassword = async (password) => {
  try {
    const saltRound = 10;
    const passwordHash = await bcrypt.hash(password, saltRound);
    return passwordHash;
  } catch (err) {
    console.log(error.message);
    const statusCode = error.status || 500;
    res.status(statusCode).send(error.message);
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

// ====================================================

const userProfile = async (req, res) => {
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
    const errorMessage = req.session.errorMessage;
    const successMessage = req.session.successMessage;
    const carts = userData.cart;
    const wishlists = userData.wishList;

    const categories = await getCategory();

    if (req.query.add) {
      const addAddress = 'for add address panel';
      if (req.query.checkout) {
        const toCheckout2 = 'to go checkout';

        return res.render('users/userProfile', {
          addAddress,
          toCheckout2,
          userData,
          cart: carts,
          wishlist: wishlists,
          categories,
        });
      } else {
        return res.render('users/userProfile', {
          addAddress,
          userData,
          cart: carts,
          wishlist: wishlists,
          categories,
        });
      }
    } else if (req.query.edit) {
      const id = req.query.edit;

      if (req.query.checkout) {
        const address = userData.addresses.find((address) => address._id == id);

        const toEditAddress = 'this for edit purpose it redirected to profile';
        const toCheckout = 'this for checkout';

        return res.render('users/userProfile', {
          toEditAddress,
          editAddress: address,
          toCheckout,
          wishlist: wishlists,
          cart: carts,
          userData,
          categories,
        });
      } else {
        const address = userData.addresses.find((address) => address._id == id);

        const toEditAddress = 'this for edit purpose it redirected to profile';

        return res.render('users/userProfile', {
          toEditAddress,
          editAddress: address,
          userData,
          wishlist: wishlists,
          cart: carts,
          categories,
        });
      }
    } else if (req.query.passEdit) {
      const toEditPassword = 'this for password editing';

      return res.render('users/userProfile', {
        toEditPassword,
        userData,
        errorMessage,
        cart: carts,
        wishlist: wishlists,
        categories,
      });
    } else if (req.query.userEdit) {
      const toEditUser = 'this for Edit user Page';

      return res.render('users/userProfile', {
        toEditUser,
        userData,
        categories,
        cart: carts,
        wishlist: wishlists,
        errorMessage,
      });
    } else {
      const address = userData.addresses;
      if (address) {
        return res.render('users/userProfile', {
          userData,
          address,
          wishlist: wishlists,
          cart: carts,
          categories,
          successMessage,
        });
      } else {
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
    if (name.trim() !== '' && email.trim() !== '' && mobile.trim() !== '') {
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
    if (currPass.trim() != '' && newPass.trim() != '' && repeatPass.trim() != '') {
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

module.exports = { userProfile, updateUser, userAddress, deleteAddress, updateAddress, changePassword };
