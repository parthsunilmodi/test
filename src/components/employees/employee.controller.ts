import { NextFunction, Request, Response } from "express";
import { param, validationResult } from "express-validator";
import * as httpStatusCodes from "http-status";
import { Employee } from "../model";
import * as http from "http";

/**
 * Get all the Apps.
 * @route GET /
 */
export const getAllEmployees = (req: Request, res: Response) => {
    Employee.find({})
        .then((apps: any) => res.json({ apps }))
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
export const getEmployeeById = async (req: Request, res: Response, next: NextFunction) => {
    Employee.findById(req.params.id, (err: any, app: any) => {
        if (err) {
            return res.status(httpStatusCodes.BAD_REQUEST).json({
                msg: "Employee not found",
                error: err
            });
        }
        return res.json({ app });
    });
};

/**
 * Add app
 * @route POST /
 */
export const addEmployee = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const app: any = new Employee(req.body);
        const result = await app.save();
        return res.json(result);
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
export const updateEmployee = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const result = await Employee.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if (result) {
            return res.json({ result: "data updated", data: result });
        }
        return res.json({ result: "data not updated", data: result });
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
export const deleteEmployee = async (req: Request, res: Response): Promise<any> => {
    try {
        await Employee.deleteOne({ _id: req.params.id });
        return res.json({ result: "app deleted" });
    } catch (err) {
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ err, message: err.message });
    }
};
