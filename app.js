const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const session = require("express-session");
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");

const mongoConnect = require("./util/database").mongoConnect;
const mongoose = require("mongoose");
const MongoDbStore = require("connect-mongodb-session")(session);
const errorController = require('./controllers/error');

const app = express();

//Models
const User = require("./models/users");       
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');   
const authRoutes = require('./routes/auth'); 

const MONGODB_URI = "mongodb+srv://Narek:096616917n@cluster0-zfrse.mongodb.net/shop";

const store = new MongoDbStore({
    uri: MONGODB_URI,
    collection: "sessions"
})

app.set('view engine', 'ejs');
app.set('views', 'views');


const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
      cb(null, new Date().toISOString() + '-' + file.originalname);
    }
  });

const fileFilter = (req, file, cb) => {
  if(
    file.mimetype === "image/png" || 
    file.mimetype === "image/jpg" || 
    file.mimetype === "image/jpeg"
  ) {
    return cb(null, true)
  }
  cb(null, false)
}

const csrfProtection = csrf();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single("image"))

app.use(express.static(path.join(__dirname, 'public')));
app.use("/public/images", express.static(path.join(__dirname, 'public/images')));

app.use(session({secret: "my secret", resave: false, saveUninitialized: false, store: store}))

app.use(csrfProtection)

app.use(flash())

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLOggedIn,
    res.locals.csrf = req.csrfToken()
    next()
})

app.use((req, res, next) => {
    if(!req.session.user) {
        return next()
    }
    User.findById(req.session.user._id)
    .then((user) => {
        if(!user) {
            return next()
        }
        req.user = user;   
        return next() 
    })
    .catch(err => {
        return next(new Error(err))
    })
})


// Routes
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use("/500", errorController.get500);
app.use(errorController.get404);

//error middleware
app.use((error, req, res, next) => {
  console.log(error)
  res.status(500).render('500', { pageTitle: 'Error' , path: "/500", isAuthenticated: req.session.isLOggedIn, error: error});
    
})

mongoose.connect(MONGODB_URI, { useUnifiedTopology: true,  useNewUrlParser: true})
.then(() => {
    app.listen(3001);
})
.catch((err) => {
    next(new Error(err))
})

