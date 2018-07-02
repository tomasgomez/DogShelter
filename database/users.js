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

// PETs
exports.getPetById = (petId, cb) => {
    database.nano.use("ds_pets").get(petId, (err, body) => {
        if (err) cb(err);
        else cb(null, body);
    });
}

exports.getPets = (userId, cb) => {
    database.nano.use("ds_pets").view("docs", "by_userID", {
        "keys": [userId] // parseInt()?
    }, (err, body) => {
        if (err) cb(err);
        else {
            let pets = body.rows.map(pet => {
                return pet.value;
            });
            cb(null, pets);
        }
    });
}

exports.addPet = (userId, petData, cb) => {
    petData["userID"] = userId;
    database.nano.use("ds_pets").insert(petData, (err, body) => {
        if (err) cb(err);
        else cb(null, body);
    });
}

exports.updatePet = (petId, newData, cb) => {
    database.nano.use("ds_pets").get(petId, (err, body) => {
        if (err) cb(err);
        else {
            newData["_id"] = petId;
            newData["_rev"] = body._rev;
            database.nano.use("ds_pets").insert(newData, (err, body) => {
                if (err) cb(err);
                else cb(null, body);
            })
        }
    });
}

exports.deletePet = (petId, cb) => {
    database.nano.use("ds_pets").get(petId, (err, body) => {
        if (err) cb(err);
        else {
            database.nano.use("ds_pets").destroy(petId, body._rev, (err, body) => {
                if (err) cb(err);
                else cb(null, body);
            })
        }
    });
}