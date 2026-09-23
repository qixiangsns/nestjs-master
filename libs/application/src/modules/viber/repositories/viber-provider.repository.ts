import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ViberProvider as ViberProviderModel } from '../schemas/viber-provider.schema';
import { ViberProvider, ViberProviderCode } from '../models/viber-provider.model';
import { MONGO_CONN_NAME } from '@application/connnections';

@Injectable()
export class ViberProviderRepository {
  constructor(
    @InjectModel(ViberProviderModel.name, MONGO_CONN_NAME.PRIMARY)
    private model: Model<ViberProviderModel>,
  ) {}

  async getAll(): Promise<ViberProvider[]> {
    const providers = await this.model.find().lean();

    return providers.map((acc) => ({
      ...acc,
      id: acc._id.toString(),
    }));
  }

  async add(provider: ViberProvider): Promise<void> {
    await this.model.insertOne(provider);
  }

  async update(id: string, provider: Partial<ViberProvider>): Promise<ViberProvider | null> {
    const objId = new Types.ObjectId(id);
    const docBeforeUpdate = await this.model.findOneAndUpdate({ _id: objId }, provider).lean();
    return docBeforeUpdate || null;
  }

  async findOne(code: ViberProviderCode): Promise<ViberProvider | null> {
    const provider = await this.model.findOne({
      code,
    });

    return provider || null;
  }
}
