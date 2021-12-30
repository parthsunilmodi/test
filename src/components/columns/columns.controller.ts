import { NextFunction, Request, Response } from "express";
import * as httpStatusCodes from "http-status";
import { Columns } from "../model";

/**
 * Get all the Columns.
 * @route GET /
 */
export const getAllColumns = (req: Request, res: Response) => {
    Columns.find({})
        .then((columns: any) => res.json({ data: columns } ))
        .catch((err) => {
            return res.status(httpStatusCodes.NOT_FOUND).json({
                msg: "No StoredApp exists",
                error: err
            });
        });
};

/**
 * Add app
 * @route POST /
 */
export const addColumn = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const app: any = new Columns(req.body);
    const result = await app.save();
    return res.json(result);
  } catch (err) {
    return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Validation failed",
      error: err
    });
  }
};