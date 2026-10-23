import { Logger } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';
import { ViberSeeder } from '../seeds/viber/viber.seeder.js';

@Command({ name: 'seed', description: 'Seed reference data' })
export class SeedCommand extends CommandRunner {
  private readonly logger = new Logger(SeedCommand.name);

  constructor(private readonly viberSeeder: ViberSeeder) {
    super();
  }

  async run(): Promise<void> {
    await this.viberSeeder.seed();
    this.logger.log('Seed completed');
  }
}
