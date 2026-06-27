const asyncWrapper = require("../middlewares/asyncWrapper");
const User = require("../models/user.model");
const appError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");
const bcrypt = require("bcryptjs");
const generateJWT = require("../utils/generateJWT");
const getPagination = require("../utils/getPagination");
const hashPassword = require("../utils/hashPassword");
const userRoles = require("../utils/userRoles");

const formatAuthResponse = (user, token) => ({
  user: {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  },
  token,
});

const isSelfOrAdmin = (req, userId) =>
  String(req.currentUser.id) === String(userId) ||
  req.currentUser.role === userRoles.ADMIN;

const getAllUsers = asyncWrapper(async (req, res) => {
  const { limit, skip } = getPagination(req.query);
  const users = await User.find().limit(limit).skip(skip);
  res.json({ status: httpStatusText.SUCCESS, data: { users } });
});

const getUser = asyncWrapper(async (req, res, next) => {
  if (!isSelfOrAdmin(req, req.params.userId)) {
    return next(
      appError.create("Not authorized", 403, httpStatusText.FAIL),
    );
  }

  const user = await User.findById(req.params.userId);
  if (!user) {
    return next(appError.create("User Not Found", 404, httpStatusText.FAIL));
  }
  return res.json({ status: httpStatusText.SUCCESS, data: { user } });
});

const updateUser = asyncWrapper(async (req, res, next) => {
  const userId = req.params.userId;

  if (!isSelfOrAdmin(req, userId)) {
    return next(
      appError.create("Not authorized", 403, httpStatusText.FAIL),
    );
  }

  const allowedFields = ["firstName", "lastName", "email", "password"];
  const updateData = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  }

  if (req.currentUser.role === userRoles.ADMIN && req.body.role !== undefined) {
    updateData.role = req.body.role;
  }

  if (updateData.password) {
    updateData.password = await hashPassword(updateData.password);
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true },
  );

  if (!updatedUser) {
    return next(appError.create("User Not Found", 404, httpStatusText.FAIL));
  }

  return res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, data: { user: updatedUser } });
});

const deleteUser = asyncWrapper(async (req, res, next) => {
  const deletedUser = await User.findByIdAndDelete(req.params.userId);

  if (!deletedUser) {
    return next(appError.create("User Not Found", 404, httpStatusText.FAIL));
  }

  res.status(200).json({ status: httpStatusText.SUCCESS, data: null });
});

const registerUser = asyncWrapper(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  const oldUser = await User.findOne({ email });
  if (oldUser) {
    return next(
      appError.create("User Already Exists", 400, httpStatusText.FAIL),
    );
  }

  const newUser = new User({
    firstName,
    lastName,
    email,
    password: await hashPassword(password),
  });
  await newUser.save();

  const token = await generateJWT({
    email: newUser.email,
    id: newUser._id,
    role: newUser.role,
  });

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: formatAuthResponse(newUser, token),
  });
});

const loginUser = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(
      appError.create(
        "Invalid email or password",
        401,
        httpStatusText.ERROR,
      ),
    );
  }

  const matchedPassword = await bcrypt.compare(password, user.password);
  if (!matchedPassword) {
    return next(
      appError.create(
        "Invalid email or password",
        401,
        httpStatusText.ERROR,
      ),
    );
  }

  const token = await generateJWT({
    email: user.email,
    id: user._id,
    role: user.role,
  });

  res.json({
    status: httpStatusText.SUCCESS,
    data: formatAuthResponse(user, token),
  });
});

module.exports = {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  registerUser,
  loginUser,
};
