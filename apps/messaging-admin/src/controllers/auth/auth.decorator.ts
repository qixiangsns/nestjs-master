import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

/**
 * Response Header for MFA token
 */
export const ApiResponseMfaToken = () =>
  applyDecorators(
    ApiOkResponse({
      headers: {
        'Set-Cookie': {
          schema: {
            type: 'string',
            title: 'mfaToken=<token>; Path=/tfa/verify; HttpOnly',
            description: 'MFA token cookie scoped to /tfa/verify (5 min expiry)',
          },
        },
      },
    }),
  );
