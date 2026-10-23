import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { VIBER_PROVIDER_MODEL, ViberProviderEntity } from '../schemas/viber-provider.schema.js';
import { ViberProvider, ViberProviderCode } from '../models/viber-provider.model.js';
import { MONGO_CONN_NAME } from '@application/connections/index.js';

@Injectable()
export class ViberProviderRepository {
  constructor(
    @InjectModel(VIBER_PROVIDER_MODEL, MONGO_CONN_NAME.PRIMARY)
    private model: Model<ViberProviderEntity>,
  ) {}

  async findProviders(): Promise<ViberProvider[]> {
    return this.model.find().lean();
  }

  async addProvider(provider: ViberProvider): Promise<void> {
    await this.model.insertOne(provider);
  }

  async updateProvider(
    id: string,
    provider: Partial<ViberProvider>,
  ): Promise<ViberProvider | null> {
    const objId = new Types.ObjectId(id);
    const docBeforeUpdate = await this.model.findOneAndUpdate({ _id: objId }, provider).lean();
    return docBeforeUpdate || null;
  }

  async upsertProvider(provider: ViberProvider): Promise<void> {
    await this.model.updateOne({ code: provider.code }, { $set: provider }, { upsert: true });
  }

  async findProvider(code: ViberProviderCode): Promise<ViberProvider | null> {
    const provider = await this.model.findOne({
      code,
    });

    return provider || null;
  }
}
