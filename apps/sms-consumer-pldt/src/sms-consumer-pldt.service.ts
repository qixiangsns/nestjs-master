import { Injectable } from '@nestjs/common';

@Injectable()
export class SmsConsumerPldtService {
  getHello(): string {
    return 'Hello World!';
  }
}
