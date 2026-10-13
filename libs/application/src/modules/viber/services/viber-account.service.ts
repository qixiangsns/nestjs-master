import { Injectable } from '@nestjs/common';
import { ViberProviderCode } from '../models/viber-provider.model';
import { ViberAccountRepository } from '../repositories/viber-account.repository';

@Injectable()
export class ViberAccountService {
  constructor(private readonly accountRepo: ViberAccountRepository) {}

  async findEnabledAccountsByProvider(code: ViberProviderCode) {
    return this.accountRepo.findEnabledAccountsByProvider(code);
  }
}
