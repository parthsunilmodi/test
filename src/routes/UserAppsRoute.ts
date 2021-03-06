import express from "express";
import { Joi } from "express-validation";
import * as userAppsController from "../controllers/userApps";
import { validate } from "../helpers";

const UserAppsRoute = express.Router();

const paramValidation = {
  getAppById: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
  },
  getUserAssignedApps: {
    params: Joi.object({
      userId: Joi.string().required(),
    }),
  },
  getUsersByAppId: {
    params: Joi.object({
      appId: Joi.string().required(),
    }),
  },
  addApp: {
    body: Joi.object({
      appId: Joi.string().required(),
      subscriptionType: Joi.string().valid("FREE", "PAID")
    })
  },
  updateApp: {
    body: Joi.object({

    })
  },
  deleteApp: {
    body: Joi.object({

    })
  },
  addUserToApp: {
    params: Joi.object({
      appId: Joi.string().required(),
    }),
    body: Joi.object({
      adminEmail: Joi.string().email().required(),
      userEmail: Joi.string().email().required(),
      name: Joi.string().required(),
    }),
  },
  updateUserToApp: {
    params: Joi.object({
      appId: Joi.string().required(),
    }),
    body: Joi.object({
      id: Joi.string().required(),
      email: Joi.string().email().required(),
    })
  }
};

/**
 * Get all the userApps.
 * @route GET /userApps
 * returns the array of all the userApps
 */
UserAppsRoute.get("/", userAppsController.getAllApps);

/**
 * Get the userApps by Id.
 * @route GET /userApps/:id
 * returns the object of the userApp for the given Id
 */
UserAppsRoute.get("/:id", validate(paramValidation.getAppById), userAppsController.getAppByID);

/**
 * Add the userApp
 * @route POST /
 * returns the object of the new userApp
 */
UserAppsRoute.post("/", validate(paramValidation.addApp), userAppsController.addApp);

/**
 * Update the userApp
 * @route PUT /:appId
 * returns the object of the updated userApp
 */
UserAppsRoute.put("/:appId", validate(paramValidation.updateApp), userAppsController.updateApp);

/**
 * Delete the userApp
 * @route DELETE /:appId
 * returns the result whether deleted or not
 */
UserAppsRoute.delete("/:appId", validate(paramValidation.deleteApp), userAppsController.deleteApp);

/**
 * Add User to the App
 * @route POST /add-user/:appId
 * returns the result with { status, message, result }
 */
UserAppsRoute.post("/user/:appId", validate(paramValidation.addUserToApp), userAppsController.addUserToApp);

/**
 * Update User array to the App
 * @route PUT /update-user/:appId
 * returns the result with { status, message, result }
 */
UserAppsRoute.put("/users/:appId", validate(paramValidation.updateUserToApp), userAppsController.updateUserToApp);

/**
 * Get the array of userApps that have the given Id in the users array
 * @route GET /userApps/:id
 * returns the array of userApp
 */
UserAppsRoute.get("/user-assigned-apps/:userId", validate(paramValidation.getUserAssignedApps), userAppsController.getUserAssignedAppsByUserId);

/**
 * Get the array of users that have are assigned to given App
 * @route GET /users/:appId
 * returns the array of users
 */
UserAppsRoute.get("/users/:appId", validate(paramValidation.getUsersByAppId), userAppsController.getUserByAppId);


export default UserAppsRoute;
