// Require needed modules
const config = require("./dbconfig.json");
const Promise = require("bluebird");
const auth = config.auth.user + ":" + config.auth.pass;
let nano;
if (auth && auth.user !== "" && auth.pass !== "")
    nano = require("nano")("http://" + auth + "@localhost:5984");
else
    nano = require("nano")("http://localhost:5984");

function createDatabases(insertTestData) {
    if (insertTestData)
        docSets = require("./testdata.json").docSets;

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
                    let req = {};
                    req["dbName"] = dbName;
                    req["createDb"] = createDatabaseAsync(dbName);
                    requests.push(req);
                }
            })(dbName);
        }

        // Check when all databases are created
        let createDbsReqs = requests.map(req => {
            return req.createDb;
        });
        Promise.all(createDbsReqs).then(() => {
            console.log("all databases were created");
            createViews();
        });

        // Insert documents in the databases
        if (docSets)
            insertDocs(requests, docSets);
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

function insertDocs(requests, docSets) {
    // Insert docs in 'USERS' database
    let usersReq = requests.find(req => req.dbName === "ds_users");
    let usersDocSets = docSets.find(docSet => docSet.dbName === "ds_users");
    let createUserAsync = Promise.promisify(database.nano.use("ds_users").insert);
    if (usersDocSets) {
        usersReq.createDb.then(() => {
            let createDocsReqs = [];
            for (user of usersDocSets.data) {
                createDocsReqs.push(createUserAsync(user));
            }
            usersReq["createDocs"] = createDocsReqs;
        });
    }

    // Insert docs in 'SERVICES' database
    let servicesReq = requests.find(req => req.dbName === "ds_services");
    let servicesDocSets = docSets.find(docSet => docSet.dbName === "ds_services");
    let createServiceAsync = Promise.promisify(database.nano.use("ds_services").insert);
    if (servicesDocSets) {
        servicesReq.createDb.then(() => {
            let createDocsReqs = [];
            for (service of servicesDocSets.data) {
                createDocsReqs.push(createServiceAsync(service));
            }
            servicesReq["createDocs"] = createDocsReqs;
        });
    }

    // Insert docs in 'PRODUCTS' database
    let productsReq = requests.find(req => req.dbName === "ds_products");
    let productsDocSets = docSets.find(docSet => docSet.dbName === "ds_products");
    let createProductAsync = Promise.promisify(database.nano.use("ds_products").insert);
    if (productsDocSets) {
        productsReq.createDb.then(() => {
            let createDocsReqs = [];
            for (product of productsDocSets.data) {
                createDocsReqs.push(createProductAsync(product));
            }
            productsReq["createDocs"] = createDocsReqs;
        });
    }

    // Insert docs in 'PETS' database
    let petsReq = requests.find(req => req.dbName === "ds_pets");
    let petsDocSets = docSets.find(docSet => docSet.dbName === "ds_pets");
    let createPetAsync = Promise.promisify(database.nano.use("ds_pets").insert);
    if (petsDocSets) {
        petsReq.createDb.then(() => {
            setTimeout(() => {
                let createDocsReqs = [];
                for (pet of petsDocSets.data) {
                    let userID = pet.userID;
                    let userCreationReq = usersReq.createDocs[userID];
                    ((pet) => {
                        userCreationReq.then(user => {
                            pet.userID = user.id;
                            createDocsReqs.push(createPetAsync(pet));
                        });
                    })(pet);
                }
                petsReq["createDocs"] = createDocsReqs;
            }, 2000);
        });
    }

    // Insert docs in 'ORDERS' database
    let ordersReq = requests.find(req => req.dbName === "ds_orders");
    let ordersDocSets = docSets.find(docSet => docSet.dbName === "ds_orders");
    let createOrderAsync = Promise.promisify(database.nano.use("ds_orders").insert);
    if (ordersDocSets) {
        ordersReq.createDb.then(() => {
            setTimeout(() => {
                let createDocsReqs = [];
                for (order of ordersDocSets.data) {
                    let userID = order.userID;
                    let userCreationReq = usersReq.createDocs[userID];
                    ((order) => {
                        userCreationReq.then(user => {
                            order.userID = user.id;
                            createDocsReqs.push(createOrderAsync(order));
                        });
                    })(order);
                }
                ordersReq["createDocs"] = createDocsReqs;
            }, 2000);
        });
    }

    // Insert docs in 'ORDER-PRODUCT-LINES' database
    let orderPLsReq = requests.find(req => req.dbName === "ds_order_product_lines");
    let orderPLsDocSets = docSets.find(docSet => docSet.dbName === "ds_order_product_lines");
    let createOrderPLAsync = Promise.promisify(database.nano.use("ds_order_product_lines").insert);
    if (orderPLsDocSets) {
        orderPLsReq.createDb.then(() => {
            setTimeout(() => {
                let createDocsReqs = [];
                for (orderPL of orderPLsDocSets.data) {
                    let orderProductCreationReqs = [
                        ordersReq.createDocs[orderPL.orderID],
                        productsReq.createDocs[orderPL.productID]
                    ];
                    ((orderPL) => {
                        Promise.all(orderProductCreationReqs).then(values => {
                            orderPL.orderID = values[0].id;
                            orderPL.productID = values[1].id;
                            createDocsReqs.push(createOrderPLAsync(orderPL));
                        });
                    })(orderPL);
                }
                orderPLsReq["createDocs"] = createDocsReqs;
            }, 5000);
        });
    }

    // Insert docs in 'ORDER-SERVICE-LINES' database
    let orderSLsReq = requests.find(req => req.dbName === "ds_order_service_lines");
    let orderSLsDocSets = docSets.find(docSet => docSet.dbName === "ds_order_service_lines");
    let createOrderSLAsync = Promise.promisify(database.nano.use("ds_order_service_lines").insert);
    if (orderSLsDocSets) {
        orderSLsReq.createDb.then(() => {
            setTimeout(() => {
                let createDocsReqs = [];
                for (orderSL of orderSLsDocSets.data) {
                    let orderServiceCreationReqs = [
                        ordersReq.createDocs[orderSL.orderID],
                        servicesReq.createDocs[orderSL.serviceID]
                    ];
                    ((orderSL) => {
                        Promise.all(orderServiceCreationReqs).then(values => {
                            orderSL.orderID = values[0].id;
                            orderSL.serviceID = values[1].id;
                            createDocsReqs.push(createOrderSLAsync(orderSL));
                        });
                    })(orderSL);
                }
                orderSLsReq["createDocs"] = createDocsReqs;
            }, 5000);
        });
    }

    // Insert docs in 'SERVICE-TIME-SLOTS' database
    let serviceTSsReq = requests.find(req => req.dbName === "ds_service_time_slots");
    let serviceTSsDocSets = docSets.find(docSet => docSet.dbName === "ds_service_time_slots");
    let createServiceTSAsync = Promise.promisify(database.nano.use("ds_service_time_slots").insert);
    if (serviceTSsDocSets) {
        serviceTSsReq.createDb.then(() => {
            setTimeout(() => {
                let createDocsReqs = [];
                for (serviceTS of serviceTSsDocSets.data) {
                    let orderServiceLineID = serviceTS.orderServiceLineID;
                    let SLDocCreationReq = (orderServiceLineID ? orderServiceLineID : null);
                    let serviceOrderSLCreationReqs = [
                        servicesReq.createDocs[serviceTS.serviceID],
                        SLDocCreationReq
                    ];
                    ((serviceTS) => {
                        Promise.all(serviceOrderSLCreationReqs).then(values => {
                            serviceTS.serviceID = values[0].id;
                            serviceTS.orderServiceLineID = (values[1] ? values[1].id : null);
                            createDocsReqs.push(createServiceTSAsync(serviceTS));
                        });
                    })(serviceTS);
                }
                serviceTSsReq["createDocs"] = createDocsReqs;
            }, 10000);
        });
    }
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