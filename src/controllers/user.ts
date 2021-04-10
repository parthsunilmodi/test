import mongoose, { NativeError } from "mongoose";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import * as httpStatusCodes from "http-status";
import bcrypt from "bcrypt";
import passport from "passport";
import * as jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import * as secrets from "../util/secrets";
import { User, UserDocument } from "../models/User";
import sendEmail from "../helpers/emailSender";
import { UserApp, UserAppDocument } from "../models/UserApps";
import "../config/passport";

/*
* m - minutes (1m)
* h - hour (1hr)
* d - day (1d)
*/
const tokenExpirationTime = "1hr";

/**
 * Sign in using email and password.
 * @route POST /login
 */
export const postLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        passport.authenticate("local", (err: Error, user: UserDocument, info: IVerifyOptions) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.status(httpStatusCodes.BAD_REQUEST).json({ ...info });
            }
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                const body = { _id: user._id, email: user.email };
                const token = jwt.sign({ user: body }, secrets.JWT_SECRET, { expiresIn: tokenExpirationTime });

                return res.json({ ...body, token });

            });
        })(req, res, next);
    } catch (e) {
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: e.toString()
        });
    }
};

/**
 * Verify User with token
 * @route POST /verifyUser
 */
export const verifyUserWithApp = async (req: Request, res: Response) => {
    const { appId } = req.params;
    const user: any = req.user;

    try {
        await UserApp.findOne({ appId: appId, "users.userId": user._id }, (err: any, userApp: UserAppDocument) => {
            if (err) {
                return res.status(httpStatusCodes.NOT_FOUND).json({
                    msg: "StoreApp id not found",
                    error: err,
                    status: false,
                });
            }
            if (!userApp) {
                return res.status(httpStatusCodes.NOT_FOUND).json({
                    msg: "There is no app registered for this Id",
                    status: false,
                    access: false
                });
            }
            return res.json({ userApp, status: true, expired: false, access: true, message: "User have the access for the app." });
        });
    } catch (e) {
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            status: false,
            error: e.message,
        });
    }
};

/**
 * Log out.
 * @route GET /logout
 */
export const logout = (req: Request, res: Response) => {
    req.logout();
    res.status(httpStatusCodes.OK).json({ message: "user logged out" });
};

/**
 * Create a new local account.
 * @route POST /signup
 */
export const postSignup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = new User({
            email: req.body.email,
            password: req.body.password
        });

        User.findOne({ email: req.body.email }, (err: NativeError, existingUser: UserDocument | null) => {
            if (err) {
                return next(err);
            }
            if (existingUser) {
                return res.send({ message: "Account with that email address already exists." });
            }
            user.save((err) => {
                if (err) {
                    return next(err);
                }
                req.logIn(user, (err) => {
                    if (err) {
                        return next(err);
                    }
                    return res.json({
                        message: "Signup successful!",
                        user: user.email
                    });
                });
            });
        });
    } catch (e) {
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Signup Error!",
            user: e.toString()
        });
    }
};

/**
 * Create a random token, then the send user an email with a reset link.
 * @route POST /forgot
 */
export const postForgot = async (req: Request, res: Response) => {
    try {
        User.findOne({ email: req.body.email }, async (err: NativeError, user: UserDocument) => {
            if (err) {
                return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: err.message
                });
            }
            if (!user) {
                return res.status(httpStatusCodes.BAD_REQUEST).json({
                    message: "Account with that email address does not exist.",
                    error: "Forgot Password Error"
                });
            }
            const authToken: string = uuid();
            user.forgotPasswordToken = authToken;
            await user.save();
            const str = `${process.env.FRONTEND_ADMIN_PANEL_URL}/set-new-password?authToken=${authToken}&email=${user.email}`;
            const mailOptions = {
                to: req.body.email,
                from: "trackiTT@gmail.com", // TODO: Update it with the default From Email
                subject: "Recover the password for TrackiTT",
                text: "We have send you the link to update the password. Please visit the link and update the password",
                html: `<h1><a href=${str}>Link to reset password</a></h1>`,
            };
            const mailResponse = await sendEmail(mailOptions);
            res.status(httpStatusCodes.OK).json({ status: mailResponse.status, message: mailResponse.message, result: "data updated" });
        });
    } catch (err) {
        console.error(err);
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json(err);
    }
};

/**
 * Get user details from the given Id.
 * @route GET /user
 */
export const getUserById = async (req: Request, res: Response) => {
    User.findOne({ _id: req.params.id }).then((userData) => {
        if (!userData) {
            res.status(400).send({ message: "No data found with the given Id", status: true });
        }
        res.send({ message: "Data fetched successfully", status: true, data: userData });
    }).catch((err) => {
        console.error(err);
        res.status(500).send({ status: false, message: err.message });
    });
};

/**
 * Set the password for the first time.
 * @route POST /set-password/:id
 */
export const setUserPassword = async (req: Request, res: Response, next: NextFunction) => {
    bcrypt.genSalt(10, (err, salt) => {
        if (err) { return next(err); }
        bcrypt.hash(req.body.password, salt, (err: mongoose.Error, hash) => {
            if (err) {
                return res.status(500).send({ status: false, message: err.message });
            }
            User.findOneAndUpdate({ _id: req.params.userId }, { password: hash, isVerified: true }).then((userData) => {
                if (!userData) {
                    res.status(400).send({ message: "No data found with the given Id", status: true });
                }
                res.send({ message: "Data updated successfully", status: true, data: userData });
            }).catch((err) => {
                console.error(err);
                res.status(500).send({ status: false, message: err.message });
            });
        });
    });
};

/**
 * Set the password for the first time.
 * @route POST /set-password/:id
 */
export const resetUserPassword = async (req: Request, res: Response, next: NextFunction) => {
    bcrypt.genSalt(10, (err, salt) => {
        if (err) { return next(err); }
        bcrypt.hash(req.body.password, salt, (err: mongoose.Error, hash) => {
            if (err) {
                return res.status(500).send({ status: false, message: err.message });
            }
            User
              .findOneAndUpdate(
                {
                    email: req.body.email,
                    forgotPasswordToken: req.body.authToken
                },
                {
                    password: hash,
                    forgotPasswordToken: null
                }
              ).then((userData) => {
                if (!userData) {
                    res.status(httpStatusCodes.NOT_FOUND).send({ message: "No data found with the given Id and authToken", status: false });
                }
                res.send({ message: "Data updated successfully", status: true });
            }).catch((err) => {
                console.error(err);
                res.status(500).send({ status: false, message: err.message });
            });
        });
    });
};

