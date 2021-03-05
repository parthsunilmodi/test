import express from "express";
import { Joi } from "express-validation";
import * as userController from "../controllers/user";
import { validate } from "../helpers";

const UserRoute = express.Router();

const paramValidation = {
  getUser: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
  },
};

/**
 * Get user details based on the id.
 * @route GET /user/:id
 * returns the details of the user
 */
UserRoute.get("/:id", validate(paramValidation.getUser), userController.getUserById);

export default UserRoute;
