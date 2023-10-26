const { User } = require('../../models/userModel');

const Category = require('../../models/categoryModel');
const Product = require('../../models/productModel');

const mongoose = require('mongoose');

// ================Get all active categories========================

const getCategory = async function () {
  try {
    const categories = await Category.find({ active: true });
    return categories;
  } catch (error) {
    throw new Error('Could not find categories');
  }
};

const addToWishlist = async (req, res) => {
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

    const existingListItem = user.wishList.find(
      (item) => item.prod_id.toString() === id.toString() && item.size == size
    );

    if (existingListItem) {
      return res.json('exists');
    } else {
      const newItem = {
        prod_id: id,
        unit_price: product.price,
        size: size,
      };
      user.wishList.push(newItem);
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

const wishlist = async (req, res) => {
  try {
    const user = req.session.userData;
    const userId = new mongoose.Types.ObjectId(user._id);
    const userData = await User.findById(user._id);
    const categories = await getCategory();
    const cart = userData.cart;

    const wishlist = await User.aggregate([
      { $match: { _id: userId } },
      {
        $unwind: '$wishList',
      },
      {
        $lookup: {
          from: 'products', // Replace with the actual name of your products collection
          localField: 'wishList.prod_id',
          foreignField: '_id',
          as: 'wishList.product',
        },
      },
      {
        $unwind: '$wishList.product',
      },
      {
        $group: {
          _id: 0,
          wishList: { $push: '$wishList' },
        },
      },
      {
        $project: {
          _id: 0, // Exclude the _id field
          wishList: 1, // Include only the wishlist field
        },
      },
    ]);
    if (wishlist.length === 0) {
      return res.render('users/wishlist', {
        userData,
        categories,
        cart,
        wishlist: wishlist,
      });
    }

    return res.render('users/wishlist', {
      userData,
      categories,
      cart,
      wishlist: wishlist[0].wishList,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const deleteWishlist = async (req, res) => {
  try {
    const id = req.body.id;
    const user = req.session.userData;
    const updated = await User.findOneAndUpdate({ _id: user._id }, { $pull: { wishList: { _id: id } } });
    if (!updated) {
      throw new Error('error while deleting the wishlist item');
    }
    res.json('done');
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  addToWishlist,
  wishlist,
  deleteWishlist,
};
