// const config = require('../config/config');
const Admin = require('../models/adminModel');

const user = require('../models/userModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
// const ObjectId = mongoose.Types.ObjectId;

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
        res.render('admin/adminDashboard'); ////////////////////to change
      } else {
        res.render('admin/adminLogin', { message: '' });
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  adminLogin: async (req, res) => {
    const { email, password } = req.body;
    console.log(email);
    console.log(password);
    try {
      const adminData = await Admin.findOne({ email, password });
      if (adminData) {
        req.session.admin = true;
        res.render('admin/adminDashboard', { message: '' });
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
      res.render('admin/adminDashboard', { message: '' });
    } catch (error) {
      console.log(error.message);
    }
    //need working===================================================
  },

  userManagement: async (req, res) => {
    try {
      const users = await user.find({});
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
    const id = req.body.id;
    req.session.adminMessage = '';
    try {
      const response = await user.findByIdAndUpdate({ _id: id }, { $set: { blockStatus: true } });
      if (response) {
        req.session.adminMessage = 'User Blocked Successfully';
        res.redirect('/admin/users');
      }
    } catch (error) {
      console.log(error.message);
      req.session.adminMessage = 'An error occurred while unblocking the user';
      res.redirect('/admin/users');
    }
  },

  userUnBlock: async (req, res) => {
    const id = req.body.id;
    req.session.adminMessage = '';

    try {
      const response = await user.findByIdAndUpdate({ _id: id }, { $set: { blockStatus: false } });
      if (response) {
        req.session.adminMessage = 'User Unblocked Successfully';
        res.redirect('/admin/users');
      }
    } catch (error) {
      console.log(error.message);
      req.session.adminMessage = 'An error occurred while unblocking the user';
      res.redirect('/admin/users');
    }
  },

  userEdit: async (req, res) => {
    const id = req.query.id;
    req.session.adminMessage = '';
    req.session.userId = id;
    try {
      const userdata = await user.findOne({ _id: id });
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
      const updateData = await user.updateOne({ _id: req.session.userId }, { $set: { name, email, mobile } });
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
      const result = await user.find({
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
    } catch (error) {}
  },

  adminCategory: async (req, res) => {
    try {
      const categoryList = await Category.find({});
      if (categoryList) {
        if (req.session.editCategory) {
          return res.render('admin/category', { categories: categoryList, editCategory: req.session.editCategory });
        } else {
          return res.render('admin/category', { categories: categoryList, message: req.session.categoryMessage });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  adminCategoryLoad: async (req, res) => {
    try {
      if (req.body.category != '') {
        const result = await Category.find({ category: req.body.category });
        if (result.length === 0) {
          req.session.categoryMessage = '';
          const categoryData = new Category(req.body);
          const savedCategory = await categoryData.save();

          if (savedCategory) {
            return res.redirect('/admin/category');
          } else {
            throw new Error('Error saving category');
          }
        } else {
          req.session.categoryMessage = 'The category already exists';
          return res.redirect('admin/category');
        }
      } else {
        req.session.categoryMessage = "The Category field can't be null";
        return res.redirect('/admin/category');
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  categoryDelete: async (req, res) => {
    const id = req.query.id;
    try {
      const result = await Category.findByIdAndDelete({ _id: id });
      if (result) {
        return res.redirect('/admin/category');
      } else {
        throw new Error('Error deleting the category');
      }
    } catch (error) {}
  },

  categoryEdit: async (req, res) => {
    const id = req.query.id;
    try {
      const result = await Category.findOne({ _id: id });
      console.log(result);
      if (result) {
        console.log('hello');
        console.log(result.category);
        req.session.editCategory = result.category;
        return res.redirect('/admin/category');
      } else {
        throw new Error('error while editing');
      }
    } catch (error) {}
  },

  categoryUpdate: async (req, res) => {
    const updateText = req.body.categoryUpdate;
    try {
      const result = await Category.findOneAndUpdate(
        { category: req.session.editCategory },
        { $set: { category: updateText } }
      );
      if (result) {
        req.session.editCategory = false;
        return res.redirect('/admin/category');
      } else {
        throw new Error('updation failed');
      }
    } catch (error) {}
  },

  productLoad: async (req, res) => {
    try {
      const products = await Product.find({ isDeleted: false }).sort({ updatedAt: -1 }).populate('category');
      if (products) {
        req.session.products = products;
        res.render('admin/adminProducts', { products, adminMessage: req.session.productMessage });
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
      res.render('admin/addproduct', { categories, message: message });
    } catch (error) {
      console.log(error.message);
    }
  },

  productUpload: async (req, res) => {
    try {
      console.log(req.body);
      if (
        req.body.name != '' &&
        req.body.price != '' &&
        req.body.description != '' &&
        req.body.stock != '' &&
        req.body.category != ''
      ) {
        const trendingStatus = req.body.trending == undefined ? false : true;
        const productData = new Product({
          productName: req.body.name,
          price: req.body.price,
          description: req.body.description,
          stock: req.body.stock,
          trending: trendingStatus,
          offer: req.body.offer,
          category: req.body.category,
          bgColor: req.body.bgColor,
          __v: 1,
          img1: req.files[0] && req.files[0].filename ? req.files[0].filename : '',
          img2: req.files[1] && req.files[1].filename ? req.files[1].filename : '',
          isDeleted: false,
        });
        console.log('going to save');
        const product = await productData.save();
        console.log(product);
        if (product) {
          const message = 'Product added successfully';
          req.session.productMessage = message;
          return res.redirect('/admin/products');
        } else {
          throw new error('error while saving product');
        }
      } else {
        const message = 'field cant be blank';
        return res.redirect(`admin/products/add?message=${message}`);
      }
    } catch (error) {}
  },

  productEdit: async (req, res) => {
    try {
      const id = req.query.id;
      req.session.productQuery = id;
      const product = await Product.findById({ _id: id });
      if (product) {
        const categories = await getCategory();
        return res.render('admin/editProduct', { product, categories });
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  productUpdate: async (req, res) => {
    try {
      console.log(req.body);
      const trendingStatus = req.body.trending == undefined ? false : true;
      const newStatus = req.body.new == undefined ? 0 : 1;
      const id = req.session.productQuery;
      const updateObj = {
        $set: {
          productName: req.body.productName,
          price: req.body.price,
          description: req.body.description,
          stock: req.body.stock,
          trending: trendingStatus,
          offer: req.body.offer,
          __v: newStatus,
          category: req.body.category,
          bgColor: req.body.bgcolor,
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
        req.session.productMessage = 'Product Updated Successfully';
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

  // productSearch: async (req, res) => {
  //   try {
  //     const searchText = req.body.productsearch;
  //     const result = await Product.find({
  //       $and: [
  //         { isDeleted: false },
  //         {
  //           $or: [
  //             { productName: { $regex: searchText, $options: 'i' } },
  //             { category: { $regex: searchText, $options: 'i' } },
  //           ],
  //         },
  //       ],
  //     }).populate('category');
  //     if(result){
  //       res.render("admin/adminProducts",{products:result})
  //     }
  //     else{
  //       const message = "product not found"
  //       req.session.productMessage=message
  //       return res.redirect("/admin/products")
  //     }
  //   } catch (error) {
  //     console.log(error.message);
  //   }
  // },

  productSearch: async (req, res) => {
    try {
      const searchText = req.body.productsearch;
      console.log(searchText);
      const matchingCategories = await Category.find({
        category: { $regex: searchText, $options: 'i' },
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
};
