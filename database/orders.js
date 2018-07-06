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
            orders = orders.filter(order => order._id !== "_design/docs");
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
    productLine["salePrice"] = parseFloat(productLine["salePrice"]);
    productLine["quantity"] = parseInt(productLine["quantity"]);

    database.nano.use("ds_order_product_lines").insert(productLine, (err, body) => {
        if (err) cb(err);
        else cb(null, body.id);
    });
}

exports.insertServiceLine = (orderId, serviceLine, cb) => {
    serviceLine["orderID"] = orderId;
    serviceLine["salePrice"] = parseFloat(serviceLine["salePrice"]);
    database.nano.use("ds_order_service_lines").insert(serviceLine, (err, body) => {
        if (err) cb(err);
        else cb(null, body.id);
    });
}

exports.getOrderProductLine = (id, cb) => {
    database.nano.use("ds_order_product_lines").view("docs", "by_orderID", {
        "keys": [id]
    }, (err, body) => {
        if (err) cb(err);
        else {
            let orderPLs = body.rows.map(orderPL => {
                return orderPL.value;
            });
            orderPLs = orderPLs.filter(orderPL => orderPL._id !== "_design/docs");
            cb(null, orderPLs);
        }
    });
}

exports.getOrderServiceLine = (id, cb) => {
    database.nano.use("ds_order_service_lines").view("docs", "by_orderID", {
        "keys": [id]
    }, (err, body) => {
        if (err) cb(err);
        else {
            let orderSLs = body.rows.map(orderSL => {
                return orderSL.value;
            });
            orderSLs = orderSLs.filter(orderSL => orderSL._id !== "_design/docs");
            cb(null, orderSLs);
        }
    });
}