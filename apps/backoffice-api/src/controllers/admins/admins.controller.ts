import { Body, Controller, Get, HttpStatus, Injectable, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiErrorResponse } from '@framework/swagger';
import {
  GetAdminListRequest,
  GetAdminListResponse,
  GetAdminInfoResponse,
  PatchAdminInfoRequest,
  PatchAdminInfoResponse,
  ResetAdminPasswordResponse,
  ResetAdminTfaResponse,
  UpdateAdminStatusRequest,
  UpdateAdminStatusResponse,
} from './admins.dto';
import { ZodResponse } from 'nestjs-zod';
import { ApiOperation } from '@nestjs/swagger';

@Injectable()
@Controller({ version: '1', path: 'admins' })
@ApiErrorResponse()
export class AdminsController {
  constructor() {}

  @Get()
  @ApiOperation({
    summary: 'Get admin list',
    description: 'Search, filter and paginate admin accounts.',
  })
  @ZodResponse({ type: GetAdminListResponse, status: HttpStatus.OK })
  getAdminList(@Query() _query: GetAdminListRequest): Promise<GetAdminListResponse> {
    throw new Error('Not implemented');
  }

  @Get(':adminId')
  @ApiOperation({
    summary: 'Get admin info',
    description: 'Retrieve details for a specific admin.',
  })
  @ZodResponse({ type: GetAdminInfoResponse, status: HttpStatus.OK })
  getAdminInfo(@Param('adminId') _adminId: string): Promise<GetAdminInfoResponse> {
    throw new Error('Not implemented');
  }

  @Patch(':adminId')
  @ApiOperation({
    summary: 'Patch admin info',
    description: 'Partially update profile details (name, email, role, etc.).',
  })
  @ZodResponse({ type: PatchAdminInfoResponse, status: HttpStatus.OK })
  patchAdminInfo(
    @Param('adminId') _adminId: string,
    @Body() _body: PatchAdminInfoRequest,
  ): Promise<PatchAdminInfoResponse> {
    throw new Error('Not implemented');
  }

  @Post(':adminId/change-password')
  @ApiOperation({
    summary: 'Reset password',
    description: "Force-reset another admin's password and issue a temporary password.",
  })
  @ZodResponse({ type: ResetAdminPasswordResponse, status: HttpStatus.OK })
  resetAdminPassword(@Param('adminId') _adminId: string): Promise<ResetAdminPasswordResponse> {
    throw new Error('Not implemented');
  }

  @Post(':adminId/reset-tfa')
  @ApiOperation({
    summary: 'Reset 2FA secret',
    description: 'Clear the 2FA registration so the target admin can re-enroll.',
  })
  @ZodResponse({ type: ResetAdminTfaResponse, status: HttpStatus.OK })
  resetAdminTfa(@Param('adminId') _adminId: string): Promise<ResetAdminTfaResponse> {
    throw new Error('Not implemented');
  }

  @Patch(':adminId/status')
  @ApiOperation({
    summary: 'Freeze / unfreeze account',
    description: 'Toggle or set the account status (e.g. active, suspended).',
  })
  @ZodResponse({ type: UpdateAdminStatusResponse, status: HttpStatus.OK })
  updateAdminStatus(
    @Param('adminId') _adminId: string,
    @Body() _body: UpdateAdminStatusRequest,
  ): Promise<UpdateAdminStatusResponse> {
    throw new Error('Not implemented');
  }
}
