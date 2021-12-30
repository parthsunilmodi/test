import mongoose from "mongoose";
import moment from "moment";

const columnsSchema = new mongoose.Schema({
    name: { type: String, required: true },
    key: { type: String, required: true },
    displayName: { type: String, required: true },
    placeholderText: { type: String, required: false },
    type: { type: String, required: true },
    options: [{
        id: { type: String, required: false },
        name: { type: String, required: true },
        displayName: { type: String, required: true }
    }],

}, {strict: true, timestamps: true});

export const Columns = mongoose.model<any>("Columns", columnsSchema);
