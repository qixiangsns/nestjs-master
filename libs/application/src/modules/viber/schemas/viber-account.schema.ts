import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ViberProviderCode } from '../models/viber-provider.model';
import { AccountType } from '../models/viber-account.model';

export type ViberAccountDocument = HydratedDocument<ViberAccount>;

@Schema({ collection: 'viber_accounts', timestamps: true, discriminatorKey: 'type' })
export class ViberAccountBase {
  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  url: string;

  @Prop({ type: String, enum: ViberProviderCode, required: true })
  providerCode: ViberProviderCode;

  @Prop({ type: [String] })
  senderIds: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'LimiterPool', required: true })
  limiterPoolId: mongoose.Types.ObjectId;

  @Prop({ type: Boolean })
  isEnabled: boolean;

  type: AccountType;
  createdAt: Date;
  updatedAt: Date;
}

export const ViberAccountBaseSchema = SchemaFactory.createForClass(ViberAccountBase);

@Schema()
export class ViberAccountApiToken implements ViberAccountBase {
  type: 'ApiToken';

  @Prop({ type: String })
  apiToken: string;

  name: string;
  providerCode: ViberProviderCode;
  url: string;
  senderIds: string[];
  limiterPoolId: mongoose.Types.ObjectId;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const ViberAccountApiTokenSchema = SchemaFactory.createForClass(ViberAccountApiToken);

@Schema()
export class ViberAccountApiKeySecret implements ViberAccountBase {
  type: 'ApiKeySecret';

  @Prop({ type: String })
  apiKey: string;

  @Prop({ type: String })
  apiSecret: string;

  name: string;
  providerCode: ViberProviderCode;
  url: string;
  senderIds: string[];
  limiterPoolId: mongoose.Types.ObjectId;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Schema()
export class ViberAccountBearerToken implements ViberAccountBase {
  type: 'BearerToken';

  @Prop({ type: String })
  apiKey: string;

  @Prop({ type: String })
  apiSecret: string;

  name: string;
  providerCode: ViberProviderCode;
  url: string;
  senderIds: string[];
  limiterPoolId: mongoose.Types.ObjectId;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const ViberAccountApiKeySecretSchema = SchemaFactory.createForClass(ViberAccountApiKeySecret);
export type ViberAccount = ViberAccountApiKeySecret | ViberAccountApiToken | ViberAccountBearerToken;
