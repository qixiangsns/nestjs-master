import { Injectable, OnApplicationShutdown, Logger } from '@nestjs/common';
import PQueue from 'p-queue';
import { Cron, CronExpression } from '@nestjs/schedule';
import { sleep } from 'radash';
import { trace, type Span } from '@opentelemetry/api';
import { ActiveSpan, TraceJob } from '@framework/trace/index.js';

const tracer = trace.getTracer('cron-service');

@Injectable()
export class CronService implements OnApplicationShutdown {
  private logger = new Logger(CronService.name);
  private queue = new PQueue({ concurrency: 20 });

  @Cron(CronExpression.EVERY_5_SECONDS)
  @TraceJob({ name: 'check-balance', tracer })
  async checkBalance(@ActiveSpan() span?: Span) {
    span?.setAttributes({
      'cron.queue.pending': this.queue.pending,
      'cron.queue.size': this.queue.size,
    });

    await this.queue.add(async () => {
      await sleep(1000);
      this.logger.log('Cron executed', { executedAt: new Date() });
    });
  }

  async onApplicationShutdown(signal?: string) {
    this.logger.log('Received signal', { receivedAt: new Date(), signal });
    await this.queue.onIdle();
    this.logger.log('Finished signal', { finishedAt: new Date(), signal });
  }
}
