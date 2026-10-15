import { PULSAR_CONN_TOKEN } from '@application/connnections';
import { ViberLogTopic } from '@application/modules/viber/events/viber-log.events';
import { Inject, Injectable, OnModuleInit, OnApplicationShutdown, Logger } from '@nestjs/common';
import { Client, Consumer, ConsumerConfig, Message } from 'pulsar-client';
import PQueue from 'p-queue';
import { ViberLogService } from '@application/modules/viber';
import { ViberLog } from '@application/modules/viber/models/viber-log.model';

@Injectable()
export class ViberLogConsumerService implements OnModuleInit, OnApplicationShutdown {
  private logger = new Logger(ViberLogConsumerService.name);
  private isConsuming: boolean = false;
  private queue = new PQueue({ concurrency: 1 });
  private consumer: Consumer;

  constructor(
    @Inject(PULSAR_CONN_TOKEN.PRIMARY) private readonly pulsarClient: Client,
    private readonly logService: ViberLogService,
  ) {}

  async onModuleInit() {
    await this.subscribe();
    this.start();
  }

  async onApplicationShutdown(signal?: string) {
    this.logger.log({ receivedAt: new Date(), signal }, 'Received shutdown signal at ');
    this.pause();
    // Wait for tasks to finish running
    await this.queue.onIdle();

    await this.unsubscribe();
    this.logger.log({ finishedAt: new Date() }, 'Finished processing');
  }

  private async unsubscribe() {
    await this.consumer.unsubscribe();
  }
  private async start() {
    this.isConsuming = true;
    while (true) {
      if (!this.isConsuming) return;

      const logs = await this.consumeBatch();
      this.queue.add(() => this.logService.batchSave(logs));
      await this.queue.onSizeLessThan(this.queue.concurrency);
    }
  }

  private async pause() {
    this.isConsuming = false;
  }

  private async subscribe() {
    const config: ConsumerConfig = {
      topic: ViberLogTopic.LogCreated,
      subscription: 'viber-log-consumer',
      subscriptionType: 'Shared',
      batchReceivePolicy: {
        maxNumMessages: 100,
        maxNumBytes: 8_000_000, //8 mb
        timeoutMs: 1500,
      },
      batchIndexAckEnabled: true,
    };

    this.consumer = await this.pulsarClient.subscribe(config);
    this.logger.log(config, 'Connected to consumer');
  }

  private async consumeBatch(): Promise<ViberLog[]> {
    const logs: ViberLog[] = [];
    const messages = await this.consumer.batchReceive();
    for (const message of messages) {
      try {
        const log: ViberLog = JSON.parse(message.getData().toString());
        logs.push(log);
      } catch (error) {
        this.logger.error('Failed to parse viber log');
      }
      await this.consumer.acknowledge(message);
    }
    return logs;
  }
}
