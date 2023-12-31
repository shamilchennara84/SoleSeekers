/* eslint-disable eqeqeq */
/* eslint-disable comma-dangle */
/* eslint-disable semi */
// const config = require('../config/config');
const Admin = require('../../models/adminModel');
const { User } = require('../../models/userModel');
const Category = require('../../models/categoryModel');
const Product = require('../../models/productModel');
const Order = require('../../models/orderModel');
const Coupon = require('../../models/couponModel');
const Banner = require('../../models/bannerModel');
const excelJs = require('exceljs');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const CategoryExist = async (name) => {
  try {
    const exist = await Category.findOne({ categoryName: name });
    if (exist) {
      return true;
    } else {
      return false;
    }
  } catch (error) {}
};

const getCategory = async function () {
  try {
    const categories = await Category.find({});
    if (categories.length > 0) {
      return categories;
    } else {
      throw new Error("couldn't find categories");
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  getAdminLogin: async (req, res) => {
    try {
      if (req.session.admin) {
        return res.redirect('/admin/dashboard'); /// /////////////////to change
      } else {
        res.render('admin/adminLogin', { message: '' });
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  adminLogin: async (req, res) => {
    const { email, password } = req.body;

    try {
      const adminData = await Admin.findOne({ email, password });
      if (adminData) {
        req.session.admin = true;
        return res.redirect('/admin/dashboard');
      } else {
        req.session.admin = false;
        res.render('admin/adminLogin', { message: 'wrong credentials' });
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  userDashboard: async (req, res) => {
    try {
      const months = {};
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      // fetching all orders
      const orders = await Order.find({});
      orders.forEach((order) => {
        const month = monthNames[order.orderDate.getMonth()];
        if (!months[month]) {
          months[month] = 0;
        }
        months[month]++;
      });

      const paymentModeStats = await Order.aggregate([
        {
          $group: { _id: '$paymentMode', count: { $sum: 1 } },
        },
      ]);

      const orderCount = await Order.find({ __v: 0 }).count();
      const userCount = await User.find().count();

      const orderSum = await Order.aggregate([
        { $unwind: '$items' },
        { $match: { 'items.orderStatus': 'Delivered' } },
        { $group: { _id: null, totalBill: { $sum: '$items.bill' } } },
      ]);
      const quantitySum = await Order.aggregate([
        { $unwind: '$items' },
        { $match: { 'items.orderStatus': 'Delivered' } },
        { $group: { _id: null, totalProducts: { $sum: '$items.quantity' } } },
      ]);

      res.render('admin/adminDashboard', {
        months,
        data: JSON.stringify(paymentModeStats),
        totalBill: orderSum[0].totalBill,
        orderCount,
        userCount,
        totalQuantity: quantitySum[0].totalProducts,
      });
    } catch (error) {
      console.log(error.message);
    }
  },

  userManagement: async (req, res) => {
    try {
      const users = await User.find();
      if (users) {
        req.session.users = users;
        res.render('admin/adminUsers', { users, adminMessage: req.session.adminMessage });
        // userblock message
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  userBlock: async (req, res) => {
    const id = req.params.id;
    req.session.adminMessage = '';
    try {
      const response = await User.findByIdAndUpdate({ _id: id }, { $set: { blockStatus: true } });
      if (response) {
        req.session.adminMessage = 'User Blocked Successfully';
        res.redirect('/admin/users');
      }
    } catch (error) {
      console.log(error.message);
      req.session.adminMessage = 'An error occurred while unblocking the User';
      res.redirect('/admin/users');
    }
  },

  userUnBlock: async (req, res) => {
    const id = req.params.id;
    req.session.adminMessage = '';

    try {
      const response = await User.findByIdAndUpdate({ _id: id }, { $set: { blockStatus: false } });
      if (response) {
        req.session.adminMessage = 'User Unblocked Successfully';
        res.redirect('/admin/users');
      }
    } catch (error) {
      console.log(error.message);
      req.session.adminMessage = 'An error occurred while unblocking the User';
      res.redirect('/admin/users');
    }
  },

  userEdit: async (req, res) => {
    const id = req.query.id;
    req.session.adminMessage = '';
    req.session.userId = id;
    try {
      const userdata = await User.findOne({ _id: id });
      if (userdata) {
        res.render('admin/adminEditUser', { user: userdata });
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  userUpdate: async (req, res) => {
    req.session.adminMessage = '';
    const { name, email, mobile } = req.body;
    try {
      const updateData = await User.updateOne({ _id: req.session.userId }, { $set: { name, email, mobile } });
      if (updateData) {
        req.session.adminMessage = 'User Updated successfully';
        return res.redirect('/admin/users');
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  userSearch: async (req, res) => {
    const search = req.body.search;
    try {
      const result = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { mobile: { $regex: search, $options: 'i' } },
        ],
      });
      if (result) {
        return res.render('admin/adminUsers', { users: result });
      } else {
        req.session.adminMessage = 'User not found';
        return res.redirect('/admin/users');
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  adminCategory: async (req, res) => {
    try {
      const message = req.session.categoryMessage;
      req.session.categoryMessage = '';
      const categoryList = await Category.find({}).sort({ active: -1 });
      if (categoryList) {
        if (req.session.editCategory) {
          return res.render('admin/category', {
            categories: categoryList,
            editCategory: req.session.editCategory,
            message,
          });
        } else {
          return res.render('admin/category', { categories: categoryList, message });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  adminCategoryLoad: async (req, res) => {
    try {
      const categoryName = req.body.category;
      if (categoryName.trim() !== '') {
        const exist = await CategoryExist(categoryName);
        if (!exist) {
          req.session.categoryMessage = '';
          const categoryData = new Category({ categoryName });
          const savedCategory = await categoryData.save();

          if (savedCategory) {
            return res.redirect('/admin/category');
          } else {
            throw new Error('Error saving category');
          }
        } else {
          req.session.categoryMessage = 'The category already exists';
          return res.redirect('/admin/category');
        }
      } else {
        req.session.categoryMessage = "The Category field can't be null";
        return res.redirect('/admin/category');
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  categoryDeactive: async (req, res) => {
    const id = req.query.id;
    try {
      const result = await Category.findByIdAndUpdate({ _id: id }, { $set: { active: false } });
      if (result) {
        return res.redirect('/admin/category');
      } else {
        throw new Error('Error deleting the category');
      }
    } catch (error) {
      console.log(error.message);
    }
  },
  categoryActivate: async (req, res) => {
    const id = req.query.id;
    try {
      const result = await Category.findByIdAndUpdate({ _id: id }, { $set: { active: true } });
      if (result) {
        return res.redirect('/admin/category');
      } else {
        return res.status(404).render('error/404', { err404Msg: 'The requested resource was not found' });
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  categoryEdit: async (req, res) => {
    const id = req.query.id;
    try {
      const result = await Category.findOne({ _id: id });

      if (result) {
        req.session.editCategory = result.categoryName;
        return res.redirect('/admin/category');
      } else {
        return res.status(404).render('error/404', { err404Msg: 'The requested resource was not found' });
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  categoryUpdate: async (req, res) => {
    const updateText = req.body.categoryUpdate;
    try {
      if (updateText === req.session.editCategory) {
        req.session.categoryMessage = 'No changes made';
        return res.redirect('/admin/category');
      }
      const exist = await CategoryExist(updateText);
      if (!exist) {
        await Category.findOneAndUpdate(
          { categoryName: req.session.editCategory },
          { $set: { categoryName: updateText } }
        );
      } else {
        req.session.categoryMessage = 'The category already exists';
        return res.redirect('/admin/category');
      }
      req.session.editCategory = false;
      return res.redirect('/admin/category');
    } catch (error) {
      console.log(error.message);
    }
  },

  productLoad: async (req, res) => {
    try {
      const page = req.query.page || 1;
      const perPage = 5;
      const skip = (page - 1) * perPage;
      const adminMessage = req.session.productMessage;
      req.session.productMessage = '';
      if (adminMessage === 'Product not found') {
        return res.render('admin/adminProducts', { adminMessage });
      }
      const TotalCount = await Product.find({ isDeleted: false }).sort({ updatedAt: -1 }).count();
      const products = await Product.find({ isDeleted: false })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(perPage)
        .populate('category');
      const totalPages = Math.ceil(TotalCount / perPage);
      if (products) {
        req.session.products = products;
        res.render('admin/adminProducts', { products, adminMessage, currentPage: page, totalPages });
      } else {
        throw new Error('error while fetching products from database');
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  productAdd: async (req, res) => {
    try {
      const categories = await getCategory();
      const message = req.query.message;
      res.render('admin/addproduct', { categories, message });
    } catch (error) {
      console.log(error.message);
    }
  },

  productUpload: async (req, res) => {
    try {
      const { name, price, description, stock, category, trending, offer, bgColor } = req.body;

      const isTrending = trending !== undefined;

      if (
        name.trim() !== '' &&
        price.trim() !== '' &&
        description.trim() !== '' &&
        stock.trim() !== '' &&
        category.trim() !== ''
      ) {
        const calculatedPrice = price - (price * offer) / 100;
        const productData = new Product({
          productName: name,
          mrp: price,
          price: calculatedPrice,
          description,
          stock,
          trending: isTrending,
          offer,
          category,
          bgColor,
          __v: 1,
          img1: (req.files[0] && req.files[0].filename) || '',
          img2: (req.files[1] && req.files[1].filename) || '',
          isDeleted: false,
        });

        const product = await productData.save();

        if (product) {
          const message = 'Product added successfully';
          req.session.productMessage = message;
          return res.redirect('/admin/products');
        } else {
          throw new Error('Error while saving product');
        }
      } else {
        const message = "Fields can't be blank";
        return res.redirect(`admin/products/add?message=${message}`);
      }
    } catch (error) {
      console.error(error.message);
    }
  },

  productEdit: async (req, res) => {
    try {
      const id = req.query.id;
      req.session.productQuery = id;
      const product = await Product.findById({ _id: id });
      if (product) {
        const categories = await getCategory();
        return res.render('admin/editProduct', { product, categories });
      } else {
        return res.status(404).render('error/404', { err404Msg: 'The requested resource was not found' });
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  productUpdate: async (req, res) => {
    try {
      const { name, price, description, stock, category, trending, offer, bgColor } = req.body;
      const trendingStatus = trending != undefined;
      const id = req.session.productQuery;
      const calculatedPrice = price - (price * offer) / 100;
      const updateObj = {
        $set: {
          productName: name,
          mrp: price,
          price: calculatedPrice,
          description,
          stock,
          trending: trendingStatus,
          offer,
          category,
          bgColor,
          isDeleted: false,
        },
      };

      if (req.files[0] && req.files[0].filename) {
        updateObj.$set.img1 = req.files[0].filename;
      }
      if (req.files[1] && req.files[1].filename) {
        updateObj.$set.img2 = req.files[1].filename;
      }
      const result = await Product.findByIdAndUpdate({ _id: id }, updateObj);

      if (result) {
        req.session.productMebssage = 'Product Updated Successfully';
        return res.redirect('/admin/products');
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  productDelete: async (req, res) => {
    try {
      const id = req.body.id;
      const result = await Product.findByIdAndUpdate({ _id: id }, { isDeleted: true });
      if (result) {
        req.session.productMessage = 'Product deleted successfully';
        res.json(result);
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  productSearch: async (req, res) => {
    try {
      const searchText = req.body.productsearch;

      const matchingCategories = await Category.find({
        categoryName: { $regex: searchText, $options: 'i' },
      });

      // Extract the category IDs from the matching categories
      const categoryIds = matchingCategories.map((category) => category._id);

      const result = await Product.find({
        $and: [
          { isDeleted: false },
          {
            $or: [{ productName: { $regex: searchText, $options: 'i' } }, { category: { $in: categoryIds } }],
          },
        ],
      }).populate('category');

      if (result.length > 0) {
        res.render('admin/adminProducts', { products: result });
      } else {
        const message = 'Product not found';
        req.session.productMessage = message;
        return res.redirect('/admin/products');
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  ordersLoad: async (req, res) => {
    try {
      const page = req.query.page || 1;
      const perPage = 2;
      const skip = (page - 1) * perPage;
      const TotalCount = await Order.find({}).count();
      const totalPages = Math.ceil(TotalCount / perPage);
      const orders = await Order.find({}).sort({ orderDate: -1 }).skip(skip).limit(perPage);
      return res.render('admin/adminOrders', { orders, currentPage: page, totalPages });
    } catch (error) {
      console.log(error.message);
    }
  },

  editStatusLoad: async (req, res) => {
    try {
      const id = req.query.id;
      req.session.order2Id = id;
      const orders = await Order.find({ _id: id });
      if (!orders) {
        return res.status(404).render('error/404', { err404Msg: 'The requested resource was not found' });
      }

      res.render('admin/editOrderStatus', { orders });
    } catch (error) {
      console.log(error.message);
    }
  },

  editStatus: async (req, res) => {
    try {
      const order2Id = req.session.order2Id;
      if (req.query.approve) {
        const id = req.query.orderId;
        await Order.findOneAndUpdate(
          { _id: order2Id, 'items._id': id },
          { $set: { 'items.$.orderStatus': 'Approved' } }
        );
        return res.redirect(`/admin/orders/status?id=${order2Id}`);
      } else if (req.query.deny) {
        const id = req.query.orderId;
        await Order.findOneAndUpdate(
          { _id: order2Id, 'items._id': id },
          { $set: { 'items.$.orderStatus': 'Cancelled' } }
        );
        return res.redirect(`/admin/orders/status?id=${order2Id}`);
      } else if (req.query.shipped) {
        const id = req.query.orderId;
        await Order.findOneAndUpdate(
          { _id: order2Id, 'items._id': id },
          { $set: { 'items.$.orderStatus': 'Shipped' } }
        );
        return res.redirect(`/admin/orders/status?id=${order2Id}`);
      } else if (req.query.delivered) {
        const id = req.query.orderId;
        const itemId = req.query.itemId;
        const delivered = await Order.findOneAndUpdate(
          { _id: order2Id, 'items._id': id },
          { $set: { 'items.$.orderStatus': 'Delivered' } },
          { new: true }
        );
        if (delivered) {
          await Product.findOneAndUpdate(
            { _id: itemId },
            {
              $inc: { stock: -delivered.items[0].quantity },
            }
          );
        }
        return res.redirect(`/admin/orders/status?id=${order2Id}`);
      } else if (req.query.returned) {
        const id = req.query.orderId;
        const itemId = req.query.itemId;
        const returned = await Order.findOneAndUpdate(
          { _id: order2Id, 'items._id': id },
          { $set: { 'items.$.orderStatus': 'Returned' } },
          { new: true }
        );
        if (returned) {
          await Product.findOneAndUpdate(
            { _id: itemId },
            {
              $inc: { stock: returned.items[0].quantity },
            }
          );

          const userId = returned.owner;
          const refund = returned.orderBill;

          await User.findByIdAndUpdate({ _id: userId }, { $inc: { wallet: refund } }, { new: true });
        }

        return res.redirect(`/admin/orders/status?id=${order2Id}`);
      } else {
        return res.redirect(`/admin/orders/status?id=${order2Id}`);
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  orderReport: async (req, res) => {
    try {
      req.session.filterDate = false;
      const formatDate = function (date) {
        const day = ('0' + date.getDate()).slice(-2);
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const year = date.getFullYear().toString();
        return `${day}-${month}-${year}`;
      };
      const orders = await Order.find({ 'items.orderStatus': 'Delivered' });
      res.render('admin/reports', { orders, formatDate });
    } catch (error) {
      console.log(error.message);
    }
  },
  orderExcel: async (req, res) => {
    try {
      let salesReport;
      if (req.session.filterDate) {
        const from = req.session.from;
        const to = req.session.to;
        salesReport = await Order.find({
          'items.orderStatus': 'Delivered',
          orderDate: { $gte: from, $lte: to },
        });
      } else {
        salesReport = await Order.find({ 'items.orderStatus': 'Delivered' });
      }
      const workbook = new excelJs.Workbook();
      const worksheet = workbook.addWorksheet('sales Report');
      worksheet.columns = [
        {
          header: 'S no.',
          key: 's_no',
          width: 10,
        },
        { header: 'OrderID', key: '_id', width: 30 },
        { header: 'Date', key: 'orderDate', width: 20 },
        { header: 'Products', key: 'ProductName', width: 30 },
        { header: 'Method', key: 'paymentMode', width: 10 },
        { header: 'Amount', key: 'orderBill' },
      ];
      let counter = 1;
      salesReport.forEach((report) => {
        report.s_no = counter;
        report.ProductName = '';
        report.items.forEach((eachProduct) => {
          report.ProductName += eachProduct.productName + ',';
        });
        worksheet.addRow(report);
        counter++;
      });
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
      });
      res.header('Content-Type', 'application/vnd.oppenxmlformats-officedocument.spreadsheatml.sheet');
      res.header('Content-Disposition', 'attachment; filename=report.xlsx');

      workbook.xlsx.write(res);
    } catch (error) {
      console.log(error.message);
    }
  },
  orderSearch: async (req, res) => {
    try {
      req.session.orderSearchErr = '';
      const formatDate = function (date) {
        const day = ('0' + date.getDate()).slice(-2);
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const year = date.getFullYear().toString();
        return `${day}-${month}-${year}`;
      };

      const from = new Date(req.body.fromdate);
      const to = new Date(req.body.todate);
      req.session.filterDate = true;
      req.session.from = from;
      req.session.to = to;

      if (from > to) {
        req.session.orderSearchErr = "Invalid date range. 'From' date must be before or equal to 'To' date.";
        return res.render('admin/reports', { orders: [], formatDate, message: req.session.orderSearchErr });
      }

      const orders = await Order.find({
        'items.orderStatus': 'Delivered',
        orderDate: { $gte: from, $lte: to },
      });

      if (orders.length === 0) {
        req.session.orderSearchErr = 'No orders found';
        return res.render('admin/reports', { orders: [], formatDate, message: req.session.orderSearchErr });
      }

      res.render('admin/reports', { orders, formatDate, message: req.session.orderSearchErr });
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Internal Server Error');
    }
  },

  couponLoad: async (req, res) => {
    try {
      const formatDate = function (date) {
        const day = ('0' + date.getDate()).slice(-2);
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const year = date.getFullYear().toString();
        return `${day}-${month}-${year}`;
      };
      const coupon = await Coupon.find().sort({ _id: -1 });
      if (coupon) {
        if (req.query.edit) {
          const edit = await Coupon.findOne({ _id: req.query.edit });

          return res.render('admin/coupons', { couponEdit: edit, coupon, formatDate });
        } else {
          req.query.edit = false;
          const message = req.session.couponMessage;
          const errorMessage = req.session.couponErrMessage;
          res.render('admin/coupons', { coupon, message, errorMessage, formatDate });
        }
      } else {
        return res.render('admin/coupons', { formatDate });
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  couponAdd: async (req, res) => {
    try {
      req.session.couponErrMessage = '';
      req.session.couponMessage = '';
      const code = req.body.couponCode;
      const value = req.body.couponValue;
      const expiry = req.body.couponExpiry;
      const bill = req.body.minBill;
      const maxAmount = req.body.maxAmount;

      if (
        code.trim() != '' &&
        value.trim() != '' &&
        expiry.trim() != '' &&
        bill.trim() != '' &&
        maxAmount.trim() != ''
      ) {
        const find = await Coupon.findOne({ code });

        if (find) {
          req.session.couponMessage = '';
          req.session.couponErrMessage = 'Coupon already exists';
          return res.redirect('/admin/coupons');
        } else {
          if (value > 0 && value <= 100) {
            const couponData = new Coupon({
              code,
              value,
              minBill: bill,
              maxAmount,
              expiryDate: Date(),
            });
            await couponData.save();
            req.session.couponErrMessage = '';
            const message = 'New Coupon Added Successfully';
            req.session.couponMessage = message;
            res.redirect('/admin/coupons');
          } else {
            req.session.couponMessage = '';
            req.session.couponErrMessage = 'Coupon Value must be between 0 and 100';
            res.redirect('/admin/coupons');
          }
        }
      } else {
        req.session.couponMessage = '';
        req.session.couponErrMessage = 'Fields cannot be null';
        res.redirect('/admin/coupons');
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  couponDeactivate: async (req, res) => {
    try {
      const id = req.query.id;
      await Coupon.findOneAndUpdate({ _id: id }, { $set: { Status: 'Inactive' } });
      req.session.couponErrMessage = '';
      const message = 'coupon Deactivated Successfully';
      req.session.couponMessage = message;
      res.redirect('/admin/coupons');
    } catch (error) {
      console.log(error.message);
    }
  },

  couponActivate: async (req, res) => {
    try {
      const id = req.query.id;
      const expired = await Coupon.findOne({ _id: id, Status: 'Expired' });
      if (expired) {
        req.session.couponMessage = '';
        req.session.couponErrMessage = 'Coupon expiry need to updated before activating';
        return res.redirect('/admin/coupons');
      } else {
        await Coupon.findOneAndUpdate({ _id: id }, { $set: { Status: 'Active' } });
        req.session.couponErrMessage = '';
        const message = 'coupon Activated Successfully';
        req.session.couponMessage = message;
        return res.redirect('/admin/coupons');
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  couponEdit: async (req, res) => {
    try {
      const id = req.query.id;
      res.redirect(`/admin/coupons?edit=${id}`);
    } catch (error) {
      console.log(error.message);
    }
  },

  couponUpdate: async (req, res) => {
    try {
      req.session.couponMessage = '';
      req.session.couponErrMessage = '';
      const id = req.query.id;
      const code = req.body.couponCode;
      const value = req.body.couponValue;
      const expiry = new Date(req.body.couponExpiry);
      const bill = req.body.minBill;
      const maxAmount = req.body.maxAmount;
      const currDate = new Date();
      const Status = currDate.getTime() < expiry.getTime() ? 'Active' : 'Expired';
      const updated = await Coupon.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            code,
            value,
            expiryDate: expiry,
            minBill: bill,
            maxAmount,
            Status,
          },
        }
      );
      if (!updated) {
        throw new Error('an error occured while updating the coupon');
      }
      req.session.couponMessage = 'coupon Updated Successfully';
      return res.redirect('/admin/coupons');
    } catch (error) {
      console.log(error.message);
    }
  },

  bannerLoad: async (req, res) => {
    try {
      const banner = await Banner.find({}).sort({ _id: 1 });
      if (!banner) {
        return res.render('admin/banner');
      }
      if (req.query.edit) {
        const bannerEdit = await Banner.findById(req.query.edit);
        if (!bannerEdit) {
          return res.status(404).render('error/404', { err404Msg: 'The requested resource was not found' });
        }
        return res.render('admin/banner', { banner, bannerEdit });
      } else {
        const message = req.session.bannerMessage;
        const errorMessage = req.session.bannerErrMessage;
        res.render('admin/banner', { banner, message, errorMessage });
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  bannerAdd: async (req, res) => {
    try {
      const { title, subTitle, description, redirect } = req.body;
      if (title.trim() != '' && subTitle.trim() != '' && description.trim() != '' && redirect.trim() != '') {
        const newBanner = new Banner({
          title,
          subTitle,
          description,
          image: req.files[0] && req.files[0].filename ? req.files[0].filename : '',
          redirect,
          status: 'Active',
        });
        const bannerAdded = await newBanner.save();
        if (!bannerAdded) {
          throw new Error('error while adding new banner');
        }
        req.session.bannerErrMessage = '';
        req.session.bannerMessage = 'Banner added successfully';
        res.redirect('/admin/banner');
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  bannerEdit: async (req, res) => {
    try {
      const id = req.query.id;
      req.session.bannerErrMessage = '';
      req.session.bannerMessage = '';
      res.redirect(`/admin/banner?edit=${id}`);
    } catch (error) {
      console.log(error.message);
    }
  },

  bannerUpdate: async (req, res) => {
    try {
      const id = req.query.id;
      const updateObj = {
        $set: {
          title: req.body.title,
          subTitle: req.body.subtitle,
          description: req.body.description,
          redirect: req.body.redirect,
        },
      };
      if (req.files[0] && req.files[0].filename) {
        updateObj.$set.image = req.files[0].filename;
      }
      const updated = await Banner.findByIdAndUpdate({ _id: id }, updateObj);
      if (!updated) {
        throw new Error('error while update banenr');
      }
      const message = 'Banner Updated Successfully';
      req.session.bannerMessage = message;
      res.redirect('/admin/banner');
    } catch (error) {
      console.log(error.message);
    }
  },

  bannerDisable: async (req, res) => {
    try {
      const id = req.params.id;
      const updated = await Banner.updateOne(
        { _id: id },
        {
          $set: {
            status: 'Disabled',
          },
        }
      );
      if (!updated) {
        throw new Error('error while update banenr');
      }
      req.session.bannerErrMessage = '';
      req.session.bannerMessage = 'Disabled Suceessfully';
      res.status(200).send('Success');
    } catch (error) {
      console.log(error.message);
    }
  },
  bannerEnable: async (req, res) => {
    try {
      const id = req.params.id;
      const updated = await Banner.updateOne(
        { _id: id },
        {
          $set: {
            status: 'Active',
          },
        }
      );
      if (!updated) {
        throw new Error('error while update banner');
      }
      req.session.bannerErrMessage = '';
      req.session.bannerMessage = 'Enabled Suceessfully';
      res.status(200).send('Success');
    } catch (error) {
      console.log(error.message);
    }
  },

  sharpcrop: async (req, res) => {
    try {
      const { imagePath, x, y, width, height } = req.body;

      const imageDirectory = path.join(__dirname, '..', 'public', 'images');
      const imagePathOnServer = path.join(imageDirectory, path.basename(imagePath));

      const tempCroppedImagePath = path.join(imageDirectory, 'temp-cropped-image.png');

      await sharp(imagePathOnServer).extract({ left: x, top: y, width, height }).toFile(tempCroppedImagePath);

      // Delete the original image
      fs.unlinkSync(imagePathOnServer);

      // Rename the temporary cropped image to the original filename
      fs.renameSync(tempCroppedImagePath, imagePathOnServer);

      res.status(200).json({ message: 'Image cropped and overwritten successfully' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error cropping image' });
    }
  },
};
