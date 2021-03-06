const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const passport = require("passport");
require("./passport"); // config passport + jwt

const app = express();

app.use(cookieParser());
app.use(
  bodyParser.json({
    limit: "10mb",
    extended: true
  })
);
app.use(
  bodyParser.urlencoded({
    limit: "10mb",
    extended: true
  })
);
app.use(passport.initialize());
app.use(express.static(__dirname + "/public"));

// Routes
const index = require("./routes/index");
const auth = require("./routes/auth");
const users = require("./routes/users");
const products = require("./routes/products");
const services = require("./routes/services");
const orders = require("./routes/orders");

app.use("/", index);
app.use("/auth", auth);
app.use("/users", users);
app.use("/products", products);
app.use("/services", services);
app.use("/orders", orders);

module.exports = app;