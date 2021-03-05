/* eslint-disable max-classes-per-file */
import httpStatus from "http-status";

/**
 * @extends Error
 */
class ExtendableError extends Error {
  constructor(message: string, status: number, data: any, isPublic: boolean) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    // @ts-ignore
    this.status = status;
    // @ts-ignore
    this.isPublic = isPublic;
    // @ts-ignore
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Class representing an API error.
 * @extends ExtendableError
 */
class APIError extends ExtendableError {
  /**
   * Creates an API error.
   * @param {string} message - Error message.
   * @param {number} status - HTTP status code of error.
   * @param {*} data - Whether data that needs to be passed to client side.
   * @param {boolean} isPublic - Whether the message should be visible to user or not.
   */
  constructor(message: string, status = httpStatus.INTERNAL_SERVER_ERROR, data = {}, isPublic = true) {
    super(message, status, data, isPublic);
  }
}

export default APIError;
