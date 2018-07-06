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

exports.add = (newData, cb) => {
    database.nano.use("ds_services").insert(newData, (err, body) => {
        if (err) cb(err);
        else cb(null, body);
    });
}

exports.update = (serviceId, newData, cb) => {
    database.nano.use("ds_services").get(serviceId, (err, body) => {
        if (err) cb(err);
        else {
            let updatedService = newData;
            updatedService["_id"] = serviceId;
            updatedService["_rev"] = body._rev;

            database.nano.use("ds_services").insert(updatedService, (err, body) => {
                if (err) cb(err);
                else cb(null, body);
            });
        };
    });
}

exports.delete = (serviceId, cb) => {
    database.nano.use("ds_services").get(serviceId, (err, body) => {
        if (err) cb(err);
        else {
            database.nano.use("ds_services").destroy(serviceId, body._rev, (err, body) => {
                if (err) cb(err);
                else cb(null, body);
            });
        };
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

exports.deleteTimeSlots = (id, timeSlotsData, cb) => {
    let timeSlots = JSON.parse(timeSlotsData.timeSlots);
    for (timeSlot of timeSlots) {
        database.nano.use("ds_service_time_slots").destroy(timeSlot._id, timeSlot._rev, (err, body) => {
            if (err) cb(err);
            else cb(null, body);
        });
    }
}

exports.getTimeSlotOfId = (id, cb) => {
    database.nano.use("ds_service_time_slots").get(id, (err, body) => {
        if (err) cb(err);
        else cb(null, body);
    });
}

exports.updateTimeSlot = (serviceId, newData, cb) => {
    let updatedTimeSlot = newData;
    if (newData.orderServiceLineID === "")
        updatedTimeSlot["orderServiceLineID"] = null;
    updatedTimeSlot["serviceID"] = serviceId;

    database.nano.use("ds_service_time_slots").insert(updatedTimeSlot, (err, body) => {
        if (err) cb(err);
        else cb(null, body);
    });
}

exports.deleteTimeSlot = (timeSlotId, cb) => {
    database.nano.use("ds_service_time_slots").get(timeSlotId, (err, body) => {
        if (err) cb(err);
        else {
            database.nano.use("ds_service_time_slots").destroy(timeSlotId, body._rev, (err, body) => {
                if (err) cb(err);
                else cb(null, body);
            });
        };
    });
}