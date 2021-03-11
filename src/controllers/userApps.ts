import { NextFunction, Request, Response } from "express";
import { param, validationResult } from "express-validator";
import * as httpStatusCodes from "http-status";
import { UserApp, UserAppDocument } from "../models/UserApps";
import { User, UserDocument } from "../models/User";
import sendEmail from "../helpers/emailSender";
/**
 * Get all the Apps.
 * @route GET /
 */
export const getAllApps = (req: Request, res: Response, next: NextFunction) => {
  UserApp.find({})
    .populate("userId")
    .populate("appId")
    .then((apps: UserAppDocument[]) => {
    return res.json({ apps });
  }).catch((err: any) => {
    return res.status(httpStatusCodes.NOT_FOUND).json({
      msg: "No App exists",
      error: err
    });
  });
};

/**
 * Get StoreApp by ID.
 * @route GET /
 */
export const getAppByID = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(httpStatusCodes.BAD_REQUEST).json({
      msg: "Invalid params",
      error: JSON.stringify(errors.array())
    });
  }

  UserApp.findById(req.params.id)
    .populate("userId", {email:1})
    .populate("appId", {name:1})
    .then((storeApp: UserAppDocument) => {
    return res.json({ storeApp });
  }).catch((err: any) => {
    return res.status(httpStatusCodes.NOT_FOUND).json({
      msg: "StoreApp id not found",
      error: err
    });
  });
};

/**
 * Get app for user by app ID.
 * @route GET /
 */
export const getUserStoredAppByID = async (req: Request, res: Response, next: NextFunction) => {
  await param("appId", "Invalid or missing id").exists().isMongoId().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(httpStatusCodes.BAD_REQUEST).json({
      msg: "Invalid params",
      error: JSON.stringify(errors.array())
    });
  }

  const userId = (req.user as UserDocument).id;

  await UserApp.find({ appId: req.params.appId, userId: userId }, (err: any, storeApp: UserAppDocument) => {
    if (err) {
      return res.status(httpStatusCodes.NOT_FOUND).json({
        msg: "StoreApp id not found",
        error: err
      });
    }
    return res.json({ storeApp });
  });
};


/**
 * Add storeApp
 * @route POST /
 */
export const addApp = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const data = {
      ...req.body,
      // userId: (req.user as UserDocument).id,
      expiresIn: Date.now() + (14 * 24 * 60 * 60 * 1000), // day * hour * minute * second * 1000 // 14 days
    };
    UserApp.find({userId: data.userId, appId: data.appId}, async (err: any, result: any) => {
      if (err) {
        return res.status(httpStatusCodes.ACCEPTED).json({
          msg: "Validation failed",
          error: err
        });
      }

      if (result && result.length) {
        return res.status(httpStatusCodes.ACCEPTED).json({
          msg: "Validation failed",
          error: "App already register"
        });
      }

      const storeApp: any = new UserApp(data);
      await storeApp.save((err: any, result: any) => {
        if (err) {
          return res.status(httpStatusCodes.ACCEPTED).json({
            msg: "Validation failed",
            error: err
          });
        }
        return res.json(result);
      });
    });
  } catch (err) {
    return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Validation failed",
      error: err.toString()
    });
  }
};

/**
 * update storeApp
 * @route PUT /
 */
export const updateApp = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    let newApp = req.body as UserAppDocument;
    UserApp.findById(req.params.id, (err: any, storeApp: UserAppDocument) => {
      if (err) {
        return next(err);
      }
      newApp = {
        ...storeApp,
        ...newApp
      } as UserAppDocument;
      newApp.save((err: any) => {
        if (err) {
          return next(err);
        }
        return res.json({ result: "data updated" });
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
 * delete storeApp
 * @route DELETE /
 */
export const deleteApp = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  await param("appId", "Invalid or missing app id").exists().isMongoId().run(req);
  const userId = (req.user as UserDocument).id;
  UserApp.remove({ appId: req.params.appId, userId }, (err: any) => {
    if (err) {
      return next(err);
    }
    return res.json({ result: "storeApp deleted" });
  });
};

/**
 * Adds the user to the Users Array of the App
 * @route GET /userApps/:userAppId/addUser
 */
export const addUserToApp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userApp = await UserApp.findById(req.params.appId);
    const isExists = userApp.users.find((user) => {
      // @ts-ignore
      return user.userId.equals(req.body.userEmail);
    });
    if (isExists) {
      return res.status(400).send({ status: false, result: "User already added to this App" });
    } else {
      let selectedUser = await User.findOne({ emailId: req.body.userEmail });
      if (!selectedUser) {
        const randomPassword = Math.random().toString(36).slice(-8);
        const user = new User({
          email: req.body.userEmail,
          password: randomPassword,
          isVerified: false,
          profile: {
            name: req.body.name,
          }
        });
        selectedUser = await user.save();
      }
      const oldUsers = userApp.users;
      userApp.users.push({ userId: selectedUser.id });
      userApp.save(async (err: any) => {
        if (err) {
          return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            msg: "Validation failed",
            error: err
          });
        }
        const str = `${process.env.FRONTEND_APP_PORTAL_URL}/${req.params.appId}/${selectedUser.id}/pick-list`;
        const mailOptions = {
          to: req.body.userEmail,
          from: req.body.adminEmail,
          subject: "User access for the App",
          text: "You have been given the access for the App. Please visit the below URL and access the app.",
          html: `<h1><a href=${str}>Go to the App</a></h1>`,
        };
        await sendEmail(mailOptions);
        return res.json({ status: 200, message: "mailResponse.message", result: "data updated", user: [ ...oldUsers, selectedUser ] });
      });
    }
  } catch (err) {
    return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Validation failed",
      error: err
    });
  }
};

/**
 * Adds the user to the Users Array of the App
 * @route GET /userApps/:userAppId/addUser
 */
export const updateUserToApp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore
    UserApp.update({ _id: req.params.appId }, { $pull: { "users": { "userId": req.body.id } } }, (err: any, userApp: UserAppDocument) => {
      if (err) {
        return next(err);
      }
      console.log("\n\n\n userApp : ", userApp);
      res.json({ status: true, message: "record removed successfully" });
    });
  } catch (err) {
    return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Validation failed",
      error: err
    });
  }
};


/**
 * Gets all the apps that user is assigned to
 * @route GET /userApps/:userId
 */
export const getUserAssignedAppsByUserId = async (req: Request, res: Response, next: NextFunction) => {
  try {

    await param("userId", "Invalid or missing id").exists().isMongoId().run(req);

    UserApp.find({ "users.userId": req.params.userId }).populate("appId").then((userApps) => {
      res.send({ status: true, message: "Data fetched successfully", data: userApps });
    }).catch((err) => {
      return res.status(500).send({ status: false, message: err.message });
    });
  } catch (err) {
    return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Validation failed",
      error: err
    });
  }
};

/**
 * Get all the users added to the particular app
 * @route GET /userApps/users/:appId
 */
export const getUserByAppId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    UserApp.find({ "_id": req.params.appId }).populate("users.userId").then((userApps) => {
      res.send({ status: true, message: "Data fetched successfully", data: userApps });
    }).catch((err) => {
      return res.status(500).send({ status: false, message: err.message });
    });
  } catch (err) {
    return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Validation failed",
      error: err
    });
  }
};
