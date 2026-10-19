import { Injectable } from '@nestjs/common';
import { ViberLogRepository } from '../repositories/viber-log.repository';
import { DeliveryStatus, ViberLog } from '../models/viber-log.model';
import { GetViberLogListRequest } from '../dtos/viber-logs.dto';

@Injectable()
/**
 * Retrieve/save/find viber logs
 */
export class ViberLogService {
  constructor(private readonly logRepository: ViberLogRepository) {}

  generateId() {
    return this.logRepository.generateId();
  }

  async batchSave(logs: ViberLog[]) {
    await this.logRepository.batchInsert(logs);
  }

  async findLogs({ page, pageSize, startTime, endTime, ...filter }: GetViberLogListRequest) {
    const filterDto = { ...filter, startTime: new Date(startTime), endTime: new Date(endTime) };

    return this.logRepository.findLogs(filterDto, page, pageSize);
  }

  async updateMessageDelivery(referenceId: string, deliveryStatus: DeliveryStatus) {
    await this.logRepository.updateByReferenceId(referenceId, { deliveryStatus });
  }
}
