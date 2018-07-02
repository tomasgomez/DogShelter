exports.findById = (id, cb) => {
    database.nano.use('ds_orders').get(id, (err, body) => {
        if (err) cb(err);
        else cb(null, body);
    });
}

exports.getAll = (cb) => {
    database.nano.use('ds_orders').list({
        include_docs: true
    }, (err, body) => {
        if (err) cb(err);
        else {
            let orders = body.rows.map(order => {
                return order.doc;
            });
            cb(null, orders);
        }
    });
}

exports.add = (orderData, cb) => {
    database.nano.use("ds_orders").insert(orderData, (err, body) => {
        if (err) cb(err);
        else cb(null, body.id);
    });
}

exports.insertProductLine = (orderId, productLine, cb) => {
    productLine["orderID"] = orderId;
    database.nano.use("ds_order_product_lines").insert(productLine, (err, body) => {
        if (err) cb(err);
        else cb(null, body.id);
    });
}

exports.insertServiceLine = (orderId, serviceLine, cb) => {
    serviceLine["orderID"] = orderId;
    database.nano.use("ds_order_service_lines").insert(serviceLine, (err, body) => {
        if (err) cb(err);
        else cb(null, body.id);
    });
}