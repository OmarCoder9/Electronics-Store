const mongoose = require("mongoose");
const validator = require("validator");
const userRoles = require("../utils/userRoles");
const { validate } = require("./product.model");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    validate: [validator.isEmail, "Invalid Email Address"],
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: [userRoles.ADMIN, userRoles.USER],
    default: userRoles.USER,
  },
});
module.exports = mongoose.model("User", userSchema);