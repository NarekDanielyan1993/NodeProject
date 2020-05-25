const express = require('express');

const router = express.Router();

const authController = require("../controllers/auth")
const {body, oneOf} = require("express-validator")

//middlewares
const isAuth = require("../middleware/auth")

const User = require("../models/users");

router.get("/login", authController.getLogin)

router.post("/login", [ 
  body("email", "email is not correct")
  .isEmail()
  .custom((value, {req}) => {
      return User.findOne({email: value})
        .then(user => {
            if(!user) {
                return Promise.reject("Email does not exist")
            }
        })
  })
  .normalizeEmail()
  .trim(),
  body("password", "Password must to contain symbol, upper and lower characters and number as well")
  .trim()
  .isLength({min: 4})
  
  //.matches("/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W])/")
  ], authController.postLogin)

router.get('/signup', authController.getSignup);

router.post('/signup',
  [
    body("email", "Email is not correct")
    .isEmail()
    .custom((value, {req}) => {
        return User.findOne({email: value}) 
        .then((user) => {
            if(user) {
                return Promise.reject("Email already in use")
            }
        })  
    })
    .normalizeEmail()
    .trim(),
    body("password", "Password has to be at least 5 characters long and contain numbers")
    .isLength({min: 5})
    .trim(),
    body("passwordConfirm")
    .custom((value, {req}) => {
        if(value !== req.body.password) {
            throw new Error("Password confirmation is incorrect")
        }
        return true;
    })
  ], authController.postSignup);

router.post('/logout', authController.postLogout);

router.post('/reset',  authController.postResetPassword);

router.get('/reset',  authController.getResetPassword);

router.get('/reset/:token',  authController.getUpdatePassword);

router.post('/new_password',  authController.postUpdatePassword);

module.exports = router;