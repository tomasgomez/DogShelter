const express = require('express');
const router = express.Router();

/* GET products listing. */
router.get('/', function (req, res) {
    database.get('ds_products', "_all_docs?include_docs=true").then(result => {
        let products = result.data.rows.map((product) => {
            return product.doc;
        });
        res.status(200).json(products);
    }, err => {
        res.send(err);
    });
});

router.get('/:id', (req, res) => {
    database.get('ds_products', req.params.id).then(product => {
        res.status(200).json(product.data);
    }, err => {
        res.send(err);
    });
});

module.exports = router;