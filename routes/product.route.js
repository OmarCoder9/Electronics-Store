const express = require("express")
const verifyToken = require("../middlewares/verifyToken")
const userController = require("../controllers/users.controller")
const router  = express.Router();
const allowedTo = require("../middlewares/allowedTo")


router.route('/').get(verifyToken, userController.getAllUsers)
