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
    database.nano.use("ds_service_time_slots").view("docs", "by_serviceID", {
        "keys": [id]
    }, (err, body) => {
        if (err) cb(err);
        else {
            let timeSlots = body.rows.map((timeSlot) => {
                return timeSlot.value;
            });
            cb(null, timeSlots);
        }
    });
}

exports.getTimeSlotOfId = (id, cb) => {
    database.nano.use("ds_service_time_slots").get(id, (err, body) => {
        if (err) cb(err);
        else cb(null, body);
    });
}

exports.updateTimeSlot = (timeSlotId, newData, cb) => {
    let updatedTimeSlot = newData;
    updatedTimeSlot["_id"] = timeSlotId;

    database.nano.use("ds_service_time_slots").insert(updatedTimeSlot, (err, body) => {
        if (err) cb(err);
        else cb(null, body);
    });
}