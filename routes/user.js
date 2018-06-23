const express = require('express');
const router = express.Router();

const jwt_decode = require("jwt-decode");

/* GET users listing. */
router.get('/', function (req, res, next) {
    console.log("/user called");
    res.status(200).json({
        message: "hello /user"
    });
});

/* GET user profile. */
router.get('/profile', function (req, res, next) {
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