import { PromotexterErrorCode } from './promotexter.constant.js';
import { HttpStatusCode } from 'axios';

export class PromotexterError extends Error {
  public readonly errorCode: PromotexterErrorCode;
  public readonly statusCode: HttpStatusCode;

  constructor(errorCode: PromotexterErrorCode, statusCode: HttpStatusCode, message: string) {
    super(message);
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    this.statusCode = statusCode;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
