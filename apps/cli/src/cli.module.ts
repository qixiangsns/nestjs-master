import { Module } from '@nestjs/common';
import { ApplicationModule } from '@application';
import { SeedCommand } from './commands/seed.command';
import { ViberSeeder } from './seeds/viber/viber.seeder';

@Module({
  imports: [ApplicationModule],
  providers: [SeedCommand, ViberSeeder],
})
export class CliModule {}
