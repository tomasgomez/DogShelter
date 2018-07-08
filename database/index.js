// Require needed modules
const config = require("./dbconfig.json");
const Promise = require("bluebird");
const auth = config.auth.user + ":" + config.auth.pass;
let nano;
if (config && config.auth.user !== "" && config.auth.pass !== "") {
  nano = require("nano")("http://" + auth + "@localhost:5984");
} else {
  nano = require("nano")("http://localhost:5984");
}

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

  let createReqs = [];
  let createDatabaseAsync = Promise.promisify(nano.db.create);
  database.nano.db.list((err, dbs) => {
    if (dbs) {
      for (dbName of dbNames) {
        (dbName => {
          if (dbs.indexOf(dbName) === -1) {
            let createReq = createDatabaseAsync(dbName);
            createReq.then(() => {
              if (docSets) {
                let dbNameDocSets = docSets.find(x => x.dbName === dbName);
                if (dbNameDocSets) {
                  for (doc of dbNameDocSets.data) {
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
        console.log("all databases were created");
        createViews();
      });
    } else {
      console.log("");
      console.log("(ERROR) Looks like CouchDB isn't configured correctly. Have you started CouchDB? Have you configured authentication in the 'database/dbconfig.json' file?");
    }
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

  // Create index for userID of 'orders'
  database.nano.use("ds_orders").insert({
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

  // Create index for orderID of 'order-service-lines'
  database.nano.use("ds_order_service_lines").insert({
      views: {
        by_orderID: {
          map: function (doc) {
            emit(doc.orderID, doc);
          }
        }
      }
    },
    "_design/docs"
  );

  // Create index for orderID of 'order-product-lines'
  database.nano.use("ds_order_product_lines").insert({
      views: {
        by_orderID: {
          map: function (doc) {
            emit(doc.orderID, doc);
          }
        }
      }
    },
    "_design/docs"
  );
}

function removeAllDatabases(cb) {
  let destroyDbReqs = [];
  database.nano.db.list((err, body) => {
    if (body) {
      dsDbNames = body.filter(dbName => {
        return dbName.search("ds_") === 0;
      });

      for (dsDbName of dsDbNames) {
        let dbDestroyAsync = Promise.promisify(nano.db.destroy);
        destroyDbReqs.push(dbDestroyAsync(dsDbName));
      }

      cb(destroyDbReqs);
    } else {
      console.log("");
      console.log("(ERROR) Looks like CouchDB isn't configured correctly. Have you started CouchDB? Have you configured authentication in the 'database/dbconfig.json' file?");
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