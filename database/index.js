// Require needed modules
const config = require("./dbconfig.json");
const auth = config.auth.user + ":" + config.auth.pass;
const nano = require("nano")("http://" + auth + "@localhost:5984");
const Promise = require("bluebird");

function createDatabases(insertTestData) {
    if (insertTestData) docSets = require("./testdata.json").docSets;

    let dbNames = [
        "ds_users",
        "ds_services",
        "ds_products",
        "ds_pets",
        "ds_orders",
        "ds_order_product_lines",
        "ds_order_service_lines",
        "ds_service_time_slots"
    ];

    let createDatabaseAsync = Promise.promisify(nano.db.create);
    let requests = [];

    database.nano.db.list((err, dbs) => {
        for (dbName of dbNames) {
            (dbName => {
                if (dbs.indexOf(dbName) === -1) {
                    let dbCreationReq = createDatabaseAsync(dbName);
                    let req = {};
                    req["dbName"] = dbName;
                    req["createDb"] = dbCreationReq;
                    dbCreationReq.then(() => {
                        if (docSets) {
                            let DSDocSets = docSets.filter(prop => {
                                return prop.dbName === dbName;
                            });
                            if (DSDocSets.length > 0) {
                                let createDocAsync = Promise.promisify(
                                    database.nano.use(dbName).insert
                                );
                                req["createDocs"] = [];
                                for (doc of DSDocSets[0].data) {
                                    req["createDocs"].push(createDocAsync(doc));
                                }
                            }
                        }
                    });
                    requests.push(req);
                }
            })(dbName);
        }

        let createDbsReqs = requests.map(req => {
            return req.createDb;
        });

        // replaceIDs(requests);

        Promise.all(createDbsReqs).then(() => {
            console.log("all databases were already created");
            createViews();
        });
    });
}

function createViews() {
    // Create index for emails of users
    database.nano.use("ds_users").insert({
            views: {
                by_email: {
                    map: function (doc) {
                        emit(doc.email, doc);
                    }
                }
            }
        },
        "_design/docs"
    );

    // Create index for serviceID of 'service-time-slots'
    database.nano.use("ds_service_time_slots").insert({
            views: {
                by_serviceID: {
                    map: function (doc) {
                        emit(doc.serviceID, doc);
                    }
                }
            }
        },
        "_design/docs"
    );

    // Create index for userID of 'pets'
    database.nano.use("ds_pets").insert({
            views: {
                by_userID: {
                    map: function (doc) {
                        emit(doc.userID, doc);
                    }
                }
            }
        },
        "_design/docs"
    );
}

function replaceIDs(requests) {
    // In store "ds_pets": replace user IDs
    let usersReq = requests.filter(req => {
        return req.dbName === "ds_users";
    });
    let petsReq = requests.filter(req => {
        return req.dbName === "ds_pets";
    });
    usersReq[0].createDb.then(() => {
        Promise.all(usersReq[0].createDocs).then(() => {
            let users = usersReq[0].createDocs
            petsReq[0].createDb.then(() => {
                Promise.all(petsReq[0].createDocs).then(() => {
                    database.nano.use("ds_pets").list({
                        include_docs: true
                    }, (err, result) => {
                        let pets = result.rows.map(pet => {
                            return pet.doc;
                        })
                        console.log("(replaceIDs) err1 = " + err);
                        console.log("(replaceIDs) pets = " + JSON.stringify(pets));
                        console.log("(replaceIDs) users = " + JSON.stringify(users));
                        if (!err) {
                            for (pet of pets) {
                                console.log("pet.userID = " + pet.userID);
                                console.log("users[pet.userID] = " + users[pet.userID]);
                                console.log("type = " + typeof (users[pet.userID]));
                                console.log("fulfillmentValue = " + JSON.stringify(users[pet.userID].fulfillmentValue));
                                users[pet.userID].then(userInfo => {
                                    console.log("userInfo = " + JSON.stringify(userInfo));
                                    pet.userID = userInfo.id;
                                    database.nano.use("ds_pets").insert(pet, (err, body) => {
                                        console.log("(replaceIDs) err3 = " + err);
                                        console.log("(replaceIDs) body = " + body);
                                    });
                                });
                            }
                        }
                    });
                });
            });
        });
    });
}

function removeAllDatabases() {
    database.nano.db.list((err, body) => {
        dsDbNames = body.filter(dbName => {
            return dbName.search("ds_") === 0;
        });

        for (dsDbName of dsDbNames) {
            database.nano.db.destroy(dsDbName, (err, body) => {
                if (!err)
                    console.log("Success while removing all Dog Shelter databases.");
                else console.log("err = " + err);
            });
        }
    });
}

exports.createDatabases = createDatabases;
exports.removeAllDatabases = removeAllDatabases;
exports.nano = nano;

exports.users = require("./users");
exports.products = require("./products");
exports.services = require("./services");
exports.orders = require("./orders");