import Smpp, { Session, BindTransceiverPDU } from '@semyonf/smpp';

type Config = {
  url: string;
  username: string;
  password: string;
  systemType?: 'MHS';
};

type BindTransceiverParams = Partial<
  Pick<BindTransceiverPDU, 'system_id' | 'interface_version' | 'password' | 'system_type'>
>;

interface SmppClientInterface {
  //   sendMessage: () => Promise<void>;
  connect: () => Promise<unknown>;
}
export class SmppClient implements SmppClientInterface {
  private session: Session;
  constructor(private readonly config: Config) {
    this.session = Smpp.connect({ url: this.config.url });
  }

  async connect() {
    return new Promise((resolve) => {
      const params = {
        interface_version: 0x34,
        password: 'password',
        system_id: 'username',
      } as const as BindTransceiverParams;

      params.system_type = 'MHS';
      this.session.bind_transceiver(params, function (pdu) {});
    });
  }
}
