const asyncWrapper = require("../middlewares/asyncWrapper");
const User = require("../models/user.model");
const appError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");
const bcrypt = require("bcryptjs");
const generateJWT = require("../utils/generateJWT")

const getAllUsers = asyncWrapper(async (req, res) => {
  const query = req.query;
  const limit = +query.limit || 20;
  const page = +query.page || 1;
  const skip = (page - 1) * limit;

  const users = await User.find({}, { __v: false }).limit(limit).skip(skip);

  res.json({ status: httpStatusText.SUCCESS, data: { users } });
});

const getUser = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    const error = appError.create("User Not Found", 404, httpStatusText.FAIL);
    return next(error);
  }
  return res.json({ status: httpStatusText.SUCCESS, data: { user } });
});

const addUser = asyncWrapper(async (req, res, next) => {
  const newUser = new User(req.body);

  await newUser.save();

  res
    .status(201)
    .json({ status: httpStatusText.SUCCESS, data: { course: newUser } });
});

const updateUser = asyncWrapper(async (req, res, next) => {
  const userId = req.params.userId;
  const updateData = { ...req.body };

  // If password is being updated, hash it before saving
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  const updatedUser = await User.updateOne(
    { _id: userId },
    { $set: updateData },
  );
  return res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, data: { user: updatedUser } });
});

const deleteUser = asyncWrapper(async (req, res) => {
  await User.deleteOne({ _id: req.params.userId });
  res.status(200).json({ status: httpStatusText.SUCCESS, data: null });
});

const registerUser = asyncWrapper(async (req, res, next) => {
  const { firstName, lastName, email, password, role } = req.body;

  const oldUser = await User.findOne({ email: email });
  if (oldUser) {
    const error = appError.create(
      "User Already Exists",
      400,
      httpStatusText.FAIL,
    );
    return next(error);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role,
  });
  const token = await generateJWT({
      email: newUser.email,
      id: newUser._id,
      role: newUser.role,
    });
    const returnedUser = { firstName, lastName, email, role, token };
    await newUser.save();

  res
    .status(201)
    .json({ status: httpStatusText.SUCCESS, data: { user: returnedUser } });
});
const loginUser = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const error = appError.create(
      "Email and Password are required",
      400,
      httpStatusText.FAIL,
    );
    return next(error);
  }
  const user = await User.findOne({ email: email });
  if (!user) {
    const error = appError.create("User not found", 400, httpStatusText.FAIL);
    return next(error);
  }
  const matchedPassword = await bcrypt.compare(password, user.password);
  if (user && matchedPassword) {
    const token = await generateJWT({
      email: user.email,
      id: user._id,
      role: user.role,
    });
    res.json({ status: httpStatusText.SUCCESS, data: { token } });
  } else {
    const error = appError.create(
      "Invalid email or paswword",
      401,
      httpStatusText.ERROR,
    );
    return next(error);
  }
});

module.exports = {
  getAllUsers,
  getUser,
  addUser,
  updateUser,
  deleteUser,
  registerUser,
  loginUser,
};
