// Require needed modules
const NodeCouchDb = require('node-couchdb');
const testData = require("./testdata.json");

// Export 'database modules'
// exports.users = require('./users');;

module.exports = function Database(configuration) {
    // Construct 'node-couchdb'
    const couch = new NodeCouchDb(configuration);

    // Create all needed databases and insert some test data
    //  If you don't want to insert this test data, just remove
    //  'testData.docSets' or pass null as 2nd parameter.
    createDatabases(couch, testData.docSets);

    // TODO: add 'admin' user to the database as default

    return couch;
};

function createDatabases(couch, docSets) {
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

    couch.listDatabases().then(
        (dbs) => {
            for (dbName of dbNames) {
                ((dbName) => {
                    if (dbs.indexOf(dbName) === -1) {
                        couch.createDatabase(dbName).then(() => {
                            console.log("Created '" + dbName + "' database.");
                            if (docSets !== undefined && docSets != null) {
                                putAll(couch, dbName, docSets.filter((prop) => {
                                    return prop.dbName == dbName;
                                })[0].data);
                            }
                        }, (err) => {
                            console.log(err);
                        });
                    }
                })(dbName);
            }
        }, (err) => {
            console.log(err);
        });
}

function putAll(couch, dbName, docSet) {
    couch.uniqid(docSet.length).then((ids) => {
        let i = 0;
        for (doc of docSet) {
            doc["_id"] = ids[i];

            couch.insert(dbName, doc);

            i += 1;
        }
    });
}