// server.js: composition root
global.database = require("./database");
const app = require("./app");

database.createDatabases(true);
// database.removeAllDatabases();

// Listen for requests on port 3000
app.listen(3000, () => {
    console.log('Web server is now listening at http://localhost:3000');
});