import { Body, Controller, HttpStatus, Injectable, Post } from '@nestjs/common';
import { ApiErrorResponse } from '@framework/swagger';
import { LoginRequest, LoginResponse } from './dtos/auth.dto';
import { ZodResponse } from 'nestjs-zod';
import { ApiOperation } from '@nestjs/swagger';

@Injectable()
@Controller({
  version: '1',
  path: 'auth',
})
@ApiErrorResponse()
export class AuthController {
  constructor() {}

  @Post('login')
  @ApiOperation({
    summary: 'Login with credentials',
    description: 'Allow user to login with username and password.',
  })
  @ZodResponse({ type: LoginResponse, status: HttpStatus.OK })
  async login(@Body() body: LoginRequest) {
    return {
      token: '1234567890',
      expiresAt: new Date().toISOString(),
    };
  }

  @ApiOperation({
    summary: 'Verify TFA',
    description: 'Verify TFA code after initial login.',
  })
  @Post('tfa/verify')
  async verifyTfa() {}

  @ApiOperation({
    summary: 'Refresh token',
    description: 'Generate new access token with refresh token (cookie).',
  })
  @Post('refresh-token')
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
}
