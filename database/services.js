exports.findById = (id, cb) => {
    database.nano.use("ds_services").get(id, (err, body) => {
        if (err) cb(err);
        else cb(null, body);
    });
}

exports.getAll = (cb) => {
    database.nano.use("ds_services").list({
        include_docs: true
    }, (err, body) => {
        if (err) cb(err);
        else {
            let services = body.rows.map((service) => {
                return service.doc;
            });
            cb(null, services);
        }
    });
}

exports.getTimeSlots = (id, cb) => {
    database.nano.use("ds_service_time_slots").list({
        include_docs: true
    }, (err, body) => {
        if (err) cb(err);
        else {
            let services = body.rows.reduce((acc, curr) => {
                if (curr.doc.serviceID === parseInt(id)) {
                    acc.push(curr.doc);
                }
                return acc;
            }, []);
            cb(null, services);
        }
    });
}