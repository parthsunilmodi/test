"use strict";

import graph from "fbgraph";
import { Response, Request, NextFunction } from "express";
import { Asset } from "../models/Asset";
import { UserDocument } from "../models/User";
import { param, check, sanitize, validationResult } from "express-validator";
import * as httpStatusCodes from "http-status";

/**
 * List of API examples.
 * @route GET /api
 */
export const getApi = (req: Request, res: Response) => {
    res.render("api/index", {
        title: "API Examples"
    });
};

export const getAll = (req: Request, res: Response) => {
    res.json({
        data: [
            {
                id: "sample_id",
                description: "one of the items of the entire collection"   
            }
        ]
    });
};

export const postAsset = async (req: Request, res: Response): Promise<any> => {
    const asset: any =  new Asset(req.body);
    asset.checkIn((checkInErr: any, checkedInItem: any, isCheckedIn: boolean) => {
        if(checkInErr) {
            return res.status(httpStatusCodes.ACCEPTED).json({
                msg: "Failed to check-in asset",
                error: checkInErr
            });
        }        
    });

    await asset.save((err: any, result: any) => {
        if(err) {
            return res.status(httpStatusCodes.ACCEPTED).json({
                msg: "Validation failed",
                error: err
            });
        }
        

        return res.json(result);
        
    });

};

export const getById = async (req: Request, res: Response) => {
    await param("id", "Invalid or missing id").exists().isMongoId().run(req);
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({
            msg: "Invalid params",
            error: JSON.stringify(errors.array())
        });
    }

    await Asset.findById(req.params.id, (err: any, asset) => {
        if(err) {
            return res.status(httpStatusCodes.NOT_FOUND).json({
                msg: "Asset id not found",
                error:  err
            });
        }
        return res.json({ asset });
    });
};

export const matchByCriteria = (req: Request, res: Response) => {
    // params: filter string

    res.json({
        data: [
            {
                id: "sample_id",
                description: "one of the items returned from the match query" 
            }
        ]
    });
};

export const checkIn = (req: Request, res: Response) => {
    // params: asset id

    res.json({
        message: "Checked In !",
        data: {}
    });
};

export const checkOut = (req: Request, res: Response) => {
    res.json({
        message: "Checked Out !",
        data: {}
    });
};



/**
 * Facebook API example.
 * @route GET /api/facebook
 */
export const getFacebook = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserDocument;
    const token = user.tokens.find((token: any) => token.kind === "facebook");
    graph.setAccessToken(token.accessToken);
    graph.get(`${user.facebook}?fields=id,name,email,first_name,last_name,gender,link,locale,timezone`, (err: Error, results: graph.FacebookUser) => {
        if (err) { return next(err); }
        res.render("api/facebook", {
            title: "Facebook API",
            profile: results
        });
    });
};
