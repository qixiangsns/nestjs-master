import { Body, Controller, HttpStatus, Injectable, Post } from '@nestjs/common';
import { ApiErrorResponse } from '@framework/swagger';
import { ZodResponse } from 'nestjs-zod';
import { ApiOperation } from '@nestjs/swagger';
import { ViberSenderService } from '@application/modules/viber';
import { SendViberMktDto, SendViberNotifDto, SendViberOtpDto, SendViberResponseDto } from './viber.dto';

@Injectable()
@Controller({ version: '1', path: 'viber' })
@ApiErrorResponse()
export class ViberController {
  constructor(private readonly viberSenderService: ViberSenderService) {}

  @Post('/otp')
  @ApiOperation({
    summary: 'Send Viber OTP',
    description: 'OTP template needs to be pre-approved by Viber.',
  })
  @ZodResponse({ type: SendViberResponseDto, status: HttpStatus.ACCEPTED })
  async sendOtp(@Body() body: SendViberOtpDto) {
    return this.viberSenderService.acceptOtpRequest(body);
  }

  @Post('/notification')
  @ApiOperation({
    summary: 'Send Viber notification',
    description: 'Notification template needs to be pre-approved by Viber.',
  })
  @ZodResponse({ type: SendViberResponseDto, status: HttpStatus.ACCEPTED })
  async sendNotification(@Body() body: SendViberNotifDto) {
    return {
      messageId: '',
    };
  }

  @Post('/marketing')
  @ApiOperation({
    summary: 'Send marketing message',
  })
  @ZodResponse({ type: SendViberResponseDto, status: HttpStatus.ACCEPTED })
  async sendMktMsg(@Body() body: SendViberMktDto) {
    return {
      messageId: '',
    };
  }
}
