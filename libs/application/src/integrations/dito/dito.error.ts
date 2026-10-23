import { HttpStatusCode } from 'axios';

export class DitoError extends Error {
  public readonly errorCode: number | string;
  public readonly statusCode: HttpStatusCode;

  constructor(errorCode: number | string, statusCode: HttpStatusCode, message: string) {
    super(message);
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    this.statusCode = statusCode;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
