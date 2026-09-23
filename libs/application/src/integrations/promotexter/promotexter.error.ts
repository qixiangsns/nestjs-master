import { PromotexterErrorCode } from './promotexter.constant';
import { HttpStatusCode } from 'axios';

export type HttpStatusCode = (typeof HttpStatusCode)[keyof typeof HttpStatusCode];
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
