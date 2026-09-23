import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ViberProviderCode, ViberProviderCodes } from '../models/viber-provider.model';
import { DeliveryStatus, RequestStatus, MessageType, MessageTypes } from '../models/viber-log.model';

export type ViberLogDocument = HydratedDocument<ViberLog>;

@Schema({ collection: 'viber_logs', timestamps: true })
export class ViberLog {
  @Prop({ type: String, enum: ViberProviderCodes, required: true })
  providerCode: ViberProviderCode;

  @Prop({ type: String, enum: MessageTypes, required: true })
  type: MessageType;

  @Prop({ type: String })
  refId?: string;

  @Prop({ type: String })
  content?: string;

  @Prop({ type: String })
  platformId: string;

  @Prop({ type: String })
  playerId?: string;

  @Prop({ type: String })
  phoneNo?: string;

  @Prop({ enum: RequestStatus, default: RequestStatus.PROCESSING })
  requestStatus: string;

  @Prop({ enum: DeliveryStatus, default: DeliveryStatus.PENDING })
  deliveryStatus: string;

  @Prop({ type: String, required: false })
  campaignId?: string;

  @Prop({ type: String })
  campaignSender?: string;
}

export const ViberLogSchema = SchemaFactory.createForClass(ViberLog);
