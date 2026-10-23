import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ViberProviderCode } from '../models/viber-provider.model.js';

export const VIBER_PROVIDER_MODEL = 'ViberProvider';

export type ViberProviderDocument = HydratedDocument<ViberProviderEntity>;

@Schema({ collection: 'viber_providers', autoIndex: false })
export class ViberProviderEntity {
  @Prop({ type: String, required: true })
  name: string;

  /**
   * Support multiple API URLs (Mock/Test/Account URL)
   */
  @Prop({ type: [String], required: true })
  urls: string[];

  @Prop({ type: String, enum: ViberProviderCode, required: true })
  code: ViberProviderCode;
}
export const ViberProviderSchema = SchemaFactory.createForClass(ViberProviderEntity);

ViberProviderSchema.index({ name: 1 }, { name: 'name', unique: true });
ViberProviderSchema.index({ name: 1, code: 1 }, { name: 'unique_provider', unique: true });
