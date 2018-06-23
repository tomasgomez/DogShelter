const path = require('path');
const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");
const passport = require("passport");

/* POST login. */
router.post('/login', (req, res) => {
    passport.authenticate('local', {
        session: false
    }, (err, user, info) => {
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

router.get('/logout', (req, res) => {
    let bearer = req.get("Authorization");
    let token = bearer.split(" ")[1];
    let data = jwt_decode(token);

    database.get('ds_users', data.id).then((user) => {
        let role = user.data.role;
        if (role === "client") {
            res.status(200).json({
                role: "client"
            });
        } else {
            res.status(200).json({
                role: "admin"
            });
        }
    }, err => {
        res.send(err);
    });
})

module.exports = router;