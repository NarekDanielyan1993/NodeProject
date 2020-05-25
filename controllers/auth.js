const User = require("../models/users");  
const bcrypt = require("bcryptjs");
const sgMail = require("@sendgrid/mail");
const crypto = require("crypto")

//validation
const {validationResult} = require("express-validator")

sgMail.setApiKey("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")

exports.postResetPassword = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if(err) {
            console.log(err);
            req.flash("error", "something went wrong")
            res.redirect("/reset")
        }
        const token = buffer.toString("hex");
        let email = req.body.email;
        User.findOne({email:email})
           .then(user => {
                user.token = token;
                user.expirationToken = Date.now() + 360000;
                return user.save()
            })
            .then(() => {
                sgMail.send({
                    to: email,
                    from: "danielyann729@gmail.com",
                    subject: "password reset",
                    html: `<h1> Conform of reseting password</h1>
                           <p>please click on link to conform <a href="http://localhost:3001/reset/${token}">conform</a></p>
                          `
                })
                res.redirect("/login")
            })
            .catch(err => {
                if(err) {
                    console.log(err)
                    req.flash("error", "No user is found with that account")
                    res.redirect("/reset")
                }
            })
        
    })
}

exports.getUpdatePassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({token: token, expirationToken: {$gt: Date.now()}})
    .then(user => {
        let message = req.flash("error");
        if(message.length >= 1) {
            message = message[0];
        } else {                                             
            message = null;                                   
        }                                                   
        res.render("auth/new_password", {
            path: '/reset',
            pageTitle: 'reset Password',
            errorMessage: message,
            resetToken: token,
            userId: user._id.toString()
        })
    })
    .catch(err => {
        if(err) console.log(err)
        req.flash("error", "User with that token does not exist")
        res.redirect("/login")
    })
}

exports.postUpdatePassword = (req, res, next) => {
    const password = req.body.password;
    const userId = req.body.userId;
    const token = req.body.token;
    User.findOne({_id: userId, token: token, expirationToken: {$gt: Date.now()}})
    .then(user => {
        bcrypt.hash(password, 12)
        .then((hashedPassword) => {
            user.password = hashedPassword;
            user.token = undefined;
            user.expirationToken = undefined;
            return user.save()   
        })
        .then(() => {
            res.redirect("/login")
        }) 
        .catch(err => {
            console.log(err)
            req.flash("error", "Something went wrong.Please try again")
            res.redirect("/login")
        })
    })
    .catch(err => {
        console.log(err)
        req.flash("error", "The  appropriate user not found")
        res.redirect("/login")
    })  
}

exports.getResetPassword = (req, res, next) => {
    let message = req.flash("error");
    if(message.length > 0) {
       message = message[0]; 
    } else {
        message = null;
    }
    res.render("auth/resetPassword", {
        path: "/reset",
        pageTitle: "Reset",
        errorMessage: message
    })
}

exports.getLogin = (req, res, next) => {
   // const isLOggedIn = req.get("Cookie").split("=")[1]
//    let message = req.flash("error");
//     if(message.length >= 1) {
//         message = message[0];
//     } else {                                             
//         message = null;                                   
//     }                                                   
    res.render('auth/login', {                              
        path: '/login',
        pageTitle: 'Auth',
        validationErrors: "",
        prevInputValues: "",
        errorMessage: ""               
    });
}                                                          
                                                
exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
      const prevInputValues = {"email": req.body.email, "password": req.body.password}  
      let errorMessages = {}
      for (const item of errors.array()) {
          errorMessages[item.param] = item.msg
      }
      //console.log(errorMessages)
      return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'logIn',
          validationErrors: errorMessages,
          prevInputValues: prevInputValues,
          errorMessage: ""
      });
    }
    User.findOne({email: email})
    .then(user => {
        if(!user) {
            const message = "Email not found";
            return res.status(422).render('auth/login', {
                path: '/login',
                pageTitle: 'logIn',
                validationErrors: "",
                prevInputValues: "",
                errorMessage: message
            });            
        }                                       
        return bcrypt.compare(password, user.password)
        .then(isMatched => {
            if(!isMatched) {
                message = "Enter correct password";
                return res.status(422).render('auth/login', {
                    path: '/login',
                    pageTitle: 'logIn',
                    validationErrors: "",
                    prevInputValues: "",
                    errorMessage: message
                });   
            }
            req.session.user = user;
            req.session.isLOggedIn=true;               
            return req.session.save(err => {
                res.redirect("/")
            })
            // req.flash("error", "invalid password");
            // res.redirect("/login")
        })
        .then(() => {
            console.log(req.session.isLOggedIn)
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
    // in case of logIn via cookie                 
    //res.setHeader("Cookie", "isLoggedIn=true")     
}
                                                 
exports.getSignup = (req, res, next) => {
    let message = req.flash("error");
    if(message.length >= 1) {
        message = message[0];
    } else {                                             
        message = null;                                   
    }  
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Auth',
        errors: "",
        prevInputValue: ""
    });
}
                                                         
exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;                 
    const errors = validationResult(req);
    const prevInputValues = {"email": req.body.email, "password": req.body.password, "passwordConfirm": req.body.passwordConfirm};
    let errorsMessages = {}
    for (const item of errors.array()) {
        errorsMessages[item.param] = item.msg;
    }
    console.log(errorsMessages)
    if(!errors.isEmpty()) {                              
        return res.status(422)
        .render('auth/signup', {                     
            path: '/signup',
            pageTitle: 'Auth',
            errors: errorsMessages,
            prevInputValue: prevInputValues
        })
    }
    return bcrypt.hash(password, 12)
    .then((hashedPassword) => {
        user = new User({                                  
            email: email,
            password: hashedPassword,
            cart: {items: []}
        })
        return user.save()
    })
    .then(() => {
        sgMail.send({
            to: email,
            from: "danielyann729@gmail.com",
            subject: "Signup succesiding",
            html: "<h1>You successfully signup</h1>"
        })
        res.redirect("/login")
    })
    .catch(err => {
        const error = new Error(err);
        errorr.statusCode = 500;
        next(error)
    })
}

exports.postLogout = (req, res, next) => {
    req.session.isLOggedIn = false
    req.session.user = null;
    req.session.save(err => {
        res.redirect("/")
    })
}                                                    


