import express from "express";
import AuthRoute from "./AuthRoute";
import UserRoute from "./UserRoute";
import StoredAppsRoute from "./StoredAppsRoute";
import UserAppsRoute from "./UserAppsRoute";

const router = express.Router();

// mount auth routes at /auth
router.use("/auth", AuthRoute);

// mount user routes at /user
router.use("/user", UserRoute);

// mount stored Apps routes at /apps
router.use("/apps", StoredAppsRoute);

// mount stored Apps routes at /userApps
router.use("/userApps", UserAppsRoute);

export default router;
