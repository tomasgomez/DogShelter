// server.js: composition root
global.database = require("./database");
const app = require("./app");

database.removeAllDatabases(destroyDbReqs => {
    Promise.all(destroyDbReqs).then(values => {
        console.log("all databases were removed.");
        database.createDatabases(true);
    });
});

// Listen for requests on port 3000
app.listen(3000, () => {
    console.log('Web server is now listening at http://localhost:3000');
});