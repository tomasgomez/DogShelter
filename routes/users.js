const express = require('express');
const router = express.Router();

const passport = require("passport");
const jwt_decode = require("jwt-decode");

router.post('/', (req, res) => {
    database.users.add(req.body, err => {
        if (err) {
            res.send(err);
        } else {
            res.status(200).send({
                message: "New user added!"
            });
        }
    });
});

router.get('/profile', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    let bearer = req.get("Authorization");
    let token = bearer.split(" ")[1];
    let data = jwt_decode(token);

    database.users.findById(data.id, (err, user) => {
        if (err) {
            res.send(err);
        } else {
            res.status(200).json({
                name: user.name,
                phone: user.phone,
                address: user.address,
                photo: user.photo,
                email: user.email,
                role: user.role
            });
        }
    });
});

module.exports = router;