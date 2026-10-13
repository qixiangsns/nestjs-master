import { Injectable } from '@nestjs/common';
import { ViberProviderCode } from '../models/viber-provider.model';
import { ViberAccountRepository } from '../repositories/viber-account.repository';
import { ViberAccount } from '../models/viber-account.model';

@Injectable()
export class ViberAccountService {
  constructor(private readonly accountRepo: ViberAccountRepository) {}

  async findEnabledAccountsByProvider(code: ViberProviderCode) {
    return this.accountRepo.findEnabledAccountsByProvider(code);
  }

  async findAccount(id: string): Promise<ViberAccount | null> {
    return this.accountRepo.findAccount(id);
  }
}
