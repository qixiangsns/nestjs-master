import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, QueryFilter } from 'mongoose';
import { ViberLog as ViberLogModel } from '../schemas/viber-log.schema';
import { MONGO_CONN_NAME } from '@application/connnections';
import { Except } from 'type-fest';
import { DeliveryStatus, ViberLogFilterDto, ViberLog } from '../models/viber-log.model';

@Injectable()
export class ViberLogRepository {
  private logger = new Logger(ViberLogRepository.name);
  constructor(
    @InjectModel(ViberLogModel.name, MONGO_CONN_NAME.PRIMARY)
    private logModel: Model<ViberLogModel>,
  ) {}

  async findLogs(filterDto: Partial<ViberLogFilterDto>): Promise<Except<ViberLog, 'phoneNo'>[]> {
    let filter: QueryFilter<ViberLogModel> = {};
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

    const logs = await this.logModel.find(filter).lean();
    return logs.map((log) => ({ ...log, id: log._id.toString() }));
  }

  async updateByReferenceId(referenceId: string, log: Partial<ViberLog>) {
    await this.logModel.updateOne({ refId: referenceId }, log);
  }

  async batchInsert(logs: ViberLog[]) {
    const newLogs = logs.map((log) => {
      const { id, ...data } = log; //exclude
      return {
        _id: new Types.ObjectId(id),
        ...data,
      };
    });

    await this.logModel.insertMany(newLogs);
  }

  generateId() {
    return new Types.ObjectId().toString();
  }
}
