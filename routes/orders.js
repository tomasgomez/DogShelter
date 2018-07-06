const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    database.orders.add(req.body, (err, orderID) => {
        if (err) res.send(err);
        else res.status(200).json({
            orderID: orderID
        });
    });
});

router.get('/', (req, res) => {
    database.orders.getAll((err, orders) => {
        if (err) res.send(err);
        else res.status(200).json(orders);
    });
});

router.get('/:id', (req, res) => {
    database.orders.findById(req.params.id, (err, order) => {
        if (err) res.send(err);
        else res.status(200).json(order);
    });
});

router.get('/:id/products', (req, res) => {
    database.orders.getOrderProductLine(req.params.id, (err, products) => {
        if (err) res.send(err);
        else res.status(200).json(products);
    });
});

router.get('/:id/services', (req, res) => {
    database.orders.getOrderServiceLine(req.params.id, (err, services) => {
        if (err) res.send(err);
        else res.status(200).json(services);
    });
});

router.post('/:id/products', (req, res) => {
    database.orders.insertProductLine(req.params.id, req.body, (err, productLineId) => {
        if (err) res.send(err);
        else res.status(200).json({
            orderProductLineID: productLineId
        });
    });
});

router.post('/:id/services', (req, res) => {
    database.orders.insertServiceLine(req.params.id, req.body, (err, serviceLineId) => {
        if (err) res.send(err);
        else res.status(200).json({
            orderServiceLineID: serviceLineId
        });
    });
});

module.exports = router;
