import { Controller, HttpStatus, Injectable, Get, Param, Query } from '@nestjs/common';
import { ApiErrorResponse } from '@framework/swagger';
import { GameWinlossRequest, GameWinlossResponse } from './dtos/data-report.dto';
import { ZodResponse } from 'nestjs-zod';
import { ApiOperation } from '@nestjs/swagger';

@Injectable()
@Controller({
  version: '1',
  path: 'data-report',
})
@ApiErrorResponse()
export class DataReportController {
  constructor() {}

  @Get('game-winloss')
  @ApiOperation({
    summary: 'Get game win/loss Report',
    description: 'Get provider/game win/loss report with lowest ggr',
  })
  @ZodResponse({ type: GameWinlossResponse, status: HttpStatus.OK })
  async login(@Query() query: GameWinlossRequest) {
    return {
      token: `1234567890ABCDEFGHI`,
      expiresAt: new Date(),
    };
  }
}
