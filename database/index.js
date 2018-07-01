// Require needed modules
const config = require("./dbconfig.json");
const auth = config.auth.user + ":" + config.auth.pass;
var nano = require('nano')("http://" + auth + "@localhost:5984");
var Promise = require('bluebird');
let createDatabaseAsync = Promise.promisify(nano.db.create);

function createDatabases(insertTestData) {
    let docSets = null;
    if (insertTestData)
        docSets = require("./testdata.json").docSets;
    let couch = database.couch;
    let createReqs = [];

    dbNames = [
        "ds_users",
        "ds_pets",
        "ds_orders",
        "ds_order_service_lines",
        "ds_order_product_lines",
        "ds_services",
        "ds_service_time_slots",
        "ds_products"
    ];

    database.nano.db.list((err, dbs) => {
        for (dbName of dbNames) {
            ((dbName) => {
                if (dbs.indexOf(dbName) === -1) {
                    let createReq = createDatabaseAsync(dbName);
                    createReq.then(() => {
                        if (docSets) {
                            let DSDocSets = docSets.filter((prop) => {
                                return prop.dbName === dbName;
                            });
                            if (DSDocSets.length > 0) {
                                for (doc of DSDocSets[0].data) {
                                    database.nano.use(dbName).insert(doc);
                                }
                            }
                        }
                    });
                    createReqs.push(createReq);
                }
            })(dbName);
        }
        Promise.all(createReqs).then(() => {
            // console.log("all databases were already created");
            createViews();
        })
    });
}

function createViews() {
    // Create index for emails of users
    database.nano.use("ds_users").insert({
        "views": {
            "by_email": {
                "map": function (doc) {
                    emit(doc.email, doc);
                }
            }
        }
    }, '_design/docs');
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
                else
                    console.log("err = " + err);
            });
        }
    });
}

// exports.login = login;
exports.createDatabases = createDatabases;
exports.removeAllDatabases = removeAllDatabases;
exports.nano = nano;

exports.users = require('./users');
exports.products = require('./products');
exports.services = require('./services');