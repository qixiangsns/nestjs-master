import { AliyunMessageType } from './aliyun.constant.js';

export type ClientOptions = {
  /** Endpoint host, e.g. `dysmsapi.ap-southeast-1.aliyuncs.com`. */
  endpoint: string;
  accessKeyId: string;
  accessKeySecret: string;
  /** Defaults to `ALIYUN_DEFAULT_REGION_ID`. */
  regionId?: string;
};

export type SendSmsRequest = {
  to: string;
  text: string;
  /** Mapped to `from`. */
  senderId: string;
  /** Defaults to `OTP`, as in the legacy client. */
  messageType?: AliyunMessageType;
};
