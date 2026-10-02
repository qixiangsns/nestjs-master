import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { RouteStrategy, RouteType } from '../models/viber-route-config.model';
import { ViberAccountBase } from './viber-account.schema';

export type ViberRouteConfigDocument = HydratedDocument<ViberRouteConfig>;

@Schema({ _id: false })
export class RouteAccount {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: ViberAccountBase.name })
  id: mongoose.Schema.Types.ObjectId;

  @Prop({ type: Boolean, required: true })
  isEnabled: boolean;

  @Prop({ type: Number, required: true })
  weight: number;
}

export const RouteAccountSchema = SchemaFactory.createForClass(RouteAccount);

export enum RouteAccountVirtualField {
  AccountDetails = 'accountDetails',
}

RouteAccountSchema.virtual(RouteAccountVirtualField.AccountDetails, {
  ref: ViberAccountBase.name,
  localField: 'id',
  foreignField: '_id',
  justOne: true,
});

@Schema({ collection: 'viber_route_configs', timestamps: true })
export class ViberRouteConfig {
  @Prop({ type: String, enum: RouteType, required: true })
  type: RouteType;

  @Prop({ type: String, required: true })
  platformId: string;

  @Prop({ type: String, enum: RouteStrategy, required: true })
  strategy: RouteStrategy;

  @Prop({ type: String, required: true })
  senderId: string;

  @Prop({ type: [RouteAccountSchema], required: true })
  accounts: RouteAccount[];

  createdAt: Date;
  updatedAt: Date;
}
export const ViberRouteConfigSchema = SchemaFactory.createForClass(ViberRouteConfig);
