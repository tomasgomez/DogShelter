const Express = require('express');
const CookieParser = require('cookie-parser');
const BodyParser = require('body-parser');

module.exports = function App() {
    // Create a new Express application.
    const app = Express();

    // Configure view engine to render EJS templates.
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');

    // Use application-level middleware for common functionality
    app.use(CookieParser());
    app.use(BodyParser.urlencoded({
        extended: true
    }));

    app.use(Express.static(__dirname + '/public'));

    return app;
};