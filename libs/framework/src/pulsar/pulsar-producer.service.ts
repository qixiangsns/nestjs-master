import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Client, Producer, type ProducerConfig } from 'pulsar-client';

type Config = Omit<ProducerConfig, 'topic'>;

export abstract class PulsarProducerService implements OnModuleDestroy, OnModuleInit {
  protected abstract logger: Logger;
  private readonly producers = new Map<string, Producer>();

  constructor(
    private readonly client: Client,
    private readonly initTopics: string[],
    private readonly config?: Config,
  ) {}

  public isConnected() {
    const producerList = Array.from(this.producers.values());
    const isDisconnected = producerList.some((producer) => !producer.isConnected());
    return !isDisconnected;
  }

  private async initializeProducers() {
    for (const topic of this.initTopics) {
      await this.createProducer(topic);
    }
  }

  async onModuleInit() {
    await this.initializeProducers();
  }

  async onModuleDestroy() {
    for (const producer of this.producers.values()) {
      await producer.close();
    }
  }

  protected async produce(topic: string, message: any) {
    const producer = await this.createProducer(topic);

    this.logger.log({ message, topic }, 'Producing message');
    await producer.send({
      data: Buffer.from(JSON.stringify(message)),
    });
  }

  private async createProducer(topic: string) {
    let producer = this.producers.get(topic);
    if (!producer) {
      producer = await this.client.createProducer({
        topic,
        ...this.config,
      });

      this.logger.log(`${this.constructor.name} - Producer for topic [${topic}] created`);
      this.producers.set(topic, producer);
    }
    return producer;
  }
}
