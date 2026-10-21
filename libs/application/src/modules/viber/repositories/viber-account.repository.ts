import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  VIBER_ACCOUNT_MODEL,
  VIBER_ACCOUNT_API_TOKEN_MODEL,
  VIBER_ACCOUNT_API_KEY_SECRET_MODEL,
  ViberAccountBaseEntity,
  ViberAccountApiTokenEntity,
  ViberAccountApiKeySecretEntity,
  type ViberAccountEntity,
} from '../schemas/viber-account.schema';
import {
  ViberAccount,
  ViberAccountApiKeySecret,
  ViberAccountApiToken,
  ViberAccountBase,
} from '../models/viber-account.model';
import { MONGO_CONN_NAME } from '@application/connections';
import { Except } from 'type-fest';
import { Lean } from '@framework/mongoose';
import { ViberProviderCode } from '../models/viber-provider.model';

@Injectable()
export class ViberAccountRepository {
  private logger = new Logger(ViberAccountRepository.name);
  constructor(
    @InjectModel(VIBER_ACCOUNT_MODEL, MONGO_CONN_NAME.PRIMARY)
    private accountModel: Model<ViberAccountBaseEntity>,

    @InjectModel(VIBER_ACCOUNT_API_TOKEN_MODEL, MONGO_CONN_NAME.PRIMARY)
    private accountApiTokenModel: Model<ViberAccountApiTokenEntity>,

    @InjectModel(VIBER_ACCOUNT_API_KEY_SECRET_MODEL, MONGO_CONN_NAME.PRIMARY)
    private accountApiKeySecretModel: Model<ViberAccountApiKeySecretEntity>,
  ) {}

  async getAllAccount(): Promise<ViberAccount[]> {
    const accounts = await this.accountModel.find().lean<Lean<ViberAccountEntity>[]>();
    return accounts.map((acc) => ({ ...acc, id: acc._id.toString(), limiterPoolId: acc.limiterPoolId.toString() }));
  }

  async findAccount(id: string): Promise<ViberAccount | null> {
    const acc = await this.accountModel.findById(new Types.ObjectId(id)).lean<Lean<ViberAccountEntity>>();
    return acc ? { ...acc, id: acc._id.toString(), limiterPoolId: acc.limiterPoolId.toString() } : null;
  }

  async findAccounts(ids: string[]) {
    return this.accountModel.find({ _id: { $in: ids.map((id) => new Types.ObjectId(id)) } }).lean();
  }

  async findEnabledAccountsByProvider(code: ViberProviderCode): Promise<ViberAccount[]> {
    const accounts = await this.accountModel
      .find({ providerCode: code, isEnabled: true })
      .lean<Lean<ViberAccountEntity>[]>();
    return accounts.map((acc) => ({ ...acc, id: acc._id.toString(), limiterPoolId: acc.limiterPoolId.toString() }));
  }

  async addApiKeySecretAcc(account: Except<ViberAccountApiKeySecret, 'id' | 'createdAt' | 'updatedAt'>) {
    const acc = new this.accountApiKeySecretModel(account);
    acc.type = 'ApiKeySecret';
    await acc.save();
  }

  async addApiTokenAcc(account: Except<ViberAccountApiToken, 'id' | 'createdAt' | 'updatedAt'>) {
    const acc = new this.accountApiTokenModel(account);
    acc.type = 'ApiToken';
    await acc.save();
  }

  async updateAccount(id: string, account: Partial<Except<ViberAccountBase, 'id' | 'createdAt' | 'updatedAt'>>) {
    await this.accountModel.updateOne({ _id: new Types.ObjectId(id) }, account);
  }

  /**
   * @returns true if the status was changed
   */
  async updateStatus(id: string, isEnabled: boolean): Promise<boolean> {
    const result = await this.accountModel.updateOne(
      { _id: new Types.ObjectId(id), isEnabled: { $ne: isEnabled } },
      { isEnabled },
    );
    return result.modifiedCount > 0;
  }
}
