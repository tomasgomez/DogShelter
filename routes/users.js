const express = require('express');
const router = express.Router();

const passport = require("passport");
const jwt_decode = require("jwt-decode");

router.post('/', (req, res) => {
    database.uniqid().then(ids => {
        let user = req.body;
        user["_id"] = ids[0];
        user["role"] = "client";

        database.insert("ds_users", user).then(() => {
            res.status(200).send({
                message: "New user added!"
            });
        }, err => {
            res.send(err);
        });
    });
});

router.get('/profile', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    let bearer = req.get("Authorization");
    let token = bearer.split(" ")[1];
    let data = jwt_decode(token);

    database.get('ds_users', data.id).then((user) => {
        res.status(200).json({
            name: user.data.name,
            phone: user.data.phone,
            address: user.data.address,
            photo: user.data.photo,
            email: user.data.email,
            role: user.data.role
        });
    }, err => {
        res.send(err);
    });
});

module.exports = router;