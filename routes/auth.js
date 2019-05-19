const express = require("express");

const { check, body } = require('express-validator/check');

const authController = require("../controllers/auth");

const router = express.Router();

const User = require("../models/user");

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post("/login", [body('email').withMessage('Please enter a valid email address').normalizeEmail(), body('password').trim()], authController.postLogin);

router.post("/signup", [
    check('email').isEmail().withMessage('Please enter a valid email').custom(async (value, { req }) => {
        // if (value === 'test@test.com') {
        //     throw new Error('This email address is forbidden');
        // }
        // return true;
        const userData = await User.findOne({ email: value });
        if (userData) {
            return Promise.reject('Email already exists, please pick a different one');
        }
    }).normalizeEmail(),
    body('password', 'Password must be at least 4 characters long and alphanumeric').isLength({ min: 4 }).isAlphanumeric().trim(),
    body('confirmPassword').trim().custom((value, { req }) => {
        if (req.body.password !== value) {
            throw new Error('Password confirmation does not match password');
        }
        return true;
    })
],
    authController.postSignup);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
