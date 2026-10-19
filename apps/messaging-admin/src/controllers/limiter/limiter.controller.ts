import { Body, Controller, Get, HttpStatus, Injectable, Param, Patch, Post } from '@nestjs/common';
import { ApiErrorResponse } from '@framework/swagger';
import { ZodResponse } from 'nestjs-zod';
import { ApiOperation } from '@nestjs/swagger';
import { LimiterPoolService } from '@application/modules/limiter';
import {
  CreateLimiterPoolRequest,
  GetLimiterPoolListResponse,
  PatchLimiterPoolRequest,
  PatchLimiterPoolStatusRequest,
} from './limiter.dto';

@Injectable()
@Controller({ version: '1', path: 'limiter' })
@ApiErrorResponse()
export class LimiterController {
  constructor(private readonly limiterPoolService: LimiterPoolService) {}

  @Get('pools')
  @ApiOperation({
    summary: 'Get limiter pool list',
    description: 'Retrieve limiter pools with their rules and status.',
  })
  @ZodResponse({ type: [GetLimiterPoolListResponse], status: HttpStatus.OK })
  async getLimiterPoolList(): Promise<GetLimiterPoolListResponse[]> {
    const pools = await this.limiterPoolService.getAllPools();

    return pools.map((pool) => ({
      ...pool,
      createdAt: pool.createdAt.toISOString(),
      updatedAt: pool.updatedAt.toISOString(),
    }));
  }

  @Post('pools')
  @ApiOperation({
    summary: 'Create limiter pool',
    description: 'Create a limiter pool. New pools start disabled, accounts using them are blocked until enabled.',
  })
  async createLimiterPool(@Body() body: CreateLimiterPoolRequest): Promise<void> {
    await this.limiterPoolService.addPool(body);
  }

  @Patch('pools/:id')
  @ApiOperation({
    summary: 'Patch limiter pool',
    description: 'Partially update a limiter pool (name, rules). Workers pick up the change immediately.',
  })
  async patchLimiterPool(@Param('id') id: string, @Body() body: PatchLimiterPoolRequest): Promise<void> {
    await this.limiterPoolService.updatePool(id, body);
  }

  @Patch('pools/:id/status')
  @ApiOperation({
    summary: 'Enable or disable limiter pool',
    description: 'A disabled pool blocks every account that uses it.',
  })
  async patchLimiterPoolStatus(@Param('id') id: string, @Body() body: PatchLimiterPoolStatusRequest): Promise<void> {
    await this.limiterPoolService.updateStatus(id, body.isEnabled);
  }
}
