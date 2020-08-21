const path = require("path");
const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const errorController = require("./controllers/error");
const mongoose = require("mongoose");
const multer = require("multer");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const shopController = require("./controllers/shop");
const isAuth = require("./middleware/is-auth");
const User = require("./models/user");
// const sequelize = require("./util/database");
// const Product = require("./models/product");
// const User = require("./models/user");
// const Cart = require("./models/cart");
// const CartItem = require("./models/cart-item");
// const Order = require("./models/order");
// const OrderItem = require("./models/order-item");

const app = express();
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${
  process.env.MONGO_PASSWORD
}@cluster0-e7jon.mongodb.net/${
  process.env.MONGO_DEFAULT_DATABASE
}?retryWrites=true`;
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions"
});

const csrfProtection = csrf();
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getMilliseconds().toString() + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
app.use(flash());
app.set("view engine", "ejs");
app.set("views", "views");
console.log("howdy")

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);
app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => {
      throw new Error(err);
    });
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});

app.post("/create-order", isAuth, shopController.postOrder);
app.use(csrfProtection);
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);
app.use((error, req, res, next) => {
  console.log(error);
  res.redirect("/");
});

mongoose
  .connect(MONGODB_URI, { useFindAndModify: false, useNewUrlParser: true })
  .then(result => {
    app.listen(process.env.PORT || 3000);
  })
  .catch(err => console.log(err));

//associations for sequelize
/*
Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem });

sequelize
  .sync()
  .then(result => {
    return User.findByPk(1);
    //console.log(result);
  })
  .then(user => {
    if (!user) {
      return User.create({ name: "Arthur", email: "dayne@gmail.com" });
    }
    return user;
  })
  .then(user => {
    user
      .getCart()
      .then(cart => {
        if (cart) {
          return cart;
        }
        return user.createCart();
      })
      .catch(err => console.log(err));
  })
  .then(cart => {
    app.listen(3000);
  })
  .catch(err => console.log(err)); */
