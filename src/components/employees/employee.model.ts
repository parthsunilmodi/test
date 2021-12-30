import mongoose from "mongoose";
import moment from "moment";

const employeeSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    dateOfBirth: { type: Date, required: true, default: moment().toISOString() },
    hobbies: { type: [String], required: true },
    isEdit: { type: Boolean, required: true },
    isDelete: { type: Boolean, required: true },

}, {strict: true, timestamps: true});

export const Employee = mongoose.model<any>("Employees", employeeSchema);
