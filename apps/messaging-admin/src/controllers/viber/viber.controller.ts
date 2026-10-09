import { Body, Controller, Get, HttpStatus, Injectable, Param, Patch, Post } from '@nestjs/common';
import { IsObjectIdPipe } from '@nestjs/mongoose';
import { ApiErrorResponse } from '@framework/swagger';
import { ZodResponse } from 'nestjs-zod';
import { ApiOperation } from '@nestjs/swagger';
import { ViberAccountService, ViberProviderService } from '@application/modules/viber';
import {
  CreateViberAccountRequest,
  GetViberAccountListResponse,
  GetViberProviderListResponse,
  PatchViberAccountRequest,
} from './viber.dto';

@Injectable()
@Controller({ version: '1', path: 'viber' })
@ApiErrorResponse()
export class ViberController {
  constructor(
    private readonly viberProviderService: ViberProviderService,
    private readonly viberAccountService: ViberAccountService,
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
}
