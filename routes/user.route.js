const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const userController = require("../controllers/users.controller");
const router = express.Router();
const allowedTo = require("../middlewares/allowedTo");
const userRoles = require("../utils/userRoles");

router.route("/").get(verifyToken, userController.getAllUsers);

router.route("/register").post(userController.registerUser);
router.route("/login").post(userController.loginUser);

router
  .route("/:userId")
  .get(userController.getUser)
  .patch(verifyToken, userController.updateUser)
  .delete(verifyToken, allowedTo(userRoles.ADMIN), userController.deleteUser);

module.exports = router;
