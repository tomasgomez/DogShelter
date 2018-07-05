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

exports.add = (newData, cb) => {
    database.nano.use("ds_products").insert(newData, (err, body) => {
        if (err) cb(err);
        else cb(null, body);
    });
}

exports.update = (productId, newData, cb) => {
    database.nano.use("ds_products").get(productId, (err, body) => {
      if (err) cb(err);
      else {
          let updatedProduct = newData;
          updatedProduct["_id"] = productId;
          updatedProduct["_rev"] = body._rev;

          database.nano.use("ds_products").insert(updatedProduct, (err, body) => {
              if (err) cb(err);
              else cb(null, body);
          });
      };
    });
}

exports.delete = (productId, cb) => {
  database.nano.use("ds_products").get(productId, (err, body) => {
    if (err) cb(err);
    else {
        database.nano.use("ds_products").destroy(productId, body._rev, (err, body) => {
            if (err) cb(err);
            else cb(null, body);
        });
    };
  });
}
