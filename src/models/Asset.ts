import mongoose, { mongo } from "mongoose";
import { CustomerSchema, CustomerAssetDocument } from "../customer/Asset";

enum AssetType {
    Project, 
    Equipment,
    Document, 
}
export enum AssetStatus {
    CheckedIn = 1,
    CheckedOut = 0,
    Unknown = -1

}

export type AssetDocument = mongoose.Document & CustomerAssetDocument &  {
    _id: string;
    customerId: string;
    assetType: AssetType;
    checkedIn: Date;
    checkedOut: Date;
    data: object;
    _tags: string[];
};

type checkInAssetFunction = (cb: (err: any, isCheckedIn: any) => {}) => void
type checkOutAssetFunction = (cb: (err: any, isCheckedOut: any) => {}) => void

const AssetSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    customerId: String,
    assetType: String,
    assetStatus: { type: AssetStatus, default: AssetStatus.Unknown },
    checkInDate: Date,
    checkOutDate: Date,
    version: Number, // auto increment? or set during write/update
    __tags: Array,
    __links: Array,

    ...CustomerSchema

}, { timestamps: true }); 



// Schema for Mongodb. inherits from base schema and all customer data 
// is stored under data object as per the required Customer Schema 
const assetSchema = new mongoose.Schema({
    ...AssetSchema.obj,
    data: { type: CustomerSchema, default: {} }
});

// methods on the asset document
// checkIn, checkOut, create, update, delete
// base methods
/** add link */
/** remove link */
/** CheckIn */
/** CheckOut */
/** FindById */ // exists within mongodb 
/** ListAll(Paginated) */ // exists within mongodb

const checkInAsset: checkInAssetFunction = function (cb) {
    
    /**
     * Validation before check-in?
     */
    try {

        this.assetStatus = AssetStatus.CheckedIn;
        this.checkInDate = Date.now();

    } catch (err) {
        this.checkedIn = false;
        cb(err, false);
    } 
    
    cb(null, true);
};

const checkOutAsset: checkOutAssetFunction = function (cb) {
    
    /**
     * Validation before check-out?
     */
    try {
        
        this.assetStatus = AssetStatus.CheckedOut;
        this.checkOutDate = Date.now();

    } catch (err) {
        cb(err, false);
    } 
    
    cb(null, true);
};

assetSchema.methods.checkIn = checkInAsset;
assetSchema.methods.checkOut = checkOutAsset;

export const Asset = mongoose.model<AssetDocument>("Asset", assetSchema);




