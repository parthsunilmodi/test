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
  setUserPassword: {
    params: Joi.object({
      userId: Joi.string().required(),
    }),
    body: Joi.object({
      password: Joi.string()
          .regex(/[a-zA-Z0-9]{3,30}/)
          .required(),
    })
  }
};

/**
 * Get user details based on the id.
 * @route GET /user/:id
 * returns the details of the user
 */
UserRoute.get("/:id", validate(paramValidation.getUser), userController.getUserById);

/**
 * Set password for the user
 * @route PUT /set-password/:userId
 * returns the details of the user
 */
UserRoute.put("/set-password/:userId", validate(paramValidation.setUserPassword), userController.setUserPassword);

export default UserRoute;
