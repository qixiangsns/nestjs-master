import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ApiProblemDetails } from './api-problem-details.types';

export function ApiErrorResponse() {
  return applyDecorators(
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      type: ApiProblemDetails,
      description: 'RFC-9457 compliant error response',
    }),
  );
}
