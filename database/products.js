exports.findById = (id, cb) => {
    database.nano.use('ds_products').get(id, (err, body) => {
        if (err) cb(err);
        else cb(null, body);
    });
}

exports.getAll = (cb) => {
    database.nano.use('ds_products').list({
        include_docs: true
    }, (err, body) => {
        if (err) cb(err);
        else {
            let products = body.rows.map(product => {
                return product.doc;
            });
            cb(null, products);
        }
    });
}

exports.update = (productId, newData, cb) => {
    let updatedProduct = newData;
    updatedProduct["_id"] = productId;

    database.nano.use("ds_products").insert(updatedProduct, (err, body) => {
        if (err) cb(err);
        else cb(null, body);
    });
}