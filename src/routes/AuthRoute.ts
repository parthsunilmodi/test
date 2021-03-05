import express from "express";
import { Joi } from "express-validation";
import * as userController from "../controllers/user";
import { validate } from "../helpers";

const AuthRoute = express.Router();

const paramValidation = {
  login: {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string()
        .regex(/[a-zA-Z0-9]{3,30}/)
        .required(),
    }),
  },
  forgotPassword: {
    body: Joi.object({
      email: Joi.string().email().required(),
    })
  },
  signUp: {
    body: Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string()
        .regex(/[a-zA-Z0-9]{3,30}/)
        .required(),
    })
  },
  setPassword: {
    params: {
      id: Joi.string().required(),
    },
    body: {
      password: Joi.string()
        .regex(/[a-zA-Z0-9]{3,30}/)
        .required(),
    }
  },
  resetPassword: {
    body: Joi.object({
      authToken: Joi.string().uuid().required(),
      password: Joi.string()
        .regex(/[a-zA-Z0-9]{3,30}/)
        .required(),
      email: Joi.string().email().required(),
    })
  }
};

/**
 * Sign in using email and password.
 * @route POST /auth/login
 * returns the token and the user details
 */
AuthRoute.post("/login", validate(paramValidation.login), userController.postLogin);

/**
 * Forgot password with email.
 * @route POST /auth/forgotPassword
 */
AuthRoute.post("/forgotPassword", validate(paramValidation.forgotPassword), userController.postForgot);

/**
 * Sign up using email and password.
 * @route POST /auth/signUp
 * It will create a new user and will return the email of the user
 */
AuthRoute.post("/signup", validate(paramValidation.signUp), userController.postSignup);

/**
 * Sign in using email and password.
 * @route POST /auth/set-password/:id
 * It will create a new password for the user
 */
AuthRoute.put("/set-password/:id", validate(paramValidation.setPassword), userController.setUserPassword);

/**
 * Reset password for the given email.
 * @route POST /auth/reset-password
 * It will reset the password for the user
 */
AuthRoute.post("/reset-password", validate(paramValidation.resetPassword), userController.resetUserPassword);

export default AuthRoute;
