import { Body, Controller, HttpStatus, Injectable, Post } from '@nestjs/common';
import { ApiErrorResponse } from '@framework/swagger';
import { ZodResponse } from 'nestjs-zod';
import { ApiOperation } from '@nestjs/swagger';
import {
  SendViberOtpRequest,
  SendViberOtpResponse,
  SendViberMktRequest,
  SendViberMktResponse,
  SendViberNotificationRequest,
  SendViberNotificationResponse,
} from './viber.dto';

@Injectable()
@Controller({ version: '1', path: 'viber' })
@ApiErrorResponse()
export class ViberController {
  constructor() {}

  @Post('/otp')
  @ApiOperation({
    summary: 'Send Viber OTP',
    description: 'OTP template needs to be pre-approved by Viber.',
  })
  @ZodResponse({ type: SendViberOtpResponse, status: HttpStatus.CREATED })
  async sendOtp(@Body() body: SendViberOtpRequest) {
    return {
      messageId: '',
    };
  }

  @Post('/notification')
  @ApiOperation({
    summary: 'Send Viber notification',
    description: 'Notification template needs to be pre-approved by Viber.',
  })
  @ZodResponse({ type: SendViberNotificationResponse, status: HttpStatus.CREATED })
  async sendNotification(@Body() body: SendViberNotificationRequest) {
    return {
      messageId: '',
    };
  }

  @Post('/marketing')
  @ApiOperation({
    summary: 'Send marketing message',
  })
  @ZodResponse({ type: SendViberMktResponse, status: HttpStatus.CREATED })
  async sendMktMsg(@Body() body: SendViberMktRequest) {
    return {
      messageId: '',
    };
  }
}
