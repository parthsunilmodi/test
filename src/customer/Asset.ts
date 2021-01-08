import mongoose from "mongoose";


// TBD 
// Customize as needed
export type CustomerAssetDocument =  {

};

export const CustomerSchema = new mongoose.Schema({
    data: {
        type: {},
        required: false,
        default: { customerFieldExample: "n/a" }
    }
}); 



