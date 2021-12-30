import express from "express";
import { Joi } from "express-validation";
import * as columnsController from "./columns.controller";
import { validate } from "../../helpers";

const supplierRoute = express.Router();

const bodyValidation = {
    appId: Joi.string().required(),
    userId: Joi.string().required(),
    topicId: Joi.string().required(),
    userAppId: Joi.string().required(),
    name: Joi.string().required(),
    email: Joi.string().required(),
    poValue: Joi.string().required(),
    quantity: Joi.number().required(),
    date: Joi.string().required(),
    status: Joi.boolean().required(),
    _id: Joi.string(),
    __v: Joi.any(),
    createdAt: Joi.string(),
    updatedAt: Joi.string(),
    materials: Joi.array().items({
        _id: Joi.string().optional(),
        name: Joi.string().optional(),
        description: Joi.string().required(),
        lotNumber: Joi.string().required(),
        partNumber: Joi.string().required(),
        quantity: Joi.number().required(),
        notes: Joi.string().allow(""),
        // eslint-disable-next-line @typescript-eslint/camelcase
        created_at: Joi.string(),
        // eslint-disable-next-line @typescript-eslint/camelcase
        updated_at: Joi.string(),
    }).allow(null),
};

const paramValidation = {
    getSupplierById: {
        params: Joi.object({
            id: Joi.string().required(),
        }),
    },
    addSupplier: {
        body: Joi.object({ ...bodyValidation }),
    },
    updateSupplier: {
        params: Joi.object({
            id: Joi.string().required(),
        }),
        body: Joi.object({ ...bodyValidation }),
    },
    deleteSupplier: {
        params: Joi.object({
            id: Joi.string().required(),
        }),
    }
};

/**
 * Get all the stored apps
 * @route GET /apps
 * returns the array of all the app
 * s
 */
supplierRoute.get("/", columnsController.getAllColumns);

supplierRoute.post("/", columnsController.addColumn);

export default supplierRoute;
