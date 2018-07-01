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
            database.users.findById(decoded.id, (err, user) => {
                if (err) done(err, false);
                else done(null, user.password);
            });
        }
    },
    (jwtPayload, cb) => {
        database.users.findById(jwtPayload.id, (err, user) => {
            if (err) return cb(err, false);
            return cb(null, user);
        });
    }
));

passport.use(new LocalStrategy((username, password, cb) => {
    database.users.findByEmail(username, (err, user) => {
        if (err) return cb(err);
        if (user.password === password)
            return cb(null, user);
        return cb(null, false);
    });
}));