import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import compression from "compression";  // compresses requests
import session from "express-session";
import bodyParser from "body-parser";
import mongo from "connect-mongo";
import mongoose from "mongoose";
import passport from "passport";
import bluebird from "bluebird";
import httpStatus from "http-status";
import { ValidationError } from "express-validation";
import { MONGODB_URI, SESSION_SECRET } from "./util/secrets";
import APIError from "./helpers/APIError";
import Routes from "./routes";

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

/**
 * API Routes
 */

// mount all routes on /api path
app.use("/api/v1", Routes);

// if error is not an instanceOf APIError, convert it.
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ValidationError) {
        // validation error contains details object which has error message attached to error property.
        // @ts-ignore
        const allErrors = (err.details || []).map((pathErrors: any) => Object.values(pathErrors).join(", "));
        console.log("\n\n allErrors : ", allErrors);
        const unifiedErrorMessage = allErrors.join(", ").replace(/, ([^,]*)$/, " and $1");
        console.log("\n\n unifiedErrorMessage : ", unifiedErrorMessage);
        const error = new APIError(unifiedErrorMessage, err.statusCode);
        console.log("\n\n Error : ", error);
        return next(error);
    }
    if (!(err instanceof APIError)) {
        const apiError = new APIError(err.message, err.status);
        return next(apiError);
    }
    return next(err);
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new APIError("API Not Found", httpStatus.NOT_FOUND);
    return next(err);
});

// error handler, send stacktrace only during development
app.use((err: any, req: Request, res: Response, next: NextFunction) => // eslint-disable-line no-unused-vars
  res.status(err.status).json({ // eslint-disable-line implicit-arrow-linebreak
      message: err.isPublic ? err.message : httpStatus[err.status],
      stack: err.stack,
      ...(err.data || {}),
  }));

// // user routes
// app.put("/api/v1/set-password/:id", userController.setUserPassword);
//
// // app routes
// app.get("/api/v1/apps", storedAppController.getAllStoredApps);
// app.get("/api/v1/apps/:id", storedAppController.getAppByID);
// app.post("/api/v1/apps", storedAppController.addApp);
// app.put("/api/v1/apps/:id", storedAppController.updateApp);
// app.delete("/api/v1/apps/:id", storedAppController.deleteApp);
//
// // store app
// app.get("/api/v1/userApps", userAppController.getAllUserApps);
// app.get("/api/v1/users/:appId", userAppController.getUserByAppId);
// app.get("/api/v1/user/userApps/:appId", userAppController.getUserAppByID);
// app.get("/api/v1/userApps/:userId", userAppController.getUserAssignedApps);
// app.post("/api/v1/userApps", userAppController.addApp);
// app.post("/api/v1/userApps/:userAppId/addUser", userAppController.addUserToApp);
// app.post("/api/v1/userApps/:userAppId/updateUser", userAppController.updateUserToApp);
// app.put("/api/v1/userApps/:id", userAppController.updateApp);
// app.delete("/api/v1/userApps/:appId", userAppController.deleteApp);

export default app;
