import mongoose from "mongoose";
import moment from "moment";

export type UserAppDocument = mongoose.Document & {
    userId: string;
    appId: string;
    userType: string;
    subscriptionType: "FREE" | "PAID";
    expiresIn: Date;
    appUrl: string;
    users: [object];
    dashboard: string;
    cost: string;
    integrations: string;
    appData: string;
    apiRoot: string; // url where we'll store our data
    apiKey: string; // will store the url where our actual app is hosted
};

const userAppSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    appId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "StoredApp" },
    userType: { type: String, required: false },
    subscriptionType: { type: ["FREE", "PAID"], default: "FREE" },
    expiresIn: { type: Date, required: true, default: moment().add(14, "days").toISOString() },
    users: [
      {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          type: { type: String, enum: ["Admin", "User"], required: true, default: "User" },
          registeredOn: { type: Date, required: true, default: moment().add(14, "days").toISOString() }
      }
    ],
    dashboard: String,
    cost: String,
    integrations: String,
    appData: String,

}, { strict: true, timestamps: true });

export const UserApp = mongoose.model<UserAppDocument>("UserApp", userAppSchema);


