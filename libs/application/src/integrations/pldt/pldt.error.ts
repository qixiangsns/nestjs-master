import { HttpStatusCode } from 'axios';

export class PldtError extends Error {
  public readonly errorCode: string;
  public readonly statusCode: HttpStatusCode;

  constructor(errorCode: string, statusCode: HttpStatusCode, message: string) {
    super(message);
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    this.statusCode = statusCode;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
