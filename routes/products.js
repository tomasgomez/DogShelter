const express = require('express');
const router = express.Router();

/* GET products listing. */
router.get('/', (req, res) => {
    database.products.getAll((err, products) => {
        if (err) res.send(err);
        else res.status(200).json(products);
    });
});

router.post('/', (req, res) => {
    database.products.add(req.body, (err, info) => {
      if (err) res.send(err);
      else res.status(200).json(info);
    });
});

router.get('/:id', (req, res) => {
    database.products.findById(req.params.id, (err, product) => {
        if (err) res.send(err);
        else res.status(200).json(product);
    });
});

router.put('/:id', (req, res) => {
    database.products.update(req.params.id, req.body, (err, info) => {
        if (err) res.send(err);
        else res.status(200).json(info);
    });
});

router.delete('/:id', (req, res) => {
    database.products.delete(req.params.id, (err, info) => {
        if (err) res.send(err);
        else res.status(200).json(info);
    });
});

module.exports = router;
