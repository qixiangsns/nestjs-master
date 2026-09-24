import { ViberOtp, ViberMessage } from '../models/viber-message.model';

export interface ViberSender {
  sendViberOtp: (message: ViberOtp) => Promise<ViberMessage>;
}
