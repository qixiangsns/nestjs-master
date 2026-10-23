import { Logger } from '@nestjs/common';
import Dysmsapi, { SendMessageToGlobeRequest } from '@alicloud/dysmsapi20180501';
import { Config } from '@alicloud/openapi-client';
import { RuntimeOptions } from '@alicloud/tea-util';
import { HttpStatusCode } from 'axios';
import {
  ALIYUN_DEFAULT_REGION_ID,
  ALIYUN_SUCCESS_CODE,
  AliyunMessageType,
} from './aliyun.constant.js';
import { AliyunError } from './aliyun.error.js';
import { ClientOptions, SendSmsRequest } from './aliyun.types.js';

export class AliyunClient {
  private readonly logger = new Logger(AliyunClient.name);
  private readonly sdk: Dysmsapi.default;

  constructor(private readonly options: ClientOptions) {
    this.sdk = new Dysmsapi.default(
      new Config({
        accessKeyId: this.options.accessKeyId,
        accessKeySecret: this.options.accessKeySecret,
        type: 'access_key',
        endpoint: this.options.endpoint,
        regionId: this.options.regionId ?? ALIYUN_DEFAULT_REGION_ID,
      }),
    );
  }

  async sendSms(payload: SendSmsRequest) {
    const { to, text, senderId, messageType = AliyunMessageType.OTP } = payload;

    const request = new SendMessageToGlobeRequest({
      to,
      message: text,
      from: senderId,
      type: messageType,
    });

    this.logger.log('Aliyun send sms request', {
      endpoint: this.options.endpoint,
      to,
      from: senderId,
      type: messageType,
    });

    try {
      const response = await this.sdk.sendMessageToGlobeWithOptions(
        request,
        new RuntimeOptions({}),
      );
      this.logger.log('Aliyun send sms response', { response: response.body });

      if (response.body?.responseCode !== ALIYUN_SUCCESS_CODE || !response.body?.messageId) {
        throw new AliyunError(
          response.body?.responseCode ?? 'unknown',
          HttpStatusCode.BadRequest,
          response.body?.responseDescription ?? 'SMS Failed',
        );
      }

      return { messageId: response.body.messageId };
    } catch (error) {
      if (error instanceof AliyunError) throw error;

      throw new Error('Aliyun provider error', { cause: error });
    }
  }
}

/** Example
const sender = new AliyunClient({
  endpoint: 'dysmsapi.ap-southeast-1.aliyuncs.com',
  accessKeyId: 'xxxxx',
  accessKeySecret: 'xxxxx',
});
 */
