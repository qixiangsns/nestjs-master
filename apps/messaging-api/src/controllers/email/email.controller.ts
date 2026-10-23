import { Body, Controller, HttpStatus, Injectable, Post } from '@nestjs/common';
import { ApiErrorResponse } from '@framework/openapi/index.js';
import { ZodResponse } from 'nestjs-zod';
import { ApiOperation } from '@nestjs/swagger';
import { SendMktEmailRequest, SendMktEmailResponse } from './email.dto.js';

@Injectable()
@Controller({ version: '1', path: 'email' })
@ApiErrorResponse()
export class EmailController {
  constructor() {}

  @Post('/marketing')
  @ApiOperation({
    summary: 'Send marketing email',
    description: 'Priority: low',
  })
  @ZodResponse({ type: SendMktEmailResponse, status: HttpStatus.CREATED })
  sendMktEmail(@Body() _body: SendMktEmailRequest) {
    return {
      messageId: '',
    };
  }

  @ApiOperation({
    summary: 'Send OTP email',
    description: 'Priority: high',
  })
  @Post('otp')
  async sendOtpEmail() {}

  @ApiOperation({
    summary: 'Send notification email',
    description: 'Priority: medium',
  })
  @Post('notification')
  async sendNotificationEmail() {}
}
