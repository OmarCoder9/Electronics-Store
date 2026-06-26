const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const productController = require("../controllers/products.controller");
const router = express.Router();
const allowedTo = require("../middlewares/allowedTo");
const userRoles = require("../utils/userRoles");


router.route("/")
    .get(productController.getAllProducts)
    .post(verifyToken, allowedTo(userRoles.ADMIN), productController.addProduct)


router.route("/:productId")
    .get(productController.getProductDetails)
    .patch(verifyToken, allowedTo(userRoles.ADMIN), productController.updateProduct)
    .delete(verifyToken, allowedTo(userRoles.ADMIN), productController.deleteProduct)


module.exports = router;