const passport = require("passport");
const passportJWT = require("passport-jwt");
const ExtractJWT = passportJWT.ExtractJwt;

const jwt_decode = require("jwt-decode");

const LocalStrategy = require("passport-local").Strategy;
const JWTStrategy = passportJWT.Strategy;

passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKeyProvider: (request, rawJwtToken, done) => {
            let decoded = jwt_decode(rawJwtToken);
            database.get('ds_users', decoded.id).then((user) => {
                done(null, user.data.password);
            }).catch(err => {
                done(err, false);
            });
        }
    },
    (jwtPayload, cb) => {
        database.get('ds_users', jwtPayload.id).then(user => {
            return cb(null, user.data);
        }).catch(err => {
            return cb(err, false);
        });
    }
));

passport.use(new LocalStrategy((username, password, cb) => {
    database.get('ds_users', '_all_docs').then(({
        data,
        headers,
        status
    }) => {
        let users = data.rows;
        let req = [];
        let i = 0;
        for (user of users) {
            req[i] = database.get('ds_users', user.id);
            i += 1;
        }
        Promise.all(req).then((values) => {
            let found = false;
            for (value of values) {
                if (value.data.email === username && value.data.password === password) {
                    return cb(null, value.data, {
                        message: 'Logged In Successfully'
                    });
                    found = true;
                }
            }
            if (!found) {
                return cb(null, false, {
                    message: 'Incorrect email or password.'
                });
            }
        }).catch(err => {
            return cb(err);
        });;
    });
}));