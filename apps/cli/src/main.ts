import { Logger } from '@nestjs/common';
import { CommandFactory } from 'nest-commander';
import { Logger as PinoLogger } from 'nestjs-pino';
import { CliModule } from './cli.module';

async function bootstrap() {
  const app = await CommandFactory.createWithoutRunning(CliModule, {
    bufferLogs: true,
    serviceErrorHandler: (err) => {
      process.exitCode = 1;
      new Logger('Cli').error({ err }, 'Command failed');
    },
  });

  // Logging
  app.useLogger(app.get(PinoLogger));
  app.flushLogs();

  try {
    await CommandFactory.runApplication(app);
  } finally {
    await app.close();
  }
}

bootstrap();
