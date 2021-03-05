import mongoose from "mongoose";

export type StoredAppDocument = mongoose.Document & {
    name: string;
    imageUrl: string;
    tags: string[];
    shortDescription: string;
    description: string;
    configurationDescription: string;
    requirements: object;
    useCase: [object];
    cost: [object];
    review: [object];
    publishedUrls: string;
    thumbnailUrl: string;
    pictures: [string];
};

const appSchema = new mongoose.Schema({
    name: {type: String, required: true,},
    imageUrl: {type: String, required: true,}, // use placeholder image is imageUrl is not there
    tags: {type: [String],},
    shortDescription: {type: String, required: true,},
    description: {type: String, required: true,},
    configurationDescription: {type: String, required: true,},
    requirements: {
        type: [Object],
    },
    useCase: { type: [Object] },
    cost: { type: [Object] },
    review: { type: [Object] },
    publishedUrls: { type: String }, // https://eduro.apps.trackitt.io/${appName}
    thumbnailUrl: { type: String }, // image to display in list view
    pictures: { type: [String] }, // set of images to display in detail view

}, {strict: true, timestamps: true});

export const StoredApp = mongoose.model<StoredAppDocument>("StoredApp", appSchema);
