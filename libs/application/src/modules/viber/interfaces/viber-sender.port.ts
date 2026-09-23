export interface ViberSender {
  sendViberMessage: () => Promise<void>;
  getViberTemplate: (templateId: string) => Promise<void>;
}
