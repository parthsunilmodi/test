import express from "express";
import AuthRoute from "./AuthRoute";
import UserRoute from "./UserRoute";

const router = express.Router();

// mount auth routes at /auth
router.use("/auth", AuthRoute);

// mount user routes at /user
router.use("/user", UserRoute);

export default router;
