const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");
const passport = require("passport");

/* POST login. */
router.post('/login', function (req, res, next) {
    passport.authenticate('local', {
        session: false
    }, (err, user, info) => {
        // console.log("requested login: user: " + JSON.stringify(user));
        if (err || !user) {
            return res.status(400).json({
                message: 'Something is not right',
                user: user
            });
        }
        req.login(user, {
            session: false
        }, (err) => {
            if (err) {
                res.send(err);
            }
            // generate a signed son web token with the contents of user object and return it in the response
            const token = jwt.sign({
                id: user._id
            }, user.password, {
                expiresIn: "2 days"
            });
            return res.json({
                token: token
            });
        });
    })(req, res);
});

module.exports = router;