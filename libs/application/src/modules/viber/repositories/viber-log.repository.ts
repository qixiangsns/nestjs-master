import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, QueryFilter, mongo } from 'mongoose';
import { VIBER_LOG_MODEL, ViberLogEntity } from '../schemas/viber-log.schema';
import { MONGO_CONN_NAME } from '@application/connections';
import { ViberLogFilterDto, ViberLog } from '../models/viber-log.model';

export type BatchInsertResult = { savedIds: string[]; failedIds: string[] };

@Injectable()
export class ViberLogRepository {
  private logger = new Logger(ViberLogRepository.name);
  constructor(
    @InjectModel(VIBER_LOG_MODEL, MONGO_CONN_NAME.PRIMARY)
    private logModel: Model<ViberLogEntity>,
  ) {}

  async findLogs(filterDto: ViberLogFilterDto, page: number, pageSize: number) {
    const filter: QueryFilter<ViberLogEntity> = {
      createdAt: { $gte: filterDto.startTime, $lte: filterDto.endTime },
    };

    if (filterDto.campaignId) {
      filter.campaignId = { $eq: filterDto.campaignId };
    }

    if (filterDto.deliveryStatus) {
      filter.deliveryStatus = { $eq: filterDto.deliveryStatus };
    }

    if (filterDto.requestStatus) {
      filter.requestStatus = { $eq: filterDto.requestStatus };
    }

    if (filterDto.type) {
      filter.type = { $eq: filterDto.type };
    }

    const [logs, total] = await Promise.all([
      this.logModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.logModel.countDocuments(filter),
    ]);

    return {
      items: logs.map((log) => ({ ...log, id: log._id.toString() })),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async updateByReferenceId(referenceId: string, log: Partial<ViberLog>) {
    await this.logModel.updateOne({ refId: referenceId }, log);
  }

  async batchInsert(logs: ViberLog[]): Promise<BatchInsertResult> {
    const newLogs = logs.map((log) => {
      const { id, ...data } = log; //exclude
      return {
        _id: new Types.ObjectId(id),
        ...data,
      };
    });

    const inserted: { _id: Types.ObjectId }[] = await this.logModel
      .insertMany(newLogs, { ordered: false })
      .catch(async (error: unknown) => {
        if (!(error instanceof mongo.MongoBulkWriteError)) throw error;
        return this.logModel.find({ _id: { $in: newLogs.map((log) => log._id) } }, { _id: 1 });
      });

    const savedIds = inserted.map((doc) => doc._id.toString());
    const failedIds = logs.map((log) => log.id).filter((id) => !savedIds.includes(id));
    return { savedIds, failedIds };
  }

  generateId() {
    return new Types.ObjectId().toString();
  }
}
