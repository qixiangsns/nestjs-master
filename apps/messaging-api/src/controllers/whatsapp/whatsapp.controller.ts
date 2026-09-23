import { Body, Controller, HttpStatus, Injectable, Post } from '@nestjs/common';
import { ApiErrorResponse } from '@framework/swagger';
import { ZodResponse } from 'nestjs-zod';
import { ApiOperation } from '@nestjs/swagger';
import {
  SendWhatsappOtpRequest,
  SendWhatsappOtpResponse,
  SendWhatsappMktRequest,
  SendWhatsappMktResponse,
} from './whatsapp.dto';

@Injectable()
@Controller({ version: '1', path: 'whatsapp' })
@ApiErrorResponse()
export class WhatsappController {
  constructor() {}

  /**
   * https://www.infobip.com/docs/whatsapp/message-types-and-templates
   */
  @Post('/otp')
  @ApiOperation({
    summary: 'Send Whatsapp OTP',
    description: 'OTP template needs to be pre-approved by whatsapp.',
  })
  @ZodResponse({ type: SendWhatsappOtpResponse, status: HttpStatus.CREATED })
  async sendOtp(@Body() body: SendWhatsappOtpRequest) {
    return {
      messageId: '',
    };
  }

  /**
   * https://www.infobip.com/docs/whatsapp/message-types-and-templates
   */
  @Post('/marketing')
  @ApiOperation({
    summary: 'Send marketing message',
    description: 'Promotional template needs to be pre-approved by whatsapp.',
  })
  @ZodResponse({ type: SendWhatsappMktResponse, status: HttpStatus.CREATED })
  async sendMktMsg(@Body() body: SendWhatsappMktRequest) {
    return {
      messageId: '',
    };
  }
}
