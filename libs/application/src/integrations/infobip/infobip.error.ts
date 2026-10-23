import { InfobipErrorId } from './infobip.constant.js';
import { HttpStatusCode } from 'axios';

export class InfobipError extends Error {
  public readonly errorId: InfobipErrorId;
  public readonly statusCode: HttpStatusCode;
  public readonly validationErrors?: Record<string, string[]>;

  constructor(
    errorId: InfobipErrorId,
    statusCode: HttpStatusCode,
    message: string,
    validationErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.errorId = errorId;
    this.statusCode = statusCode;
    this.validationErrors = validationErrors;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
