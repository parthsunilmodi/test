import mongoose, { mongo } from "mongoose";
import { CustomerSchema, CustomerAssetDocument } from "../customer/Asset";

export enum AssetStatus {
    Setup = "Setup",
    CheckedIn = "CheckedIn",
    CheckedOut = "CheckedOut",
    Error = "Err",
    Unknown = "Unknown"

}

export type AssetDocument = mongoose.Document & CustomerAssetDocument &  {
    _id: string;
    customerId: string;
    assetStatus: string;
    assetType: string;
    checkedIn: Date;
    checkedOut: Date;
    data: object;
    _tags: string[];
};

type checkInAssetFunction = (cb: (err: any, isCheckedIn: any) => {}) => void
type checkOutAssetFunction = (cb: (err: any, isCheckedOut: any) => {}) => void

const AssetSchemaBase = new mongoose.Schema({
    customerId:  {
        type: String,
        required: true,
    },
    assetType: { type: String, required: true, enum: ["Part", "Asset", "Document"] } ,
    assetStatus: { 
        type: String, 
        default: AssetStatus.Unknown 
    },
    checkInDate: {
        type: Date, 
        required: false, // auto added when checkInMethod is called
    },
    checkOutDate: {
        type: Date, 
        required: false, // auto added when checkInMethod is called
    },
    version: Number, // auto increment? or set during write/update
    tags: Array,
    links: Array,

    data: CustomerSchema,

}, { strict: true, versionKey: true, timestamps: true }); 


// Schema for Mongodb. inherits from base schema and all customer data 
// is stored under data object as per the required Customer Schema 
const assetSchema = new mongoose.Schema({
    ...AssetSchemaBase.obj,
});

assetSchema.addListener("onAssetChanged", (obj, changes) => {
    if(obj.isValid()) {
        // if the object hasn't been deleted
    }
    // do something here (like notify redis or write mongodb log or increment version)
});

/**  add plugin that converts mongoose to json */
// assetSchema.plugin(toJSON);
// assetSchema.plugin(paginate);

// methods on the asset document
// checkIn, checkOut, create, update, delete
// base methods
/** add link */
/** remove link */
/** CheckIn */
/** CheckOut */
/** FindById */ // exists within mongodb 
/** ListAll(Paginated) */ // exists within mongodb

/**
 * 
 * @param cb callback 
 * @returns Promise<Boolean> true or false based on the success of the operation
 */
const checkInAsset: checkInAssetFunction = function (cb: (err: Error, asset: any, isCheckedOut: boolean) => {}): void {
    
    /**
     * Validation before check-in?
     */

    try {

        this.assetStatus = AssetStatus.CheckedIn;
        this.checkInDate = Date.now();

    } catch (err) {
        this.checkedIn = false;
        cb(err, null, false);
    } 
    
    if(cb) cb(null, this, true);
};

/**
 * 
 * @param cb callback 
 * @returns Promise<Boolean> true or false based on the success of the operation
 */
const checkOutAsset: checkOutAssetFunction = function (cb: (err: Error, asset: any, isCheckedOut: boolean) => {}): void {
    
    /**
     * Validation before check-out?
     */

    try {
        
        this.assetStatus = AssetStatus.CheckedOut;
        this.checkOutDate = Date.now();

    } catch (err) {
        cb(err, null, false);
    } 
    
    if(cb) cb(null, this, true);
};

assetSchema.methods.checkIn = checkInAsset;
assetSchema.methods.checkOut = checkOutAsset;

export const Asset = mongoose.model<AssetDocument>("Asset", assetSchema);




