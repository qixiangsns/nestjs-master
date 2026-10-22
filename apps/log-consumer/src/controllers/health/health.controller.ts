import { Controller, Get, Inject, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ApiExcludeController } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService, MongooseHealthIndicator } from '@nestjs/terminus';
import { Redis } from 'ioredis';
import { Connection } from 'mongoose';
import { MONGO_CONN_NAME, REDIS_SUBSCRIBER_TOKEN, REDIS_TOKEN } from '@application/connections';
import { RedisHealthIndicator } from '@framework/health';

const CHECK_TIMEOUT_MS = 1000;

@Injectable()
@Controller('health')
@ApiExcludeController()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongoose: MongooseHealthIndicator,
    private readonly redis: RedisHealthIndicator,
    @InjectConnection(MONGO_CONN_NAME.PRIMARY) private readonly mongoConnection: Connection,
    @Inject(REDIS_TOKEN.PRIMARY) private readonly redisClient: Redis,
    @Inject(REDIS_SUBSCRIBER_TOKEN.PRIMARY) private readonly redisSubscriber: Redis,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.mongoose.pingCheck('mongo', { connection: this.mongoConnection }).withTimeout(CHECK_TIMEOUT_MS),
      () => this.redis.pingCheck('redis', this.redisClient).withTimeout(CHECK_TIMEOUT_MS),
      () => this.redis.pingCheck('redis-subscriber', this.redisSubscriber).withTimeout(CHECK_TIMEOUT_MS),
    ]);
  }
}
