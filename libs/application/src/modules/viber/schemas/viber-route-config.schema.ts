import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { RouteStrategy, RouteType } from '../models/viber-route-config.model';
import { VIBER_ACCOUNT_MODEL } from './viber-account.schema';

export const VIBER_ROUTE_CONFIG_MODEL = 'ViberRouteConfig';

export type ViberRouteConfigDocument = HydratedDocument<ViberRouteConfigEntity>;
@Schema({ _id: false })
export class RouteAccountEntity {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: VIBER_ACCOUNT_MODEL })
  id: mongoose.Types.ObjectId;

  @Prop({ type: Boolean, required: true })
  isEnabled: boolean;

  @Prop({ type: Number, required: true })
  weight: number;
}

export const RouteAccountSchema = SchemaFactory.createForClass(RouteAccountEntity);

export enum RouteAccountVirtualField {
  AccountDetails = 'details',
}

RouteAccountSchema.virtual(RouteAccountVirtualField.AccountDetails, {
  ref: VIBER_ACCOUNT_MODEL,
  localField: 'id',
  foreignField: '_id',
  justOne: true,
});

@Schema({ collection: 'viber_route_configs', timestamps: true })
export class ViberRouteConfigEntity {
  @Prop({ type: String, enum: RouteType, required: true })
  type: RouteType;

  @Prop({ type: String, required: true })
  platformId: string;

  @Prop({ type: String, enum: RouteStrategy, required: true })
  strategy: RouteStrategy;

  @Prop({ type: String, required: true })
  senderId: string;

  @Prop({ type: [RouteAccountSchema], required: true })
  accounts: RouteAccountEntity[];

  createdAt: Date;
  updatedAt: Date;
}
export const ViberRouteConfigSchema = SchemaFactory.createForClass(ViberRouteConfigEntity);
