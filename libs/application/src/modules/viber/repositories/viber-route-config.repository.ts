import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ViberRouteConfig as ViberRouteConfigModel,
  RouteAccount as RouteAccountModel,
  RouteAccountVirtualField,
} from '../schemas/viber-route-config.schema';
import {
  ViberAccountBase as ViberAccountBaseModel,
  ViberAccount as ViberAccountModel,
} from '../schemas/viber-account.schema';
import { MONGO_CONN_NAME } from '@application/connnections';
import { RouteType, ViberRouteConfig, ViberRouteConfigWithAccount } from '../models/viber-route-config.model';
import { Except } from 'type-fest';

@Injectable()
export class ViberRouteConfigRepository {
  private logger = new Logger(ViberRouteConfigRepository.name);
  constructor(
    @InjectModel(ViberRouteConfigModel.name, MONGO_CONN_NAME.PRIMARY)
    private configModel: Model<ViberRouteConfigModel>,
  ) {}

  async addConfig(routeConfig: Except<ViberRouteConfig, 'id'>): Promise<string> {
    const config = new this.configModel(routeConfig);
    const result = await config.save();
    return result.id;
  }

  async updateConfig(id: string, routeConfig: Except<ViberRouteConfig, 'id'>) {
    const configId = new Types.ObjectId(id);
    await this.configModel.updateOne(configId, routeConfig);
  }

  async findConfig(routeType: RouteType, platformId: string): Promise<ViberRouteConfigWithAccount | null> {
    const config = await this.configModel
      .findOne({
        platformId,
        type: routeType,
      })
      .populate<{
        accounts: (RouteAccountModel & { accountDetails: Except<ViberAccountModel, 'createdAt' | 'updatedAt'> })[];
      }>(`accounts.${RouteAccountVirtualField.AccountDetails}`, '-_id -__v -createdAt -updatedAt')
      .lean();

    if (!config) return null;

    const accounts = config.accounts.map((acc) => ({
      ...acc,
      id: acc.id.toString(),
    }));
    return { ...config, id: config._id.toString(), accounts };
  }
}
