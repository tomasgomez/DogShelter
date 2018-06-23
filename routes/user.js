const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    console.log("/user called");
    res.status(200).json({
        message: "hello /user"
    });
});

/* GET user profile. */
router.get('/profile', function (req, res, next) {
    console.log("/user/profile called");
    res.status(200).json({
        message: "hello /user/profile"
    });
});

module.exports = router;