import { Injectable } from '@nestjs/common';
import { ViberLogRepository } from '../repositories/viber-log.repository';
import { DeliveryStatus, ViberLog } from '../models/viber-log.model';

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
    this.logRepository.batchInsert(logs);
  }

  async findLogs() {}

  async updateMessageDelivery(referenceId: string, deliveryStatus: DeliveryStatus) {
    this.logRepository.updateByReferenceId(referenceId, { deliveryStatus });
  }
}
