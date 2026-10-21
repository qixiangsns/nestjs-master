import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { Except } from 'type-fest';
import { MONGO_CONN_NAME } from '@application/connections';
import { LimiterPool as LimiterPoolModel } from '../schemas/limiter-pool.schema';
import { LimiterPool } from '../models/limiter-pool.model';

@Injectable()
export class LimiterPoolRepository {
  constructor(
    @InjectModel(LimiterPoolModel.name, MONGO_CONN_NAME.PRIMARY)
    private model: Model<LimiterPoolModel>,
  ) {}

  async getAllPools(): Promise<LimiterPool[]> {
    const pools = await this.model.find().lean();
    return pools.map((pool) => ({ ...pool, id: pool._id.toString() }));
  }

  async findPool(id: string): Promise<LimiterPool | null> {
    if (!isValidObjectId(id)) return null;
    const pool = await this.model.findById(new Types.ObjectId(id)).lean();
    return pool ? { ...pool, id: pool._id.toString() } : null;
  }

  async findPoolByName(name: string): Promise<LimiterPool | null> {
    const pool = await this.model.findOne({ name }).lean();
    return pool ? { ...pool, id: pool._id.toString() } : null;
  }

  async addPool(pool: Except<LimiterPool, 'id' | 'createdAt' | 'updatedAt'>) {
    await this.model.create(pool);
  }

  async updatePool(id: string, pool: Partial<Except<LimiterPool, 'id' | 'createdAt' | 'updatedAt'>>) {
    await this.model.updateOne({ _id: new Types.ObjectId(id) }, pool);
  }

  async updateStatus(id: string, isEnabled: boolean) {
    await this.model.updateOne({ _id: new Types.ObjectId(id) }, { isEnabled });
  }
}
