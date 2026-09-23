import { Injectable } from '@nestjs/common';

@Injectable()
export class SmsConsumerPldtSmppService {
  getHello(): string {
    return 'Hello World!';
  }
}
