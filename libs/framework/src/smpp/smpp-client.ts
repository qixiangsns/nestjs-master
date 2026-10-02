import smpp, { connect, createServer, PDU, Session, BindOptions, SessionOptions } from 'smpp';

type ConnectOptions = Pick<SessionOptions, 'url'>;
type AuthOptions = Pick<BindOptions, 'system_id' | 'password' | 'interface_version'>;

export class SmppClient {
  private session: Session;
  constructor(
    private readonly connectOptions: ConnectOptions,
    private readonly authOptions: AuthOptions,
  ) {}

  async connect() {
    return new Promise<boolean>((resolve, reject) => {
      this.session = smpp.connect({ ...this.connectOptions }, (session) => {
        session.bind_transceiver({ ...this.authOptions }, (pdu) => {
          const isConnected = pdu.command_status === 0;
          if (isConnected) resolve(true);
          reject(new Error('Error connecting to smpp server'));
        });
      });
    });
  }

  async sendMessage(message: string, phoneNumber: string) {
    this.session.submit_sm(
      {
        destination_addr: phoneNumber,
        short_message: message,
      },
      (pdu) => {
        pdu.message_id;
      },
    );
  }
}
