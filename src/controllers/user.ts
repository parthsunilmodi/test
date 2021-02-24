import mongoose, { NativeError } from "mongoose";
import async from "async";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import { check, param, sanitize, validationResult } from "express-validator";
import * as httpStatusCodes from "http-status";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import passport from "passport";
import * as jwt from "jsonwebtoken";
import * as secrets from "../util/secrets";
import { User, UserDocument, AuthToken } from "../models/User";
import "../config/passport";
import has = Reflect.has;

/**
 * Login page.
 * @route GET /login
 */
export const getLogin = (req: Request, res: Response) => {
    if (req.user) {
        return res.redirect("/");
    }
    res.render("account/login", {
        title: "Login"
    });
};

/**
 * Sign in using email and password.
 * @route POST /login
 */
export const postLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await check("email", "Email is not valid").isEmail().run(req);
        await check("password", "Password cannot be blank").isLength({ min: 1 }).run(req);
        // eslint-disable-next-line @typescript-eslint/camelcase
        await sanitize("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(httpStatusCodes.BAD_REQUEST).json({
                message: "Login Error!",
                error: errors.array()
            });
        }
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
                const token = jwt.sign({ user: body }, secrets.JWT_SECRET, { expiresIn: "300m" });

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
 * Sign in to the api using email and password.
 * @route POST /login
 */
export const postLoginApi = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await check("email", "Email is not valid").isEmail().run(req);
        await check("password", "Password cannot be blank").isLength({ min: 1 }).run(req);
        // eslint-disable-next-line @typescript-eslint/camelcase
        await sanitize("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(httpStatusCodes.BAD_REQUEST).json({
                message: "Login Error!",
                user: errors.array()
            });
        }

        passport.authenticate("jwt", (err: Error, user: UserDocument, info: IVerifyOptions) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.status(httpStatusCodes.NOT_FOUND).json({ info });
            }
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                const body = { _id: user._id, email: user.email };
                const token = jwt.sign({ user: body }, secrets.JWT_SECRET, { expiresIn: "300m" });

                return res.json({ token });

            });
        })(req, res, next);
    } catch (e) {
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: e.toString()
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
 * Signup page.
 * @route GET /signup
 */
export const getSignup = (req: Request, res: Response) => {
    if (req.user) {
        return res.redirect("/");
    }
    res.render("account/signup", {
        title: "Create Account"
    });
};

/**
 * Create a new local account.
 * @route POST /signup
 */
export const postSignup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await check("email", "Email is not valid").isEmail().run(req);
        await check("password", "Password must be at least 4 characters long").isLength({ min: 4 }).run(req);
        await check("confirmPassword", "Passwords do not match").equals(req.body.password).run(req);
        // eslint-disable-next-line @typescript-eslint/camelcase
        await sanitize("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(httpStatusCodes.BAD_REQUEST).json({
                message: "Signup Error!",
                user: errors.array()
            });
        }

        const user = new User({
            email: req.body.email,
            password: req.body.password
        });

        User.findOne({ email: req.body.email }, (err: NativeError, existingUser: UserDocument | null) => {
            if (err) {
                return next(err);
            }
            if (existingUser) {
                req.flash("errors", { msg: "Account with that email address already exists." });
                return res.redirect("/signup");
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
 * Profile page.
 * @route GET /account
 */
export const getAccount = (req: Request, res: Response) => {
    res.render("account/profile", {
        title: "Account Management"
    });
};

/**
 * Update profile information.
 * @route POST /account/profile
 */
export const postUpdateProfile = async (req: Request, res: Response, next: NextFunction) => {
    await check("email", "Please enter a valid email address.").isEmail().run(req);
    // eslint-disable-next-line @typescript-eslint/camelcase
    await sanitize("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("/account");
    }

    const user = req.user as UserDocument;
    User.findById(user.id, (err: NativeError, user: UserDocument) => {
        if (err) {
            return next(err);
        }
        user.email = req.body.email || "";
        user.profile.name = req.body.name || "";
        user.profile.gender = req.body.gender || "";
        user.profile.location = req.body.location || "";
        user.profile.website = req.body.website || "";
        user.save((err: any) => {
            if (err) {
                if (err.code === 11000) {
                    req.flash("errors", { msg: "The email address you have entered is already associated with an account." });
                    return res.redirect("/account");
                }
                return next(err);
            }
            req.flash("success", { msg: "Profile information has been updated." });
            res.redirect("/account");
        });
    });
};

/**
 * Update current password.
 * @route POST /account/password
 */
export const postUpdatePassword = async (req: Request, res: Response, next: NextFunction) => {
    await check("password", "Password must be at least 4 characters long").isLength({ min: 4 }).run(req);
    await check("confirmPassword", "Passwords do not match").equals(req.body.password).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("/account");
    }

    const user = req.user as UserDocument;
    User.findById(user.id, (err: NativeError, user: UserDocument) => {
        if (err) {
            return next(err);
        }
        user.password = req.body.password;
        user.save((err: NativeError) => {
            if (err) {
                return next(err);
            }
            req.flash("success", { msg: "Password has been changed." });
            res.redirect("/account");
        });
    });
};

/**
 * Delete user account.
 * @route POST /account/delete
 */
export const postDeleteAccount = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserDocument;
    User.remove({ _id: user.id }, (err) => {
        if (err) {
            return next(err);
        }
        req.logout();
        req.flash("info", { msg: "Your account has been deleted." });
        res.redirect("/");
    });
};

/**
 * Unlink OAuth provider.
 * @route GET /account/unlink/:provider
 */
export const getOauthUnlink = (req: Request, res: Response, next: NextFunction) => {
    const provider = req.params.provider;
    const user = req.user as UserDocument;
    User.findById(user.id, (err: NativeError, user: any) => {
        if (err) {
            return next(err);
        }
        user[provider] = undefined;
        user.tokens = user.tokens.filter((token: AuthToken) => token.kind !== provider);
        user.save((err: NativeError,) => {
            if (err) {
                return next(err);
            }
            req.flash("info", { msg: `${ provider } account has been unlinked.` });
            res.redirect("/account");
        });
    });
};

/**
 * Reset Password page.
 * @route GET /reset/:token
 */
export const getReset = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    User
        .findOne({ passwordResetToken: req.params.token })
        .where("passwordResetExpires").gt(Date.now())
        .exec((err: NativeError, user) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                req.flash("errors", { msg: "Password reset token is invalid or has expired." });
                return res.redirect("/forgot");
            }
            res.render("account/reset", {
                title: "Password Reset"
            });
        });
};

