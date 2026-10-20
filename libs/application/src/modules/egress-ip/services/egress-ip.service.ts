import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { EGRESS_IP_LOOKUP_TIMEOUT_MS, EGRESS_IP_LOOKUP_URL } from '../constants/egress-ip.constant';

/**
 * Public IP this pod's traffic leaves with, as seen by Cloudflare.
 * Looked up on first use and remembered, so one lookup per pod
 *
 * @example
 * const ip = await egressIpService.get(); // '123.45.67.890', or 'unknown' when the lookup failed
 */
@Injectable()
export class EgressIpService {
  private logger = new Logger(EgressIpService.name);
  private ip: Promise<string> | null = null;

  get(): Promise<string> {
    this.ip ??= this.lookup();
    return this.ip;
  }

  private async lookup(): Promise<string> {
    try {
      const { data } = await axios.get<string>(EGRESS_IP_LOOKUP_URL, {
        timeout: EGRESS_IP_LOOKUP_TIMEOUT_MS,
        responseType: 'text',
      });

      const ip = /^ip=(.+)$/m.exec(data)?.[1];
      if (!ip) throw new Error('Cloudflare trace has no ip');

      this.logger.log({ ip }, 'Egress IP resolved');
      return ip;
    } catch (error: unknown) {
      this.logger.warn({ error }, 'Egress IP lookup failed, using unknown until restart');
      return 'unknown';
    }
  }
}
