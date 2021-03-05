import express from "express";
import { Joi } from "express-validation";
import * as storedAppsController from "../controllers/storedApps";
import { validate } from "../helpers";

const StoredAppsRoute = express.Router();

const bodyValidation = {
  name: Joi.string().required(),
  imageUrl: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).required(),
  shortDescription: Joi.string().required(),
  description: Joi.string().required(),
  configurationDescription: Joi.string().required(),
  requirements: Joi.object().optional(),
  useCase: Joi.array().items(Joi.object()).optional(),
  cost: Joi.array().items(Joi.object()).optional(),
  review: Joi.array().items(Joi.object()).optional(),
  publishedUrls: Joi.string().optional(),
  thumbnailUrl: Joi.string().optional(),
  pictures: Joi.array().items(Joi.string()).optional(),
};

const paramValidation = {
  getAppById: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
  },
  addApp: {
    body: Joi.object({ ...bodyValidation }),
  },
  updateApp: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({ ...bodyValidation }),
  },
  deleteApp: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
  }
};

/**
 * Get all the stored apps
 * @route GET /apps
 * returns the array of all the apps
 */
StoredAppsRoute.get("/", storedAppsController.getAllStoredApps);

/**
 * Get the stored apps by id
 * @route GET /apps/:id
 * returns the object of the app of the given id
 */
StoredAppsRoute.get("/:id", validate(paramValidation.getAppById), storedAppsController.getAppByID);

// TODO: Add App API is not verified. Currently we are not using that API.
/**
 * Add the app
 * @route POST /apps
 * returns the object of the new app
 */
StoredAppsRoute.post("/", validate(paramValidation.addApp), storedAppsController.addApp);

// TODO: Update App API is not verified. Currently we are not using that API.
/**
 * Update the app
 * @route pUT /apps/:id
 * returns the object of the updated app
 */
StoredAppsRoute.put("/:id", validate(paramValidation.updateApp), storedAppsController.updateApp);

// TODO: DELETE App API is not verified. Currently we are not using that API.
/**
 * Add the app
 * @route DELETE /:id
 * returns the object of the new app
 */
StoredAppsRoute.delete("/:id", validate(paramValidation.deleteApp), storedAppsController.deleteApp);

export default StoredAppsRoute;
