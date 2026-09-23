import { Injectable } from '@nestjs/common';

@Injectable()
export class SmsRouterService {
  getHello(): string {
    return 'Hello World!';
  }
}
