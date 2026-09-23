import { Body, Controller, Get, HttpStatus, Injectable, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiErrorResponse } from '@framework/swagger';
import {
  CreateEmailAccountRequest,
  CreateEmailAccountResponse,
  CreateEmailRouteConfigRequest,
  CreateEmailRouteConfigResponse,
  GetEmailAccountListRequest,
  GetEmailAccountListResponse,
  GetEmailLogListRequest,
  GetEmailLogListResponse,
  GetEmailProviderListResponse,
  GetEmailRouteConfigListRequest,
  GetEmailRouteConfigListResponse,
  PatchEmailAccountRequest,
  PatchEmailAccountResponse,
  PatchEmailRouteConfigRequest,
  PatchEmailRouteConfigResponse,
  SendEmailRequest,
  SendEmailResponse,
} from './email.dto';
import { ZodResponse } from 'nestjs-zod';
import { ApiOperation } from '@nestjs/swagger';

@Injectable()
@Controller({ version: '1', path: 'email' })
@ApiErrorResponse()
export class EmailController {
  constructor() {}

  @Post('accounts')
  @ApiOperation({
    summary: 'Create email account',
    description: 'Register a new email sending account against a provider.',
  })
  @ZodResponse({ type: CreateEmailAccountResponse, status: HttpStatus.CREATED })
  async createEmailAccount(@Body() body: CreateEmailAccountRequest): Promise<CreateEmailAccountResponse> {
    throw new Error('Not implemented');
  }

  @Get('accounts')
  @ApiOperation({
    summary: 'Get email account list',
    description: 'Search, filter and paginate email sending accounts.',
  })
  @ZodResponse({ type: GetEmailAccountListResponse, status: HttpStatus.OK })
  async getEmailAccountList(@Query() query: GetEmailAccountListRequest): Promise<GetEmailAccountListResponse> {
    throw new Error('Not implemented');
  }

  @Patch('accounts/:id')
  @ApiOperation({
    summary: 'Patch email account',
    description: 'Partially update an email sending account (sender details, quota, credentials, status).',
  })
  @ZodResponse({ type: PatchEmailAccountResponse, status: HttpStatus.OK })
  async patchEmailAccount(
    @Param('id') id: string,
    @Body() body: PatchEmailAccountRequest,
  ): Promise<PatchEmailAccountResponse> {
    throw new Error('Not implemented');
  }

  @Get('providers')
  @ApiOperation({
    summary: 'Get email provider list',
    description: 'Retrieve the email providers accounts can be bound to.',
  })
  @ZodResponse({ type: [GetEmailProviderListResponse], status: HttpStatus.OK })
  async getEmailProviderList(): Promise<GetEmailProviderListResponse[]> {
    throw new Error('Not implemented');
  }

  @Get('logs')
  @ApiOperation({
    summary: 'Get email log list',
    description: 'Retrieve email delivery logs with filters.',
  })
  @ZodResponse({ type: GetEmailLogListResponse, status: HttpStatus.OK })
  async getEmailLogList(@Query() query: GetEmailLogListRequest): Promise<GetEmailLogListResponse> {
    throw new Error('Not implemented');
  }

  @Post('send')
  @ApiOperation({
    summary: 'Send test email',
    description: 'Submit a test email through a specific account, or through routing when no account is given.',
  })
  @ZodResponse({ type: SendEmailResponse, status: HttpStatus.OK })
  async sendEmail(@Body() body: SendEmailRequest): Promise<SendEmailResponse> {
    throw new Error('Not implemented');
  }

  @Get('route-configs')
  @ApiOperation({
    summary: 'Get email route config list',
    description: 'Retrieve the routing rules selecting which account sends an email.',
  })
  @ZodResponse({ type: GetEmailRouteConfigListResponse, status: HttpStatus.OK })
  async getEmailRouteConfigList(
    @Query() query: GetEmailRouteConfigListRequest,
  ): Promise<GetEmailRouteConfigListResponse> {
    throw new Error('Not implemented');
  }

  @Post('route-configs')
  @ApiOperation({
    summary: 'Create email route config',
    description: 'Add a routing rule for email delivery.',
  })
  @ZodResponse({ type: CreateEmailRouteConfigResponse, status: HttpStatus.CREATED })
  async createEmailRouteConfig(
    @Body() body: CreateEmailRouteConfigRequest,
  ): Promise<CreateEmailRouteConfigResponse> {
    throw new Error('Not implemented');
  }

  @Patch('route-configs/:id')
  @ApiOperation({
    summary: 'Patch email route config',
    description: 'Partially update a routing rule (target account, priority, weight, criteria, status).',
  })
  @ZodResponse({ type: PatchEmailRouteConfigResponse, status: HttpStatus.OK })
  async patchEmailRouteConfig(
    @Param('id') id: string,
    @Body() body: PatchEmailRouteConfigRequest,
  ): Promise<PatchEmailRouteConfigResponse> {
    throw new Error('Not implemented');
  }
}
