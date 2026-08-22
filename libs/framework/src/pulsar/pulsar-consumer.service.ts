import { Logger, OnModuleDestroy } from '@nestjs/common';
import { nextTick } from 'process';
import { Client, Consumer, ConsumerConfig, Message } from 'pulsar-client';
import { ZodError } from 'zod';

export abstract class PulsarConsumer<T> implements OnModuleDestroy {
  protected abstract logger: Logger;
  private consumer: Consumer;
  protected running = false;

  constructor(
    private readonly client: Client,
    private readonly config: ConsumerConfig,
  ) {}

  async onModuleDestroy() {
    this.running = false;
    await this.consumer.close();
  }

  public async connect() {
    this.consumer = await this.client.subscribe(this.config);
    this.running = true;
    this.logger.log(`${this.constructor.name} - Consumer for topic [${this.config.topic}] created`);
    nextTick(this.consume.bind(this));
  }

  public isConnected() {
    return this.running && this.consumer.isConnected();
  }

  private async consume() {
    while (this.running) {
      try {
        const messages = await this.consumer.batchReceive();
        await Promise.allSettled(messages.map((message) => this.receive(message)));
      } catch (err) {
        this.logger.error('Error receiving batch.', err);
      }
    }
  }

  private async receive(message: Message) {
    const ackMessage = () => this.consumer.acknowledge(message);
    this.handleMessage(
      JSON.parse(message.getData().toString()),
      ackMessage,
      message.getMessageId().toString(),
    ).catch((err) => {
      if (err instanceof ZodError) {
        this.logger.error(
          {
            err: err.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(''),
          },
          'Invalid event schema',
        );
      } else if (err instanceof Error) {
        this.logger.error({ err }, 'Error handling message.');
      } else {
        this.logger.error('Error handling message.');
      }
    });

    try {
      await ackMessage();
    } catch (err) {
      this.logger.error('Error acknowledging.', err);
    }
  }

  protected abstract handleMessage(
    data: T,
    ackMessage: () => Promise<null>,
    messageId: string,
  ): Promise<any>;
}
