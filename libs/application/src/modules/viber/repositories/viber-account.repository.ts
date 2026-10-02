import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ViberAccountBase as ViberAccountBaseModel,
  ViberAccountApiToken as ViberAccountApiTokenModel,
  ViberAccountApiKeySecret as ViberAccountApiKeySecretModel,
  type ViberAccount as ViberAccountModel,
} from '../schemas/viber-account.schema';
import { ViberAccount, ViberAccountApiKeySecret, ViberAccountApiToken } from '../models/viber-account.model';
import { MONGO_CONN_NAME } from '@application/connnections';
import { Except } from 'type-fest';
import { Lean } from '@framework/mongoose';

@Injectable()
export class ViberAccountRepository {
  private logger = new Logger(ViberAccountRepository.name);
  constructor(
    @InjectModel(ViberAccountBaseModel.name, MONGO_CONN_NAME.PRIMARY)
    private accountModel: Model<ViberAccountBaseModel>,

    @InjectModel(ViberAccountApiTokenModel.name, MONGO_CONN_NAME.PRIMARY)
    private accountApiTokenModel: Model<ViberAccountApiTokenModel>,

    @InjectModel(ViberAccountApiKeySecretModel.name, MONGO_CONN_NAME.PRIMARY)
    private accountApiKeySecretModel: Model<ViberAccountApiKeySecretModel>,
  ) {}

  async getAllAccount(): Promise<ViberAccount[]> {
    const accounts = await this.accountModel.find().lean<Lean<ViberAccountModel>[]>();
    return accounts.map((acc) => ({ ...acc, id: acc._id.toString() }));
  }

  async addApiKeySecretAcc(account: Except<ViberAccountApiKeySecret, 'id' | 'createdAt' | 'updatedAt'>) {
    const acc = new this.accountApiKeySecretModel(account);
    acc.type = 'ApiKeySecret';
    await acc.save();
  }

  async addApiTokenAcc(account: Except<ViberAccountApiToken, 'id' | 'createdAt' | 'updatedAt'>) {
    const acc = new this.accountApiTokenModel(account);
    acc.type = 'ApiToken';
    acc.save();
  }
}
