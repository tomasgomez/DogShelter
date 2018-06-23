const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const passport = require("passport");
require("./passport");

const index = require('./routes/index');
const auth = require("./routes/auth");
const user = require("./routes/user");

const app = express();

app.use(cookieParser());
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);
app.use(passport.initialize());
app.use(express.static(__dirname + "/public"));

// Routes
app.use('/', index);
app.use('/user', passport.authenticate('jwt', {
    session: false
}), user);
app.use('/auth', auth);

module.exports = app;