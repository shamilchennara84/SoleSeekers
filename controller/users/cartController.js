/* eslint-disable eqeqeq */
/* eslint-disable comma-dangle */
/* eslint-disable semi */
const config = require('../../config/config');
const { User } = require('../../models/userModel');
const Category = require('../../models/categoryModel');
const Product = require('../../models/productModel');
const Coupon = require('../../models/couponModel');
const mongoose = require('mongoose')

// ================Get all active categories========================

const getCategory = async function () {
  try {
    const categories = await Category.find({ active: true });
    return categories;
  } catch (error) {
    throw new Error('Could not find categories');
  }
};

// ================get address========================

const getAddress = async function (id) {
  try {
    const userData = await User.findById(id);
    const address = userData.addresses;
    return address;
  } catch (error) {
    console.error(error.message);
    throw new Error('Error fetching Address');
  }
};
// ================getTotalSum========================

const getTotalSum = async function (id) {
  try {
    const userData = await User.findById({ _id: id });
    if (userData.cart) {
      const cart = userData.cart;
      const sum = cart.reduce((sum, item) => sum + item.total_price, 0);
      return sum;
    } else return 0;
  } catch (error) {
    console.error(error.message);
    throw new Error('error while calculating net total price of cart item');
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

// ============average rating===========================

function calculateAverageRating (ratings) {
  if (!ratings || ratings.length === 0) {
    return 0;
  }

  const totalRating = ratings.reduce((sum, rating) => sum + rating.rate, 0);
  return totalRating / ratings.length;
}

const productView = async (req, res) => {
  try {
    const id = req.query.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).render('error/400', { err400Msg: 'Invalid product ID' });
    }
    const productDetails = await Product.findById({ _id: id }).populate('category').populate('rating.customer');
    if (!productDetails) {
      return res.status(404).render('error/404', { err404Msg: 'The requested resource was not found' });
    }

    const rating = productDetails.rating;
    const avgRating = calculateAverageRating(rating);
    if (req.session.user) {
      const user = req.session.userData;
      const userData = await User.findOne({ _id: user._id }).populate({
        path: 'cart.prod_id',
        model: 'Product',
        populate: {
          path: 'category',
          model: 'Category',
        },
      });

      return res.render('users/productView', {
        userData,
        product: productDetails,
        avgRating,
      });
    } else {
      res.render('users/productView', {
        product: productDetails,
        avgRating,
      });
    }
  } catch (error) {
    console.log(error.message);
    const statusCode = error.status || 500;
    res.status(statusCode).send(error.message);
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
      return res.status(404).render('error/404', { err404Msg: 'The requested resource was not found' });
    }
    const user = await User.findById(userData._id);
    const existingCartItem = user.cart.find((item) => item.prod_id.toString() === id.toString() && item.size == size);
    if (existingCartItem && existingCartItem.qty < product.stock) {
      existingCartItem.qty += 1;
      existingCartItem.total_price = existingCartItem.qty * existingCartItem.unit_price;
      const updatedUser = await user.save();
      if (updatedUser) {
        return res.json('updated');
      }
    } else {
      const newItem = {
        prod_id: id,
        qty: 1,
        unit_price: product.price,
        total_price: product.price,
        size,
      };
      user.cart.push(newItem);
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

const cart = async (req, res) => {
  try {
    const userData = req.session.userData;
    const id = userData._id;
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
    if (!user) {
      return res.status(404).render('error/404', { err404Msg: 'The requested resource was not found' });
    }
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
    const statusCode = error.status || 500;
    res.status(statusCode).send(error.message);
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

    userData.cart.splice(existingCartItemIndex, 1);
    await userData.save();
    const message = 'item deleted';
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
// =============payment section===========================
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
      const keyId = config.secretId;
      res.render('users/payment', {
        categories,
        keyId,
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
// ====================payment mode====================================
const paymentMode = async (req, res) => {
  try {
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
    if (userData.cart.length == 0) {
      res.json({ cartEmpty: true });
    } else {
      const cart = userData.cart;
      const cartItems = [];
      cart.forEach((item) => {
        cartItems.push({
          productId: item.prod_id._id,
          productName: item.prod_id.productName,
          price: item.unit_price,
          category: item.prod_id.category.categoryName,
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

      function createOrders (cart, paymentMode, address, orderBill) {
        const newOrder = {
          owner: userData._id,
          address,
          items: cartItems,
          paymentMode,
          orderBill,
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
      } else if (paymentMode == 'wallet') {
        if (userData.wallet >= orderBill) {
          createOrders(cart, paymentMode, address, orderBill);
          await User.findByIdAndUpdate({ _id: userData._id }, { $inc: { wallet: -orderBill } });
          res.json({ walletSuccess: true });
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};
const applyCoupon = async (req, res) => {
  try {
    const code = req.body.coupon;
    const bill = req.body.bill;

    const couponFound = await Coupon.findOne({ code });
    if (couponFound) {
      if (couponFound.Status === 'Active') {
        const coupDate = new Date(couponFound.expiryDate);
        const currDate = new Date();
        const status = currDate.getTime() > coupDate.getTime() ? 'Expired' : 'Active';

        await Coupon.findOneAndUpdate({ code }, { $set: { Status: status } });

        const Vcoupon = await Coupon.findOne({ code }); // Extra validation

        if (Vcoupon.minBill < bill) {
          req.session.appliedCoupon = Vcoupon;
          const deduction = (bill * Vcoupon.value) / 100;
          let final;
          if (Vcoupon.maxAmount > deduction) {
            final = bill - (bill * Vcoupon.value) / 100;
          } else {
            final = bill - Vcoupon.maxAmount;
          }

          req.session.orderBill = final;
        }
        res.json(couponFound);
      } else {
        res.json(couponFound);
      }
    } else {
      res.json(307);
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  productView,
  addToCart,
  cart,
  cartOperation,
  deleteCart,
  checkout,
  paymentLoad,
  payment,
  paymentMode,
  applyCoupon,
};
