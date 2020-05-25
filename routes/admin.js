const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();
const {body} = require("express-validator")

//middlewares
const isAuth = require("../middleware/auth")

router.get("/products", isAuth, adminController.getProducts)

router.get('/add-product', isAuth, adminController.getAddProduct);

router.post('/add-product', isAuth,
body("title", "Title should contain not less than 1 and not more than 2 characters").isLength({"min": 1, "max": 20})
.isString().trim(),
body("price", "price have to be number")
.isFloat(),
body("description", "length of the description have to be between 1 and 2 ")
.isLength({"min":1, "max": 200})
.trim(),
adminController.postAddProduct);

router.post('/edit-product',isAuth, 
body("title", "Title should contain not less than 1 and not more than 2 characters").isLength({"min": 1, "max": 20})
.isString().trim(),
body("price", "price have to be number")
.isFloat(),
body("description", "length of the description have to be between 1 and 2 ")
.isLength({"min":1, "max": 200})
.trim(), 
 adminController.postEditProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.delete("/delete-product/:productId", isAuth, adminController.deleteProduct)

module.exports = router;
