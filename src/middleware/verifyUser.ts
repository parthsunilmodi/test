import httpStatus from "http-status";
import { Request, Response, NextFunction } from "express";
import { User, UserDocument } from "../models/User";
import APIError from "../helpers/APIError";
import * as jwt from "jsonwebtoken";
import * as secrets from "../util/secrets";
import * as httpStatusCodes from "http-status";

type Decoded = {
  user: {
    _id: string;
    email: string;
  };
}

/**
 * check whether the token is verified or not.
 */
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;
  if (!authorization) {
    throw new APIError("Authorization header is missing", httpStatus.UNAUTHORIZED);
  }
  try {
    jwt.verify(authorization, secrets.JWT_SECRET, async (err, decoded: Decoded) => {
      if (err) {
        return res.status(httpStatusCodes.UNAUTHORIZED).json({
          error: err.toString(),
          status: false,
          expired: true,
        });
      }
      req.user = decoded.user;
      next();

    });
  } catch (error) {
    return next(error);
  }
};

/**
 * check whether the token is verified and returns the user.
 */
export const verifyTokenAndUser = async (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;
  if (!authorization) {
    throw new APIError("Authorization header is missing", httpStatus.UNAUTHORIZED);
  }
  try {
    jwt.verify(authorization, secrets.JWT_SECRET, async (err, decoded: Decoded) => {
      if (err) {
        return res.status(httpStatusCodes.UNAUTHORIZED).json({
          error: err.toString()
        });
      }

      const user: UserDocument = await User.findOne({ _id: decoded.user._id });
      if (user) {
        req.user = user;
        return next();
      }
      throw new APIError("No such user exists!", httpStatus.NOT_FOUND);

    });
  } catch (error) {
    return next(error);
  }
};
