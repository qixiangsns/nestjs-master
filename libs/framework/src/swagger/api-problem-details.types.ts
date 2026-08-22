import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

// @Reference: https://swagger.io/blog/problem-details-rfc9457-api-error-handling/
// RFC-9457 compliant error response
export class ErrorDetail {
  parameter: string;
  detail: string;
}

export class ProblemDetails {
  status: HttpStatus;
  title: string;
  message: string;
  errors?: ErrorDetail[];
}
// RFC-9457 compliant error response
export class ApiErrorDetail {
  @ApiProperty({ description: 'The parameter name' })
  parameter: string;
  @ApiProperty({ description: 'The parameter detail' })
  detail: string;
}

export class ApiProblemDetails {
  @ApiProperty({
    description: 'The HTTP status code',
    enum: HttpStatus,
    examples: [400, 500],
    default: 400,
  })
  status: HttpStatus;
  @ApiProperty({
    description: 'A concise title for the error',
  })
  title: string;
  @ApiProperty({ description: 'The description of the error' })
  message: string;
  @ApiProperty({
    description: 'The error details',
    type: ApiErrorDetail,
    isArray: true,
    required: false,
  })
  errors?: ApiErrorDetail[];
}
