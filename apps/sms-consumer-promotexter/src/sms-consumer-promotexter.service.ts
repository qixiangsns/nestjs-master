import { Injectable } from '@nestjs/common';

@Injectable()
export class SmsConsumerPromotexterService {
  getHello(): string {
    return 'Hello World!';
  }
}
