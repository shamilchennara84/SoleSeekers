/* eslint-disable eqeqeq */
/* eslint-disable comma-dangle */
/* eslint-disable semi */
const Order = require('../../models/orderModel');
const helper = require('../../helper/helperFn');
const config = require('../../config/config');
const { User } = require('../../models/userModel');
const Category = require('../../models/categoryModel');
const Product = require('../../models/productModel');
const Razorpay = require('razorpay');

// ================Get all active categories========================

const getCategory = async function () {
  try {
    const categories = await Category.find({ active: true });
    return categories;
  } catch (error) {
    throw new Error('Could not find categories');
  }
};

// ====================================================================

const orderSuccessRedirect = async (req, res) => {
  try {
    const user = req.session.userData;
    const order = req.session.order;
    order.items.forEach((item) => {
      item.orderStatus = 'Processed';
    });
    const newOrder = new Order(order);
    await newOrder.save();
    await User.findOneAndUpdate({ _id: user._id }, { $set: { cart: [] } }, { new: true });

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
    const page = req.query.page || 1;
    const perPage = 2;
    const skip = (page - 1) * perPage;
    const TotalCount = await Order.find({ owner: user._id }).count();
    console.log(TotalCount);
    const data = await Order.find({ owner: user._id }).sort({ orderDate: -1 }).skip(skip).limit(perPage).lean();
    const oldBill = req.session.oldBill;
    const totalPages = Math.ceil(TotalCount / perPage);
    console.log(totalPages);
    res.render('users/orders', {
      data,
      userData,
      cart,
      categories,
      oldBill,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const cancelOrder = async (req, res) => {
  try {
    const userData = req.session.userData;
    const id = req.body.id;
    const mop = req.body.mop;
    const refund = parseInt(req.body.refund);
    const orderQuery = {
      owner: userData._id,
      'items._id': id,
    };

    const updateOrderStatus = { $set: { 'items.$.orderStatus': 'Cancelled' } };

    if (mop === 'razorpay' && req.body.refundOption === 'wallet') {
      const result = await Order.findOneAndUpdate(orderQuery, updateOrderStatus);
      await User.findByIdAndUpdate({ _id: userData._id }, { $inc: { wallet: refund } });
      const result2 = await Product.findOneAndUpdate(
        { _id: result.items[0].productId },
        { $inc: { stock: result.items[0].quantity } },
        { new: true }
      );
      res.json(result2);
    } else if (mop === 'wallet') {
      const result = await Order.findOneAndUpdate(orderQuery, updateOrderStatus);
      await User.findByIdAndUpdate({ _id: userData._id }, { $inc: { wallet: refund } });
      const result2 = await Product.findOneAndUpdate(
        { _id: result.items[0].productId },
        { $inc: { stock: result.items[0].quantity } }
      );
      res.json(result2);
    } else {
      const result = await Order.findOneAndUpdate(orderQuery, updateOrderStatus);
      const result2 = await Product.findOneAndUpdate(
        { _id: result.items[0].productId },
        { $inc: { stock: result.items[0].quantity } }
      );
      res.json(result2);
    }
  } catch (error) {
    console.log(error.message);
  }
};

const returnOrder = async (req, res) => {
  try {
    const userData = req.session.userData;
    const id = req.params.id;
    await Order.findOneAndUpdate(
      {
        owner: userData._id,
        'items._id': id,
      },
      {
        $set: { 'items.$.orderStatus': 'Return initiated' },
      },
      { new: true }
    );

    res.redirect('/orders?user=true');
  } catch (error) {
    console.log(error.message);
  }
};

const orderSuccess = async (res, req) => {
  try {
    res.render('users/orderSuccess');
  } catch (error) {
    console.log(error.message);
  }
};

const razorpayRedirect = async (req, res) => {
  try {
    const bill = req.session.orderBill;
    const razorpay = new Razorpay({
      key_id: config.secretId,
      key_secret: config.secretKey,
    });

    const options = {
      amount: bill * 100, // to smallest currency  paisa
      currency: 'INR',
    };

    const order = await razorpay.orders.create(options);
    if (order) {
      res.json({ razorpay: true, order, bill });
    } else {
      throw new Error('error while creating order');
    }
  } catch (error) {
    console.log(error.message);
  }
};

const invoice = async (req, res) => {
  try {
    const { orderId, itemId } = req.query;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const item = order.items.find((item) => item._id == itemId);

    if (!item) {
      return res.status(404).json({ error: 'Item not found in the order' });
    }

    const address = order.address;
    const date = helper.formatDate(order.orderDate);

    const data = {
      images: {
        logo: 'https://i.postimg.cc/MH9Gr9QC/logo.png',
      },
      sender: {
        company: 'Sole-Seeker',
        address: 'HustleHub Techpark',
        zip: 'Somasundara palaya',
        city: 'Bangalore',
        country: 'Karnataka',
      },
      client: {
        company: address.name,
        address: address.address1,
        zip: address.zip,
        city: address.city,
        country: address.state,
      },
      information: {
        number: 'REF' + order._id,
        date,
        'due-date': order.paymentMode,
      },
      products: [
        {
          quantity: item.quantity,
          description: item.productName,
          'tax-rate': 0,
          price: item.price,
        },
      ],
      'bottom-notice': 'Thank you for shopping with us',
      settings: {
        currency: 'INR',
      },
      translate: {
        'due-date': 'PaymentMode',
        vat: 'shipping',
      },
    };

    res.json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'An error occurred' });
  }
};

const rateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const { _id: userId } = req.session.userData;
    const product = await Product.findById(id);
    const existingReviewIndex = product.rating.findIndex((entry) => entry.customer.toString() === userId);

    if (existingReviewIndex !== -1) {
      product.rating[existingReviewIndex].rate = rating;
      product.rating[existingReviewIndex].review = review;
    } else {
      product.rating.push({ rate: rating, review, customer: userId });
    }
    const productUpdated = await product.save();

    if (!productUpdated) {
      throw new Error('Error while updating the rating');
    }

    res.status(200).json({ message: 'Rating and review updated successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'An error occurred' });
  }
};

module.exports = {
  orderSuccessRedirect,
  orders,
  cancelOrder,
  returnOrder,
  orderSuccess,
  razorpayRedirect,
  invoice,
  rateProduct,
};