/**
 * Process the reset password request.
 * @route POST /reset/:token
 */
export const postReset = async (req: Request, res: Response, next: NextFunction) => {
    await check("password", "Password must be at least 4 characters long.").isLength({ min: 4 }).run(req);
    await check("confirm", "Passwords must match.").equals(req.body.password).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("back");
    }

    async.waterfall([
        function resetPassword(done: Function) {
            User
                .findOne({ passwordResetToken: req.params.token })
                .where("passwordResetExpires").gt(Date.now())
                .exec((err: NativeError, user: any) => {
                    if (err) {
                        return next(err);
                    }
                    if (!user) {
                        req.flash("errors", { msg: "Password reset token is invalid or has expired." });
                        return res.redirect("back");
                    }
                    user.password = req.body.password;
                    user.passwordResetToken = undefined;
                    user.passwordResetExpires = undefined;
                    user.save((err: NativeError,) => {
                        if (err) {
                            return next(err);
                        }
                        req.logIn(user, (err) => {
                            done(err, user);
                        });
                    });
                });
        },
        function sendResetPasswordEmail(user: UserDocument, done: Function) {
            const transporter = nodemailer.createTransport({
                service: "SendGrid",
                auth: {
                    user: process.env.SENDGRID_USER,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
            const mailOptions = {
                to: user.email,
                from: "express-ts@starter.com",
                subject: "Your password has been changed",
                text: `Hello,\n\nThis is a confirmation that the password for your account ${ user.email } has just been changed.\n`
            };
            transporter.sendMail(mailOptions, (err) => {
                req.flash("success", { msg: "Success! Your password has been changed." });
                done(err);
            });
        }
    ], (err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
};

/**
 * Forgot Password page.
 * @route GET /forgot
 */
export const getForgot = (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    res.render("account/forgot", {
        title: "Forgot Password"
    });
};

/**
 * Create a random token, then the send user an email with a reset link.
 * @route POST /forgot
 */
export const postForgot = async (req: Request, res: Response, next: NextFunction) => {
    await check("email", "Please enter a valid email address.").isEmail().run(req);
    // eslint-disable-next-line @typescript-eslint/camelcase
    await sanitize("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({
            message: "Forgot password Error!",
            user: errors.array()
        });
    }

    async.waterfall([
        function createRandomToken(done: Function) {
            crypto.randomBytes(16, (err: NativeError, buf) => {
                const token = buf.toString("hex");
                done(err, token);
            });
        },
        function setRandomToken(token: AuthToken, done: Function) {
            User.findOne({ email: req.body.email }, (err: NativeError, user: any) => {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return res.status(httpStatusCodes.BAD_REQUEST).json({
                        message: "Account with that email address does not exist.",
                        error: "Forgot Password Error"
                    });
                }
                user.passwordResetToken = token;
                user.passwordResetExpires = Date.now() + 3600000; // 1 hour
                user.save((err: NativeError,) => {
                    done(err, `http://${ req.headers.host }/reset/${ token }`, user);
                });
            });
        },
    ], (err) => {
        if (err) {
            return next(err);
        }
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({message: err.toString()});
    });
};

/**
 * Get user details from the given Id.
 * @route GET /user
 */
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    await param("id", "Invalid or missing id").exists().isMongoId().run(req);
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
    await param("id", "Invalid or missing id").exists().isMongoId().run(req);
    bcrypt.genSalt(10, (err, salt) => {
        if (err) { return next(err); }
        bcrypt.hash(req.body.password, salt, (err: mongoose.Error, hash) => {
            if (err) {
                return res.status(500).send({ status: false, message: err.message });
            }
            User.findOneAndUpdate({ _id: req.params.id }, { password: hash, isVerified: true }).then((userData) => {
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

