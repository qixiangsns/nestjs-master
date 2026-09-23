import { Body, Controller, HttpStatus, Injectable, Post } from '@nestjs/common';
import { ApiErrorResponse } from '@framework/swagger';
import { SmsLogRequest, SmsLogResponse, SmsProviderResponse } from './sms.dto';
import { ZodResponse } from 'nestjs-zod';
import { ApiOperation } from '@nestjs/swagger';

@Injectable()
@Controller({ version: '1', path: 'sms' })
@ApiErrorResponse()
export class SmsController {
  constructor() {}

  @Post('logs')
  @ApiOperation({
    summary: 'SMS logs',
    description: 'Retrieve list of sms logs with filters',
  })
  @ZodResponse({ type: [SmsLogResponse], status: HttpStatus.OK })
  async login(@Body() body: SmsLogRequest) {
    return [
      {
        token: '1234567890',
        expiresAt: new Date().toISOString(),
      },
    ];
  }

  @Post('providers')
  @ApiOperation({
    summary: 'SMS Providers',
    description: 'Retrieve list of sms logs with filters',
  })
  @ZodResponse({ type: [SmsProviderResponse], status: HttpStatus.OK })
  async() {
    return [
      {
        code: 'ALIYUN',
        url: 'https://',
      },
    ];
  }
}
