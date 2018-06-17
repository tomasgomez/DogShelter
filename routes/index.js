const routes = require('express').Router();
const products = require('./products');

module.exports = function Routes(app, database) {
    //  Connect all our routes to our application
    app.use('/', routes);

    routes.get('/', (req, res) => {
        res.sendFile(__dirname + '/../public/index.html'); // load the single view file
    });

    routes.use('/products', products);
};