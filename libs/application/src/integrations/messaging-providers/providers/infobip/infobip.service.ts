import { Logger } from '@nestjs/common';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { BalanceChecker } from '../../interfaces/balance-checker.port';
import { Config } from './infobip.types';
import { WhatsappSender, WhatsappTemplatesResult } from '../../interfaces/whatsapp-sender.port';

const DEFAULT_TIMEOUT_MS = 10_000;
export class Infobip implements BalanceChecker, WhatsappSender {
  private logger: Logger = new Logger(Infobip.name);
  private readonly http: AxiosInstance;

  constructor(private readonly config: Config) {
    this.logger.log({ baseUrl: this.config.baseUrl }, 'Infobip config');

    this.http = axios.create({
      baseURL: this.config.baseUrl,
      timeout: DEFAULT_TIMEOUT_MS,
      headers: {
        Authorization: `App ${this.config.apiKey}`,
        Accept: 'application/json',
      },
    });
  }

  async sendWhatsappMessage(): Promise<void> {}

  async getWhatsappTemplates(senderId: string): Promise<WhatsappTemplatesResult> {
    const url = `/whatsapp/2/senders/${encodeURIComponent(senderId)}/templates`;

    try {
      const response = await this.http.get<{ templates: unknown[] }>(url);
      const { templates } = response.data;
      return {
        success: true,
        templates,
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        switch (error.response?.status) {
          case 400:
            // bad requests
            break;
          case 401:
            // authorized
            break;
          case 403:
            // forbiden
            break;
          case 429:
            // too many requests
            break;
          case 500:
            // provider error
            break;
        }
      }

      return {
        success: false,
        errorCode: 'provider_error',
        errorMessage: error instanceof Error ? error.message : 'Error',
        cause: error,
      };
    }
  }

  private mapErrorToCode(error: unknown) {
    if (error instanceof AxiosError) {
    } else if (error instanceof Error) {
    }
    return 0;
  }

  async getBalance() {
    return 0;
  }

  //   private toTemplateError(error: unknown): WhatsappTemplateErrorResult {
  //     if (!axios.isAxiosError(error)) {
  //       return {
  //         success: false,
  //         errorCode: 'provider_error',
  //         errorMessage: `Error calling Infobip Get WhatsApp Templates: (Error: ${(error as Error)?.message})`,
  //         cause: error,
  //       };
  //     }

  //     const status = error.response?.status;
  //     const errorMessage = `Error calling Infobip Get WhatsApp Templates: (Status: ${status ?? 'none'}, Error: ${this.describe(error)})`;

  //     if (status === undefined) {
  //       return { success: false, errorCode: 'network_error', errorMessage, cause: error };
  //     }

  //     switch (status) {
  //       case 401:
  //         return { success: false, errorCode: 'unauthorized', errorMessage, cause: error };
  //       case 403:
  //         return { success: false, errorCode: 'forbidden', errorMessage, cause: error };
  //       case 404:
  //         return { success: false, errorCode: 'sender_not_found', errorMessage, cause: error };
  //       case 429:
  //         return {
  //           success: false,
  //           errorCode: 'rate_limit_exceeded',
  //           errorMessage,
  //           retryAfterMs: this.retryAfterMs(error),
  //           cause: error,
  //         };
  //       default:
  //         return { success: false, errorCode: 'provider_error', errorMessage, cause: error };
  //     }
  //   }

  //   /** Prefers the `serviceException` detail from the Infobip error envelope over the transport message. */
  //   private describe(error: AxiosError): string {
  //     const parsed = InfobipRequestErrorSchema.safeParse(error.response?.data);

  //     if (!parsed.success) return error.message;

  //     const { messageId, text } = parsed.data.requestError.serviceException;
  //     return [messageId, text].filter(Boolean).join(': ') || error.message;
  //   }

  //   private retryAfterMs(error: AxiosError): number | undefined {
  //     const header = error.response?.headers?.['retry-after'];
  //     if (typeof header !== 'string' && typeof header !== 'number') return undefined;

  //     const seconds = Number(header);
  //     return Number.isFinite(seconds) ? seconds * 1000 : undefined;
  //   }
}
