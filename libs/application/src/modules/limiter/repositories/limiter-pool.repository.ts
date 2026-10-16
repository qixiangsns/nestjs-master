import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Except } from 'type-fest';
import { Lean } from '@framework/mongoose';
import { MONGO_CONN_NAME } from '@application/connnections';
import { LimiterPool as LimiterPoolModel } from '../schemas/limiter-pool.schema';
import { LimiterPool } from '../models/limiter-pool.model';

@Injectable()
export class LimiterPoolRepository {
  constructor(
    @InjectModel(LimiterPoolModel.name, MONGO_CONN_NAME.PRIMARY)
    private model: Model<LimiterPoolModel>,
  ) {}

  async getAllPools(): Promise<LimiterPool[]> {
    const pools = await this.model.find().lean<Lean<LimiterPoolModel>[]>();
    return pools.map((pool) => ({ ...pool, id: pool._id.toString() }));
  }

  async findPool(id: string): Promise<LimiterPool | null> {
    const pool = await this.model.findById(new Types.ObjectId(id)).lean<Lean<LimiterPoolModel>>();
    return pool ? { ...pool, id: pool._id.toString() } : null;
  }

  async findPoolByName(name: string): Promise<LimiterPool | null> {
    const pool = await this.model.findOne({ name }).lean<Lean<LimiterPoolModel>>();
    return pool ? { ...pool, id: pool._id.toString() } : null;
  }

  async findPools(ids: string[]): Promise<LimiterPool[]> {
    const pools = await this.model
      .find({ _id: { $in: ids.map((id) => new Types.ObjectId(id)) } })
      .lean<Lean<LimiterPoolModel>[]>();
    return pools.map((pool) => ({ ...pool, id: pool._id.toString() }));
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
