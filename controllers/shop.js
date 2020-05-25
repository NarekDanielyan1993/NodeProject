const fs = require("fs");
const path = require("path")
const PdfDocument = require("pdfkit");
const stripe = require("stripe")("sk_test_ijzrN09sTjuIjuiV4W8LBqya00RkVEZkV3")

const Product = require('../models/product');
const User = require('../models/users');
const Orders = require('../models/orders');

const DISPLAYED_ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
    let page = parseInt(req.query.page) || 1;
    Product.find()
    .countDocuments()
    .then(result => {
      return result; 
    }) 
    .then((result) => {
      Product.find()
      .skip((1 === page ? 1 : page - 1) * DISPLAYED_ITEMS_PER_PAGE)
      .limit(2) 
      .then(products => {
        res.render('shop/product-list', {
          prods: products,
          pageTitle: 'Shop',
          path: '/products',
          hasProducts: products.length > 0,
          firstPage: 1,
          currentPage: page,
          isGapInTheStart: page > 3,
          isGapInTheEnd: (result - (page * DISPLAYED_ITEMS_PER_PAGE)) > DISPLAYED_ITEMS_PER_PAGE * 2,
          hasPreviousPage: page  > 2,
          hasNextPage: result > page * DISPLAYED_ITEMS_PER_PAGE,
          lastPage: Math.ceil(result / DISPLAYED_ITEMS_PER_PAGE)
        });
      })
    })
      .catch(err => {
        const error = new Error(err);
        errorr.statusCode = 500;
        next(error)
      })
};

exports.getIndex = (req, res, next) => {
  let page = parseInt(req.query.page) || 1;
  Product.find()
  .countDocuments()
  .then(result => {
    return result; 
  }) 
  .then((result) => {
    Product.find()
    .skip((1 === page ? 1 : page - 1) * DISPLAYED_ITEMS_PER_PAGE)
    .limit(2)                                         
    .then(products => {                              
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        firstPage: 1,
        currentPage: page,
        isGapInTheStart: page > 3,
        isGapInTheEnd: (result - (page * DISPLAYED_ITEMS_PER_PAGE)) > DISPLAYED_ITEMS_PER_PAGE * 2,
        hasPreviousPage: page  > 2,
        hasNextPage: result > page * DISPLAYED_ITEMS_PER_PAGE,
        lastPage: Math.ceil(result / DISPLAYED_ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      errorr.statusCode = 500;
      next(error)
    })
  })       
  .catch(err => {
    const error = new Error(err);
    errorr.statusCode = 500;
    next(error)
  })
}

  exports.getProduct = (req, res, next) => {
    Product.findById(req.params.productId)
    .then(product => {
      console.log(product)
      res.render('shop/product-detail', {
        product: product,
        pageTitle: 'Product detail',                      
        path: '/products'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.statusCode = 500;
      next(error)
    })
  };

  exports.getOrder = (req, res, next) => {
      Orders.find({'user.userId': req.user._id})
      .then(orders => {
        res.render('shop/orders', {
          pageTitle: 'Your Orders',
          path: '/orders',
          orders
        }); 
      })
      .catch(err => {
        const error = new Error(err);
        errorr.statusCode = 500;
        next(error)
      }) 

  };

  exports.getCartPage = (req, res, next) => {
      req.user.populate("cart.items.productId")
      .execPopulate()
      .then(products => {
          res.render('shop/cart', {
              path: '/cart',
              pageTitle: 'Your Cart',
              products: products.cart.items
          }); 
      })
      .catch(err => {
        const error = new Error(err);
        errorr.statusCode = 500;
        next(error)
      })
  };

  exports.renderCheckoutPage = (req, res, next) => {
    let total = 0;
    let prods;
    req.user.populate("cart.items.productId")
    .execPopulate()
    .then(products => {
      prods = products;
      for(let item of products.cart.items) {
         total += item.productId.price * item.quantity;
      }
      // console.log(products.cart.items)
      // console.log(""+req.original+"/success")
      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: products.cart.items.map(item => {
          return {
            name: item.productId.title,
            currency: "usd",
            description: item.productId.description,
            amount: item.productId.price * 100,
            quantity: item.quantity
          }
        }),
        success_url: ""+req.get("origin")+"/checkout/success",
        cancel_url: ""+req.get("origin")+"/checkout/cancel"
      })
    })
    .then(session => {
      res.render('shop/checkout', {
        path: '',
        pageTitle: 'Your Cart',
        products: prods.cart.items,
        totalPrice: total,
        sessionId: session.id
      }); 
    })
    .catch(err => {
      const error = new Error(err);
      error.statusCode = 500;
      next(error)
    })
};

exports.succeedInCheckout = (req, res, next) => {
  req.user.addToOrder()
  .then(products => {
    const order = new Orders({
      user: {
        userId: req.user._id,
        email: req.user.email
      },
      products: products
    })
    order.save()
  })
  .then(() => {
    req.user.clearCart();
  })
  .then(() => {
    res.redirect("/orders")
  })
  .catch(err => {
    const error = new Error(err);
    error.statusCode = 500;
    next(error)
  })
}

  exports.deletCartItem = (req, res, next) => {
      const id = req.body.productId;
      req.user.deleteItemFromCart(id)
      .then(result => {                     
        res.redirect("/cart"); 
      }) 
      .catch(err => {
        const error = new Error(err);
        error.statusCode = 500;
        next(error)
      })  
  }

  exports.postCart = (req, res, next) => {
    Product.findById(req.body.product)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(() => {
        res.redirect("/cart"); 
    })
    .catch(err => {
      const error = new Error(err);
      error.statusCode = 500;
      next(error)
    })
  };    
  
exports.getInvoice = (req, res, next) => {
  const orderId = req.params.order;
  const filename = "invoice-"+orderId+".pdf";
  Orders.findById(orderId)
  .then((order) => {
    if(!order) {
      return next(new Error("Order not found"))
    }
    if(order.user.userId.toString() !== req.user._id.toString()) {
      return next(new Error("No Authorized"))
    }
    const documentPath = path.join(process.cwd(), "data", "invoice", filename)
    const pdfDoc = new PdfDocument()
    pdfDoc.pipe(fs.createWriteStream(documentPath))
    pdfDoc.pipe(res)

    pdfDoc.text("Invoice")
    pdfDoc.text("-------------------")

    let totalPrice = 0;
    order.products.forEach(item => {
      totalPrice += item.product.price;
      pdfDoc.text(item.product.title + " - " + item.quantity + " * " + item.product.price)  
    })
    pdfDoc.fontSize(20).text("TotalPrice - " + totalPrice)
    pdfDoc.end()
    // const file = fs.createReadStream(pt)
    //   res.setHeader("Content-Type", "application/pdf")
    //   res.setHeader("Content-Disposition", "inline; filename='"+filename+"' ")
    //   file.pipe(res)
  })
  .catch((err) => {
    return next(err)
  })
}



