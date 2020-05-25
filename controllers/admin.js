const Product = require('../models/product');
const {validationResult} = require("express-validator");
const mongoose = require("mongoose");

const file = require("../util/file");

  exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      Editing: false,
      product: "",
      hasError: false,
      commonErrMessage: "" 
    });
  };

  exports.postAddProduct = (req, res, next) => {
    const image = req.file;
    const title = req.body.title;                         
    const price = req.body.price;
    const description = req.body.description; 
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
      let errorsFields = {}
      const fieldValues = {
                           "title": req.body.title, 
                           "imageUrl": "", 
                           "price": +req.body.price, 
                           "description": req.body.description
                          }
      for (const field of errors.array()) {
        errorsFields[field.param] = field.msg; 
      }
      return res.status(422).render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        Editing: false,
        product: "",
        hasError: false,
        commonErrMessage: "" 
      });
    }   
    if(!image) {
      const errMessage = "Attached file is not correct";
      return res.status(422).render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        Editing: false,
        product: "",
        hasError: false,
        commonErrMessage:errMessage
      });
    }
    const product = new Product({
      //_id: mongoose.Types.ObjectId("5e3d38a9beca5d54a7860817"),
      imageUrl: image.path,
      title: title, 
      price: price,  
      description:description,
      userId: req.user
    });
    product.save()
      .then(() => {
        res.redirect('/admin/products');
      })
      .catch(err => {
        const error = new Error(err);
        error.statusCode = 500;
        next(error)
      })
  }                                               

exports.getEditProduct = (req, res, next) => {
  Product.findOne({_id: req.params.productId, userId: req.user._id})
  .then(product => {
    if(!product) {
      return res.redirect("/admin/products");
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      Editing: true,
      product: product,
      errorMessages: "",
      hasError: true,
      commonErrMessage: "" 
    });
  })
};
  
exports.postEditProduct = (req, res, next) => {
  const productId = req.body.productId;
  const image = req.file;
  const title = req.body.title;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    let errorsFields = {}
    const fieldValues = {
                         "title": req.body.title, 
                         "imageUrl": req.body.imageUrl, 
                         "price": +req.body.price, 
                         "description": req.body.description
                        }
    for (const field of errors.array()) {
      errorsFields[field.param] = field.msg; 
    }
    return res.status(422).render("admin/edit-product", {
      pageTitle: 'Edit Product',
      path: '/admin/edit-products',
      product: fieldValues,
      errorMessages: errorsFields,
      Editing: false,
      hasError: true,
      commonErrMessage: "" 
    })
  }
  Product.findOne({_id: productId, userId: req.user._id})
    .then(product => {
        if(!product) {
            return res.redirect("admin/products")
        }
        product.title = title;
        if(!image) {
          file.deleteFile(product.imageUrl)
          product.imageUrl = image;
        }
        product.description = description;
        product.price = price;
        product.save().then(() => {
            res.redirect('/');
        })
    })
    .catch(err => {
      const error = new Error(err);
      error.statusCode = 500;
      next(error)
    })
};

  exports.deleteProduct = (req, res, next) => {
    const prodId = req.params.productId;
    console.log(prodId)
    Product.findOneAndDelete({_id: prodId, userId: req.user._id})
      .then((product) => {
          if(!product) {
            return next(new Error("Product not found"))
          }
          req.user.deleteItemFromCart(product._id)
          file.deleteFile(product.imageUrl)
          res.status(200).json({message: "successfull"}); 
      })
      .catch(err => {
        res.status(500).json()
      })
  }

  exports.getProducts = (req, res, next) => {
    let message = req.flash("error");
    if(message.length >= 0) {
      message = message[0];
    } else {
      message = null;
    }
    Product.find({userId: req.user._id})
      .then(products => {
        res.render('admin/products', {
          prods: products,
          pageTitle: 'admin',
          path: '/admin/products',
          errorMessage: message
        });
      })
      .catch(err => {
        return next(err)
      })
  };

