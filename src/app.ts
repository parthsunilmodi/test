import express from "express";
import cors from "cors";
import compression from "compression";  // compresses requests
import session from "express-session";
import bodyParser from "body-parser";
import mongo from "connect-mongo";
import mongoose from "mongoose";
import passport from "passport";
import bluebird from "bluebird";
import { MONGODB_URI, SESSION_SECRET } from "./util/secrets";

const MongoStore = mongo(session);

// Controllers (route handlers)
import * as userAppController from "./controllers/userApps";
import * as storedAppController from "./controllers/storedApps";
import * as userController from "./controllers/user";

// Create Express server
const app = express();
app.use(cors());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
mongoose.Promise = bluebird;

mongoose.connect(mongoUrl, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true}).then(
    () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
    },
).catch(err => {
    console.log(`MongoDB connection error. Please make sure MongoDB is running. ${ err }`);
    // process.exit();
});

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
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
// app.use((req, res, next) => {
//     res.locals.user = req.user;
//     next();
// });
// app.use((req, res, next) => {
//     // After successful login, redirect back to the intended page
//     if (!req.user &&
//         req.path !== "/login" &&
//         req.path !== "/signup" &&
//         !req.path.match(/^\/auth/) &&
//         !req.path.match(/\./)) {
//         (req.session as any).returnTo = req.path;
//     } else if (req.user &&
//         req.path == "/account") {
//         (req.session as any).returnTo = req.path;
//     }
//     next();
// });

// app.use(
//     express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
// );

console.log("\n\n\n API is called : ");

/**
 * API Routes
 */
// user routes
app.get("/api/v1/user/:id", userController.getUserById);
app.put("/api/v1/set-password/:id", userController.setUserPassword);

// app routes
app.get("/api/v1/apps", storedAppController.getAllStoredApps);
app.get("/api/v1/apps/:id", storedAppController.getAppByID);
app.post("/api/v1/apps", storedAppController.addApp);
app.put("/api/v1/apps/:id", storedAppController.updateApp);
app.delete("/api/v1/apps/:id", storedAppController.deleteApp);

// store app
app.get("/api/v1/userApps", userAppController.getAllUserApps);
app.get("/api/v1/users/:appId", userAppController.getUserByAppId);
app.get("/api/v1/user/userApps/:appId", userAppController.getUserAppByID);
app.get("/api/v1/userApps/:userId", userAppController.getUserAssignedApps);
app.post("/api/v1/userApps", userAppController.addApp);
app.post("/api/v1/userApps/:userAppId/addUser", userAppController.addUserToApp);
app.post("/api/v1/userApps/:userAppId/updateUser", userAppController.updateUserToApp);
app.put("/api/v1/userApps/:id", userAppController.updateApp);
app.delete("/api/v1/userApps/:appId", userAppController.deleteApp);

app.post("/api/v1/login", userController.postLogin);

app.post("/api/v1/forgotPassword", userController.postForgot);

app.post("/api/v1/signup", userController.postSignup);

export default app;
