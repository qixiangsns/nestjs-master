import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoSchemaModule } from './schemas';
import { ViberAccountRepository } from './repositories/viber-account.repository';
import { ViberAccountService } from './services/viber-account.service';

const Repositories = [ViberAccountRepository];
const Services = [ViberAccountService];
const Providers = [ViberAccountService];

@Module({
  imports: [MongoSchemaModule],
  exports: [...Services],
  providers: [...Repositories, ...Providers],
})
export class ViberModule {}
