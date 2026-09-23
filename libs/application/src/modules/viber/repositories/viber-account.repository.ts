import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ViberAccount as ViberAccountModel } from '../schemas/viber-account.schema';
import { ViberAccount } from '../models/viber-account.model';
import { MONGO_CONN_NAME } from '@application/connnections';

@Injectable()
export class ViberAccountRepository {
  constructor(
    @InjectModel(ViberAccountModel.name, MONGO_CONN_NAME.PRIMARY)
    private model: Model<ViberAccountModel>,
  ) {}

  /**
   * Get all viber accounts
   */
  async getAllForDisplay(): Promise<ViberAccount[]> {
    const accounts = await this.model.find().select({ credential: -1 }).lean();

    return accounts.map((acc) => ({
      ...acc,
      id: acc._id.toString(),
    }));
  }
}
