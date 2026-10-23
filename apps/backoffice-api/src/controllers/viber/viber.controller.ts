import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Injectable,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { IsObjectIdPipe } from '@nestjs/mongoose';
import { ApiErrorResponse } from '@framework/openapi/index.js';
import { ZodResponse } from 'nestjs-zod';
import { ApiOperation } from '@nestjs/swagger';
import {
  ViberAccountService,
  ViberLogService,
  ViberProviderService,
  ViberRouteConfigService,
} from '@application/modules/viber/index.js';
import {
  CreateViberAccountRequest,
  CreateViberRouteConfigRequest,
  GetViberAccountListResponse,
  GetViberLogListRequest,
  GetViberLogListResponse,
  GetViberProviderListResponse,
  GetViberRouteConfigRequest,
  GetViberRouteConfigResponse,
  PatchViberAccountRequest,
  PatchViberRouteConfigRequest,
} from './viber.dto.js';

@Injectable()
@Controller({ version: '1', path: 'viber' })
@ApiErrorResponse()
export class ViberController {
  constructor(
    private readonly viberProviderService: ViberProviderService,
    private readonly viberAccountService: ViberAccountService,
    private readonly viberLogService: ViberLogService,
    private readonly viberRouteConfigService: ViberRouteConfigService,
  ) {}

  @Get('providers')
  @ApiOperation({
    summary: 'Get viber provider list',
    description: 'Retrieve the viber providers accounts can be bound to.',
  })
  @ZodResponse({ type: [GetViberProviderListResponse], status: HttpStatus.OK })
  async getViberProviderList(): Promise<GetViberProviderListResponse[]> {
    return this.viberProviderService.getAllProviders();
  }

  @Get('accounts')
  @ApiOperation({
    summary: 'Get viber account list',
    description: 'Retrieve viber sending accounts. Credentials are never returned.',
  })
  @ZodResponse({ type: [GetViberAccountListResponse], status: HttpStatus.OK })
  async getViberAccountList(): Promise<GetViberAccountListResponse[]> {
    const accounts = await this.viberAccountService.getAllAccounts();

    return accounts.map((account) => ({
      ...account,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
    }));
  }

  @Post('accounts')
  @ApiOperation({
    summary: 'Create viber account',
    description: 'Register a new viber sending account against a provider.',
  })
  async createViberAccount(@Body() body: CreateViberAccountRequest): Promise<void> {
    await this.viberAccountService.addAccount(body);
  }

  @Patch('accounts/:id')
  @ApiOperation({
    summary: 'Patch viber account',
    description:
      'Partially update a viber account (name, url, sender ids, credentials). Provider and account type cannot be changed.',
  })
  async patchViberAccount(
    @Param('id', IsObjectIdPipe) id: string,
    @Body() body: PatchViberAccountRequest,
  ): Promise<void> {
    await this.viberAccountService.updateAccount(id, body);
  }

  @Get('logs')
  @ApiOperation({
    summary: 'Get viber log list',
    description:
      'Retrieve viber message logs within a time range, newest first. Message content is not returned.',
  })
  @ZodResponse({ type: GetViberLogListResponse, status: HttpStatus.OK })
  async getViberLogList(@Query() query: GetViberLogListRequest): Promise<GetViberLogListResponse> {
    const { items, ...pagination } = await this.viberLogService.findLogs(query);

    return {
      ...pagination,
      items: items.map((log) => ({
        ...log,
        createdAt: log.createdAt?.toISOString(),
        updatedAt: log.updatedAt?.toISOString(),
      })),
    };
  }

  @Get('route-config')
  @ApiOperation({
    summary: 'Get viber route config',
    description:
      'Retrieve the route config of a platform and route type. Account credentials are never returned.',
  })
  @ZodResponse({ type: GetViberRouteConfigResponse, status: HttpStatus.OK })
  async getViberRouteConfig(
    @Query() query: GetViberRouteConfigRequest,
  ): Promise<GetViberRouteConfigResponse> {
    return this.viberRouteConfigService.getConfig(query);
  }

  @Post('route-config')
  @ApiOperation({
    summary: 'Create viber route config',
    description:
      'Create the route config of a platform and route type. All accounts must exist and support the route sender id.',
  })
  async createViberRouteConfig(@Body() body: CreateViberRouteConfigRequest): Promise<void> {
    await this.viberRouteConfigService.addConfig(body);
  }

  @Patch(':id/route-config')
  @ApiOperation({
    summary: 'Patch viber route config',
    description:
      'Update the route sender id, strategy and accounts. All accounts must exist and support the sender id. Platform and route type cannot change.',
  })
  async patchViberRouteConfig(
    @Param('id', IsObjectIdPipe) id: string,
    @Body() body: PatchViberRouteConfigRequest,
  ): Promise<void> {
    await this.viberRouteConfigService.updateConfig(id, body);
  }
}
