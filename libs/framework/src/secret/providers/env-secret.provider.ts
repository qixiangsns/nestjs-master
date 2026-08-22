import { SecretProvider } from '../interface/provider.interface';
import { Logger } from '@nestjs/common';
import * as fs from 'node:fs';

export class EnvSecretProvider implements SecretProvider {
  private logger = new Logger('EnvSecretProvider');
  constructor(private readonly envFilePath?: string[]) {}
  get() {
    // Load all default environment variables
    if (fs.existsSync('.env')) {
      process.loadEnvFile();
    }

    // Load environment variables from file if provided
    if (this.envFilePath) {
      for (const filePath of this.envFilePath) {
        if (!fs.existsSync(filePath)) {
          this.logger.warn(`Environment file ${filePath} not found`);
        } else {
          process.loadEnvFile(filePath);
        }
      }
    }

    return process.env;
  }
}
