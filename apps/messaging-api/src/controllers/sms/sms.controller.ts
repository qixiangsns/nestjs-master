import { Body, Controller, HttpStatus, Injectable, Post } from '@nestjs/common';
import { ApiErrorResponse } from '@framework/swagger';
import { ZodResponse } from 'nestjs-zod';
import { ApiOperation } from '@nestjs/swagger';
import {
  SendMktSmsRequest,
  SendMktSmsResponse,
  SendLoginOtpSmsRequest,
  SendLoginOtpSmsResponse,
  SendRegisterOtpSmsRequest,
  SendRegisterOtpSmsResponse,
  SendNotificationSmsRequest,
  SendNotificationSmsResponse,
} from './sms.dto';

@Injectable()
@Controller({ version: '1', path: 'sms' })
@ApiErrorResponse()
export class SmsController {
  constructor() {}

  @Post('/marketing')
  @ApiOperation({
    summary: 'Send marketing sms',
    description: 'Priority: low',
  })
  @ZodResponse({ type: SendMktSmsResponse, status: HttpStatus.CREATED })
  async sendMktSms(@Body() body: SendMktSmsRequest) {
    return {
      messageId: '',
    };
  }

  @Post('otp/login')
  @ApiOperation({
    summary: 'Send login OTP',
    description: 'Priority: high',
  })
  @ZodResponse({ type: SendLoginOtpSmsResponse, status: HttpStatus.CREATED })
  async sendLoginOtpSms(@Body() body: SendLoginOtpSmsRequest) {
    return {
      messageId: '',
    };
  }

  @Post('otp/register')
  @ApiOperation({
    summary: 'Send registration OTP',
    description: 'Priority: high',
  })
  @ZodResponse({ type: SendRegisterOtpSmsResponse, status: HttpStatus.CREATED })
  async sendRegisterOtpSms(@Body() body: SendRegisterOtpSmsRequest) {
    return {
      messageId: '',
    };
  }

  @Post('notification')
  @ApiOperation({
    summary: 'Send notification sms',
    description: 'Priority: medium',
  })
  @ZodResponse({ type: SendNotificationSmsResponse, status: HttpStatus.CREATED })
  async sendNotificationSms(@Body() body: SendNotificationSmsRequest) {
    return {
      messageId: '',
    };
  }
}
