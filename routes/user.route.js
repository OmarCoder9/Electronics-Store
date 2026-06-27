const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const userController = require("../controllers/users.controller");
const router = express.Router();
const allowedTo = require("../middlewares/allowedTo");
const userRoles = require("../utils/userRoles");
const validateRequest = require("../middlewares/validateRequest");
const {
  registerValidator,
  loginValidator,
  updateUserValidator,
} = require("../validators/user.validator");

router.route("/").get(verifyToken, userController.getAllUsers);

router
  .route("/register")
  .post(registerValidator, validateRequest, userController.registerUser);
router
  .route("/login")
  .post(loginValidator, validateRequest, userController.loginUser);

router
  .route("/:userId")
  .get(verifyToken, userController.getUser)
  .patch(
    verifyToken,
    updateUserValidator,
    validateRequest,
    userController.updateUser,
  )
  .delete(verifyToken, allowedTo(userRoles.ADMIN), userController.deleteUser);

module.exports = router;
