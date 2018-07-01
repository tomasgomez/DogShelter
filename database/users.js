exports.add = (userData, cb) => {
    userData["role"] = "client";

    database.nano.use("ds_users").insert(userData, (err, body) => {
        if (err) cb(err);
        else cb(null);
    });
}

exports.findById = (id, cb) => {
    database.nano.use("ds_users").get(id, (err, body) => {
        if (err) cb(err);
        else cb(null, body);
    });
}

exports.findByEmail = (email, cb) => {
    database.nano.use("ds_users").view("docs", "by_email", {
        "keys": [email]
    }, (err, body) => {
        if (err) cb(err);
        else cb(null, body.rows[0].value);
    });
}

exports.getAll = (cb) => {
    database.nano.use('ds_users').list({
        include_docs: true
    }, (err, body) => {
        if (err) cb(err);
        else {
            let users = body.rows.map(user => {
                return user.doc;
            });
            cb(null, users);
        }
    });
}