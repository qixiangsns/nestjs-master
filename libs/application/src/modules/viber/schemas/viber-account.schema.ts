import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { LIMITER_POOL_MODEL } from '@application/modules/limiter/index.js';
import { ViberProviderCode } from '../models/viber-provider.model.js';
import { AccountType } from '../models/viber-account.model.js';

export const VIBER_ACCOUNT_MODEL = 'ViberAccountBase';
export const VIBER_ACCOUNT_API_TOKEN_MODEL = 'ViberAccountApiToken';
export const VIBER_ACCOUNT_API_KEY_SECRET_MODEL = 'ViberAccountApiKeySecret';
export const VIBER_ACCOUNT_BEARER_TOKEN_MODEL = 'ViberAccountBearerToken';

export type ViberAccountDocument = HydratedDocument<ViberAccountEntity>;

@Schema({ collection: 'viber_accounts', timestamps: true, discriminatorKey: 'type' })
export class ViberAccountBaseEntity {
  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  url: string;

  @Prop({ type: String, enum: ViberProviderCode, required: true })
  providerCode: ViberProviderCode;

  @Prop({ type: [String] })
  senderIds: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: LIMITER_POOL_MODEL, required: true })
  limiterPoolId: mongoose.Types.ObjectId;

  @Prop({ type: Boolean })
  isEnabled: boolean;

  type: AccountType;
  createdAt: Date;
  updatedAt: Date;
}

export const ViberAccountBaseSchema = SchemaFactory.createForClass(ViberAccountBaseEntity);

@Schema()
export class ViberAccountApiTokenEntity implements ViberAccountBaseEntity {
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

export const ViberAccountApiTokenSchema = SchemaFactory.createForClass(ViberAccountApiTokenEntity);

@Schema()
export class ViberAccountApiKeySecretEntity implements ViberAccountBaseEntity {
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

export const ViberAccountApiKeySecretSchema = SchemaFactory.createForClass(
  ViberAccountApiKeySecretEntity,
);

@Schema()
export class ViberAccountBearerTokenEntity implements ViberAccountBaseEntity {
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

export const ViberAccountBearerTokenSchema = SchemaFactory.createForClass(
  ViberAccountBearerTokenEntity,
);

export type ViberAccountEntity =
  ViberAccountApiKeySecretEntity | ViberAccountApiTokenEntity | ViberAccountBearerTokenEntity;
