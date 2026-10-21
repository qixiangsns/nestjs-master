import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { LimiterStrategy, LimiterWindow } from '../models/limiter.model';

export const LIMITER_POOL_MODEL = 'LimiterPool';

export type LimiterPoolDocument = HydratedDocument<LimiterPoolEntity>;

@Schema({ _id: false })
export class LimiterRuleEntity {
  @Prop({ type: String, enum: LimiterWindow, required: true })
  window: LimiterWindow;

  @Prop({ type: Number, required: true, min: 1 })
  limit: number;

  @Prop({ type: String, enum: LimiterStrategy, required: true })
  strategy: LimiterStrategy;
}
export const LimiterRuleSchema = SchemaFactory.createForClass(LimiterRuleEntity);

@Schema({ collection: 'limiter_pools', timestamps: true })
export class LimiterPoolEntity {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: [LimiterRuleSchema], required: true })
  rules: LimiterRuleEntity[];

  @Prop({ type: Boolean, required: true })
  isEnabled: boolean;

  createdAt: Date;
  updatedAt: Date;
}
export const LimiterPoolSchema = SchemaFactory.createForClass(LimiterPoolEntity);

LimiterPoolSchema.index({ name: 1 }, { name: 'name', unique: true });
