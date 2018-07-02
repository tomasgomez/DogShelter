const express = require('express');
const router = express.Router();

/* GET products listing. */
router.get('/', (req, res) => {
    database.products.getAll((err, products) => {
        if (err) res.send(err);
        else res.status(200).json(products);
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

// DELETE '/products/:id'
// router.delete('/:id', (req, res) => {
//     let bearer = req.get("Authorization");
//     let token = bearer.split(" ")[1];
//     let data = jwt_decode(token);

//     // verificar se o usuário é admin
//     database.users.verifyAdmin(data.id, (err, bool) => {
//         if (bool) {
//             database.products.delete(req.params.id, (err, info) => {
//                 if (err) res.send(err);
//                 else res.status(200).json(info);
//             });
//         } else {
//             res.status(401).end();
//         }
//     });
// });

module.exports = router;