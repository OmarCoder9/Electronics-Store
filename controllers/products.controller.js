const asyncWrapper = require("../middlewares/asyncWrapper");
const Product = require("../models/product.model");
const appError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");

const getAllProducts = asyncWrapper(async (req, res) => {
  const query = req.query;
  const limit = +query.limit || 20;
  const page = +query.page || 1;
  const skip = (page - 1) * limit;

  const products = await Product.find().limit(limit).skip(skip);
  console.log(products);
  res.json({ status: httpStatusText.SUCCESS, data: { products } });
});

const getProductDetails = asyncWrapper(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    const error = appError.create(
      "Product Not Found",
      404,
      httpStatusText.FAIL,
    );
    return next(error);
  }
  return res.json({ status: httpStatusText.SUCCESS, data: { product } });
});

const addProduct = asyncWrapper(async (req, res) => {
  const { name, description, price, rating, category } = req.body;
  const newProduct = new Product({
    name,
    description,
    price,
    rating,
    category,
  });
  await newProduct.save();
  return res
    .status(201)
    .json({ status: httpStatusText.SUCCESS, data: { product: newProduct } });
});

const updateProduct = asyncWrapper(async (req, res, next) => {
  const productID = req.params.productId;
  const updatedData = { ...req.body };
  const updatedProduct = await Product.findByIdAndUpdate(
    productID,
    { $set: updatedData },
    { new: true },
  );

  if (!updatedProduct) {
    const error = appError.create(
      "Product Not Found",
      404,
      httpStatusText.FAIL,
    );
    return next(error);
  }

  return res
    .status(200)
    .json({
      status: httpStatusText.SUCCESS,
      data: { product: updatedProduct },
    });
});

const deleteProduct = asyncWrapper(async (req, res, next) => {
  const deletedProduct = await Product.findByIdAndDelete(req.params.productId);

  if (!deletedProduct) {
    const error = appError.create(
      "Product Not Found",
      404,
      httpStatusText.FAIL,
    );
    return next(error);
  }

  return res.status(200).json({ status: httpStatusText.SUCCESS, data: null });
});

module.exports = {
  getAllProducts,
  getProductDetails,
  addProduct,
  updateProduct,
  deleteProduct,
};
