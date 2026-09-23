import { Body, Controller, Get, HttpStatus, Injectable, Post, Req, Res } from '@nestjs/common';
import { ApiErrorResponse } from '@framework/swagger';
import {
  LoginRequest,
  LoginResponse,
  VerifyTfaRequest,
  VerifyTfaResponse,
  GetLarkLoginUrlResponse,
  LarkLoginCallbackRequest,
} from './auth.dto';
import { ZodResponse } from 'nestjs-zod';
import { ApiOperation } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { addMinutes } from 'date-fns';
import { ApiResponseMfaToken } from './auth.decorator';

@Injectable()
@Controller({ version: '1', path: 'auth' })
@ApiErrorResponse()
export class AuthController {
  constructor() {}

  @Post('login')
  @ApiOperation({
    summary: 'Login with username',
    description: 'Allow user to login with username/password.',
  })
  @ZodResponse({ type: LoginResponse, status: HttpStatus.OK })
  @ApiResponseMfaToken()
  async loginWithUsername(
    @Body() body: LoginRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponse> {
    this._setMfaTokenCookie(response, '1');

    // set mfaToken in cookie server only path
    return {
      isTfaEnabled: true,
      tfaSecret: 'xxxxxx',
    };
  }

  @Get('lark/login')
  @ApiOperation({
    summary: 'Get Lark Login Url',
    description: 'Allow user to signin via Lark OAuth2',
  })
  @ZodResponse({ type: GetLarkLoginUrlResponse, status: HttpStatus.OK })
  async getLarkLoginUrl(): Promise<GetLarkLoginUrlResponse> {
    return {
      redirectUrl: 'https://',
    };
  }

  @Post('lark/callback')
  @ApiOperation({
    summary: 'Login with Lark OAuth2',
    description: 'Allow user to login with Lark OAuth2',
  })
  @ApiResponseMfaToken()
  @ZodResponse({ type: LoginResponse, status: HttpStatus.OK })
  async processLarkLoginCallback(
    @Body() body: LarkLoginCallbackRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponse> {
    // set mfaToken in cookie server only path
    this._setMfaTokenCookie(response, '1');
    return {
      isTfaEnabled: true,
      tfaSecret: 'xxxxx',
    };
  }

  @ApiOperation({
    summary: 'Verify TFA',
    description: 'Verify TFA code after initial login.',
  })
  @Post('tfa/verify')
  @ZodResponse({ type: VerifyTfaResponse, status: HttpStatus.OK })
  async verifyTfa(
    @Body() body: VerifyTfaRequest,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<VerifyTfaResponse> {
    const mfaToken = request.cookies['mfaToken'];

    // Set a long-lived refreshToken
    response.cookie('refreshToken', '1', {
      path: '/tfa/verify',
      secure: true,
      httpOnly: true,
      expires: addMinutes(new Date(), 30),
    });

    return {
      accessToken: '',
    };
  }

  @ApiOperation({
    summary: 'Refresh token',
    description: 'Generate new access token with refresh token (cookie).',
  })
  @Post('refresh')
  async refreshToken() {}

  @ApiOperation({
    summary: 'Logout',
    description: 'Logout the user and invalidate the access token and refresh token.',
  })
  @Post('logout')
  async logout() {
    // remove access token from cookie
    // remove refresh token from store
  }

  private _setMfaTokenCookie(response: Response, token: string) {
    response.cookie('mfaToken', token, {
      path: '/tfa/verify',
      secure: true,
      httpOnly: true,
      expires: addMinutes(new Date(), 5),
    });
  }
}
