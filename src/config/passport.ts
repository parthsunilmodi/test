import passport from "passport";
import passportLocal from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import * as secrets from "../util/secrets";

import { User, UserDocument } from "../models/User";

const LocalStrategy = passportLocal.Strategy;

passport.serializeUser<any, any>((user, done: any) => {
  done(undefined, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err: any, user: UserDocument | null) => {
    done(err, user);
  });
});


/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
  User.findOne({ email: email.toLowerCase() }, (err: any, user: any) => {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(undefined, false, { message: `Email ${ email } not found.` });
    }
    user.comparePassword(password, (err: Error, isMatch: boolean) => {
      if (err) {
        return done(err);
      }
      if (isMatch) {
        return done(undefined, user);
      }
      return done(undefined, false, { message: "Invalid email or password." });
    });
  });
}));


/**
 * Sign in using JWT Token
 * For API access only
 */
passport.use("jwt", new JwtStrategy({
    secretOrKey: secrets.JWT_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
  },
  async (token, done) => {
    try {
      return done(null, token.user);
    } catch (err) {
      done(err);
    }
  }));
