import express from "express";
import columnsRoute from "./columns/columns.routes";
import materialRoute from "./employees/employee.routes";

const   router = express.Router();

// mount auth routes at /auth
router.use("/columns", columnsRoute);

// mount user routes at /user
router.use("/employees", materialRoute);

export default router;
