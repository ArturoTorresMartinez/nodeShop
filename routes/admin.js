const path = require("path");

const express = require("express");

const { body } = require('express-validator/check');

const adminController = require("../controllers/admin");

const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/add-product", isAuth, adminController.getAddProduct);

router.get("/products", isAuth, adminController.getProducts);

router.post("/add-product",
    [body('title').isString().isLength({ min: 3 }).trim().withMessage('Invalid Title'),
    body('price').isDecimal().withMessage('The price you entered is invalid, please make sure to use currency standard 00.00'),
    body('description').isLength({ min: 5, max: 255 }).trim().withMessage('Description is invalid, minimum 3 characters long, maximum 255')],
    isAuth, adminController.postAddProduct);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post("/edit-product/",
    [body('title').isString().isLength({ min: 3 }).trim().withMessage('Invalid Title'),
    body('price').isDecimal().withMessage('The price you entered is invalid, please make sure to use currency standard 00.00'),
    body('description').isLength({ min: 5, max: 255 }).trim().withMessage('Description is invalid, minimum 3 characters long, maximum 255')],
    isAuth, adminController.postEditProduct);

router.post("/delete-product", isAuth, adminController.postDeleteProduct);

module.exports = router;
