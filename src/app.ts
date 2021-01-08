import express from "express";
import compression from "compression";  // compresses requests
import session from "express-session";
import bodyParser from "body-parser";
import lusca from "lusca";
import mongo from "connect-mongo";
import flash from "express-flash";
import path from "path";
import mongoose from "mongoose";
import passport from "passport";
import bluebird from "bluebird";
import { MONGODB_URI, SESSION_SECRET } from "./util/secrets";

const MongoStore = mongo(session);

// Controllers (route handlers)
import * as appController from "./controllers/app";
import * as userController from "./controllers/user";
import * as apiController from "./controllers/asset";
import * as contactController from "./controllers/contact";


// API keys and Passport configuration
import * as passportConfig from "./config/passport";

// Create Express server
const app = express();

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
mongoose.Promise = bluebird;

mongoose.connect(mongoUrl, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true } ).then(
    () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
).catch(err => {
    console.log(`MongoDB connection error. Please make sure MongoDB is running. ${err}`);
    // process.exit();
});

// Express configuration
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: SESSION_SECRET,
    store: new MongoStore({
        url: mongoUrl,
        autoReconnect: true
    })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});
app.use((req, res, next) => {
    // After successful login, redirect back to the intended page
    if (!req.user &&
    req.path !== "/login" &&
    req.path !== "/signup" &&
    !req.path.match(/^\/auth/) &&
    !req.path.match(/\./)) {
        req.session.returnTo = req.path;
    } else if (req.user &&
    req.path == "/account") {
        req.session.returnTo = req.path;
    }
    next();
});

app.use(
    express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);



/**
 * Primary Server-Side App Routes.
 * This is for the server generated views
 */

app.get("/", appController.index); //TODO: need to pull config to know which Categories to show in NavBar // TODO: Add authentication and show home page for this application.  show homePage actions or document

app.get("/login", userController.getLogin);
app.post("/login", userController.postLogin);

app.get("/logout", userController.logout);

app.get("/forgot", userController.getForgot);
app.post("/forgot", userController.postForgot);

app.get("/reset/:token", userController.getReset);
app.post("/reset/:token", userController.postReset);

app.get("/signup", userController.getSignup);
app.post("/signup", userController.postSignup);


// ADMIN dashboard
app.get("/dashboard/admin", appController.adminDashboard);

app.get("/account", passportConfig.isAuthenticated, userController.getAccount);
app.post("/account/profile", passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post("/account/password", passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post("/account/delete", passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get("/account/unlink/:provider", passportConfig.isAuthenticated, userController.getOauthUnlink);

/**
 * API Routes
 */
app.post("/api/v1/login", userController.postLogin);

// GET all assets
app.get("/api/v1/assets/", apiController.getAll); 
// GET a single asset by id
// passport.authenticate('jwt', { session: false })
app.get("/api/v1/assets/:id", apiController.getById);
app.post("/api/v1/assets/", apiController.postAsset);

/** Admin api routes */
app.get("/api/v1/assets/admin/getAdmin", function (req, res) {
    res.json({
        assetId: req.params.id,
        route: req.path
    });
});


/**
 * API examples routes.
 */
app.get("/api", apiController.getApi);
app.get("/api/facebook", passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook);


export default app;
