import { HttpStatusCode } from 'axios';

export class TelesignError extends Error {
  public readonly errorCode: number;
  public readonly statusCode: HttpStatusCode;

  constructor(errorCode: number, statusCode: HttpStatusCode, message: string) {
    super(message);
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    this.statusCode = statusCode;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
