// server.js: composition root
const App = require("./app");
const Database = require("./database");
const Routes = require("./routes");
const dbConfig = require("./database/dbconfig.json");

const app = App();
global.database = Database(dbConfig);
Routes(app, database);

// Listen for requests on port 3000
app.listen(3000, () => {
    console.log('Web server is now listening at http://localhost:3000');
});