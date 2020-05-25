const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');

const isAuth = require("../middleware/auth");

const router = express.Router();

router.get('/products', shopController.getProducts);

router.get("/", shopController.getIndex)

router.get("/orders", isAuth, shopController.getOrder)

router.get("/orders/:order", isAuth, shopController.getInvoice)

router.get("/cart",  isAuth, shopController.getCartPage);

router.post("/add-to-cart", isAuth, shopController.postCart);

router.post("/checkout", isAuth, shopController.renderCheckoutPage);

router.post("/checkout/cancel", isAuth, shopController.renderCheckoutPage);

router.post("/checkout/success", isAuth, shopController.succeedInCheckout);

router.get("/products/:productId", shopController.getProduct);

router.post("/cart-delete-item", isAuth, shopController.deletCartItem);

module.exports = router;

