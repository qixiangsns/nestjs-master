import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ViberProviderCode, ViberProviderCodes } from '../models/viber-provider.model';

export type ViberProviderDocument = HydratedDocument<ViberProvider>;

@Schema({ collection: 'viber_providers' })
export class ViberProvider {
  @Prop({ required: true })
  name: string;

  /**
   * Support multiple API URLs (Mock/Test/Account URL)
   */
  @Prop({ required: true })
  urls: string[];

  @Prop({ type: String, enum: ViberProviderCodes, required: true, unique: true })
  code: ViberProviderCode;
}

export const ViberProviderSchema = SchemaFactory.createForClass(ViberProvider);
