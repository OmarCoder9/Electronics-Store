const asyncWrapper = require("../middlewares/asyncWrapper");
const User = require("../models/user.model");
const appError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");

const getAllUsers = asyncWrapper(async (req, res) => {
  const query = req.query;
  const limit = query.limit || 20;
  const page = query.page || 1;
  const skip = (page - 1) * limit;

  const users = await User.find({}, { __v: false }).limit(limit).skip(skip);

  res.json({ status: httpStatusText.SUCCESS, data: { users } });
});

const getUser = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.params.userid);
  if(!user){
    const error = appError.create("User Not Found", 404, httpStatusText.FAIL)
    return next(error);
  }
  return res.json({status:httpStatusText.SUCCESS, data:{user}})
});


const addUser = asyncWrapper(async (req, res, next) => {
    const newUser = new User(req.body);

    await newUser.save();

    res.status(201).json({status: httpStatusText.SUCCESS, data: {course: newUser}})
})

const updateUser = asyncWrapper(async (req, res) => {
    const userId = req.params.userId;    
    const updatedUser = await User.updateOne({_id: userId}, {$set: {...req.body}});
    return res.status(200).json({status: httpStatusText.SUCCESS, data: {user: updatedUser}})
})

const deleteUser = asyncWrapper(async (req, res) => {
    await User.deleteOne({_id: req.params.userId});
    res.status(200).json({status: httpStatusText.SUCCESS, data: null});
})

module.exports = {
  getAllUsers,
  getUser,
  addUser,
  updateUser,
  deleteUser
};
