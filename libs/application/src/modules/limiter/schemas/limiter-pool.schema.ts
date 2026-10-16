import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { LimiterWindow } from '../models/limiter.model';

export type LimiterPoolDocument = HydratedDocument<LimiterPool>;

@Schema({ _id: false })
export class LimiterRule {
  @Prop({ type: String, enum: LimiterWindow, required: true })
  window: LimiterWindow;

  @Prop({ type: Number, required: true, min: 1 })
  limit: number;
}
export const LimiterRuleSchema = SchemaFactory.createForClass(LimiterRule);

@Schema({ collection: 'limiter_pools', timestamps: true })
export class LimiterPool {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: [LimiterRuleSchema], required: true })
  rules: LimiterRule[];

  @Prop({ type: Boolean, required: true })
  isEnabled: boolean;

  createdAt: Date;
  updatedAt: Date;
}
export const LimiterPoolSchema = SchemaFactory.createForClass(LimiterPool);

LimiterPoolSchema.index({ name: 1 }, { name: 'name', unique: true });
