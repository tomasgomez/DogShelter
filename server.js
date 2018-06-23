// server.js: composition root
const Database = require("./database");
const dbConfig = require("./database/dbconfig.json");
const app = require("./app");

global.database = Database(dbConfig);

// Listen for requests on port 3000
app.listen(3000, () => {
    console.log('Web server is now listening at http://localhost:3000');
});