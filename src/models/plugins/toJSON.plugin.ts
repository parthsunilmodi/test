/* eslint-disable no-param-reassign */

import { Schema } from "mongoose";

/**
 * A mongoose schema plugin which applies the following in the toJSON transform call:
 *  - removes __v, createdAt, updatedAt, and any path that has private: true
 *  - replaces _id with id
 */
const toJSON = (schema: any, options: any) => {
  let transform: any;
  if (options.toJSON && options.toJSON.transform) {
    transform = options.toJSON.transform;
  }

  options.toJSON = Object.assign(options.toJSON || {}, {
    transform(doc: any, ret: any, options: any) {
      Object.keys(schema.paths).forEach((path) => {
        if (schema.paths[path].options && schema.paths[path].options.private) {
          delete ret[path];
        }
      });

      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      delete ret.createdAt;
      delete ret.updatedAt;
      if (transform) {
        return transform(doc, ret, options);
      }
    },
  });
};

export default toJSON;
