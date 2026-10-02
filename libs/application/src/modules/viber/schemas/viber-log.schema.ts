import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { ViberProviderCode } from '../models/viber-provider.model';
import { DeliveryStatus, RequestStatus, MessageType } from '../models/viber-log.model';

export type ViberLogDocument = HydratedDocument<ViberLog>;

@Schema({ collection: 'viber_logs', timestamps: true })
export class ViberLog {
  @Prop({ type: mongoose.Types.ObjectId })
  _id: mongoose.Types.ObjectId;

  @Prop({ type: String, enum: ViberProviderCode })
  providerCode?: ViberProviderCode;

  @Prop({ type: String, enum: MessageType, required: true })
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

  @Prop({ type: String, enum: RequestStatus, default: 'Processing' satisfies RequestStatus })
  requestStatus: RequestStatus;

  @Prop({ type: String, enum: DeliveryStatus, default: 'Pending' satisfies DeliveryStatus })
  deliveryStatus: DeliveryStatus;

  @Prop({ type: String, required: false })
  campaignId?: string;

  @Prop({ type: String })
  campaignSender?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const ViberLogSchema = SchemaFactory.createForClass(ViberLog);
