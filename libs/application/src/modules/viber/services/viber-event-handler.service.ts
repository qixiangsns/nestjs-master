import { Injectable, Logger } from '@nestjs/common';
import { ViberEventService } from './viber-event.service';
import { ViberLogService } from './viber-log.service';

@Injectable()
export class ViberEventHandler {
  protected logger = new Logger(ViberEventHandler.name);

  constructor(
    private readonly eventService: ViberEventService,
    private readonly logService: ViberLogService,
  ) {}

  async handleOtpRequested(payload?: any): Promise<void> {
    // this.eventService.publishLogCreated({});s
  }
  async handleMktRequested(payload?: any): Promise<void> {
    // this.eventService.publishLogCreated({});
  }
  async handleNotifRequested(payload?: any): Promise<void> {
    // this.eventService.publishLogCreated({});
  }
  async handleLogsCreated(logs: any[]): Promise<void> {
    await this.logService.batchSave(logs);
  }

  async handleDeliveryUpdated(payload?: any): Promise<void> {
    await this.logService.updateMessageDelivery(payload.id, 'Delivered');
  }
}
