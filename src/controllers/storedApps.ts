import { NextFunction, Request, Response } from "express";
import { param, validationResult } from "express-validator";
import * as httpStatusCodes from "http-status";
import { StoredApp, StoredAppDocument } from "../models/StoredApps";

/**
 * Get all the Apps.
 * @route GET /
 */
export const getAllStoredApps = (req: Request, res: Response) => {
  StoredApp.find({})
    .populate("userId", {email:1})
    .populate("appId", {name:1})
    .then((apps: StoredAppDocument[]) => res.json({ apps }))
    .catch((err) => {
      return res.status(httpStatusCodes.NOT_FOUND).json({
        msg: "No StoredApp exists",
        error: err
      });
    });
};

/**
 * Get StoredApp by ID.
 * @route GET /
 */
export const getAppByID = async (req: Request, res: Response, next: NextFunction) => {
  await param("id", "Invalid or missing id").exists().isMongoId().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(httpStatusCodes.BAD_REQUEST).json({
      msg: "Invalid params",
      error: JSON.stringify(errors.array())
    });
  }

  await StoredApp.findById(req.params.id, (err: any, app: StoredAppDocument) => {
    if (err) {
      return res.status(httpStatusCodes.NOT_FOUND).json({
        msg: "StoredApp id not found",
        error: err
      });
    }
    return res.json({app});
  });
};

/**
 * Add app
 * @route POST /
 */
export const addApp = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const app: any = new StoredApp(req.body);

    await app.save((err: any, result: any) => {
      if (err) {
        return res.status(httpStatusCodes.ACCEPTED).json({
          msg: "Validation failed",
          error: err
        });
      }
      return res.json(result);
    });
  } catch (err) {
    return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Validation failed",
      error: err
    });
  }
};

/**
 * update app
 * @route PUT /
 */
export const updateApp = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    let newApp = req.body as StoredAppDocument;
    StoredApp.findById(req.params.id, (err: any, app: StoredAppDocument) => {
      if (err) {
        return next(err);
      }
      newApp = {
        ...app,
        ...newApp
      } as StoredAppDocument;
      app.save((err: any) => {
        if (err) {
          return next(err);
        }
        return res.json({result: "data updated"});
      });
    });
  } catch (err) {
    return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Validation failed",
      error: err
    });
  }
};

/**
 * delete app
 * @route DELETE /
 */
export const deleteApp = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const app = req.body as StoredAppDocument;
  StoredApp.remove({_id: app.id}, (err) => {
    if (err) {
      return next(err);
    }
    return res.json({result: "app deleted"});
  });
};
