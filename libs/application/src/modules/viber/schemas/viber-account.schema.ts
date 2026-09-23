import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AuthMethod, AuthMethods } from '../models/viber-account.model';
import { ViberProviderCode, ViberProviderCodes } from '../models/viber-provider.model';

@Schema({ _id: false })
export class Credential {
  @Prop()
  apiKey: string;

  @Prop()
  apiSecret: string;

  @Prop()
  url: string;
}
export const CredentialSchema = SchemaFactory.createForClass(Credential);

@Schema({ collection: 'viber_accounts', timestamps: true })
export class ViberAccount {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: String, enum: ViberProviderCodes })
  providerCode: ViberProviderCode;

  @Prop({ required: true, type: String, enum: AuthMethods })
  authMethod: AuthMethod;

  @Prop({ type: CredentialSchema, required: true })
  credential: Credential;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const ViberAccountSchema = SchemaFactory.createForClass(ViberAccount);
