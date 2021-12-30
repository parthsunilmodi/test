import express from "express";
import * as employeeController from "./employee.controller";

const materialRoute = express.Router();

/**
 * Get all the stored apps
 * @route GET /apps
 * returns the array of all the apps
 */
materialRoute.get("/", employeeController.getAllEmployees);

/**
 * Get the stored apps by id
 * @route GET /apps/:id
 * returns the object of the app of the given id
 */
materialRoute.get("/:id", employeeController.getEmployeeById);

/**
 * Add the app
 * @route POST /apps
 * returns the object of the new app
 */
materialRoute.post("/", employeeController.addEmployee);

/**
 * Update the app
 * @route pUT /apps/:id
 * returns the object of the updated app
 */
materialRoute.put("/:id", employeeController.updateEmployee);

/**
 * Add the app
 * @route DELETE /:id
 * returns the object of the new app
 */
materialRoute.delete("/:id", employeeController.deleteEmployee);

export default materialRoute;
