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
  ViberAccountBaseSchema,
  ViberAccount as ViberAccountModel,
} from '../schemas/viber-account.schema';
import { MONGO_CONN_NAME } from '@application/connnections';
import {
  AccountDetailsRoutable,
  RoutableViberRouteConfig,
  RouteAccountRoutable,
  RouteAccountView,
  RouteType,
  ViberRouteConfig,
  ViberRouteConfigView,
} from '../models/viber-route-config.model';
import { Except } from 'type-fest';

@Injectable()
export class ViberRouteConfigRepository {
  private logger = new Logger(ViberRouteConfigRepository.name);
  constructor(
    @InjectModel(ViberRouteConfigModel.name, MONGO_CONN_NAME.PRIMARY)
    private configModel: Model<ViberRouteConfigModel>,

    @InjectModel(ViberAccountBaseModel.name, MONGO_CONN_NAME.PRIMARY)
    private accountModel: Model<ViberAccountBaseModel>,
  ) {}

  async addConfig(routeConfig: Except<ViberRouteConfig, 'id'>): Promise<string> {
    const config = new this.configModel(routeConfig);
    const result = await config.save();
    return result.id;
  }

  async findConfigById(id: string): Promise<ViberRouteConfig | null> {
    const config = await this.configModel.findById(new Types.ObjectId(id)).lean();

    if (!config) return null;

    return {
      ...config,
      id: config._id.toString(),
      accounts: config.accounts.map((acc) => ({ ...acc, id: acc.id.toString() })),
    };
  }

  async updateConfig(id: string, routeConfig: Partial<Except<ViberRouteConfig, 'id'>>) {
    await this.configModel.updateOne({ _id: new Types.ObjectId(id) }, routeConfig);
  }

  async isAccountEnabled(accountId: string) {
    const configs = await this.configModel
      .find({ 'accounts.id': new Types.ObjectId(accountId) })
      .select('accounts')
      .lean<{ accounts: ViberRouteConfig['accounts'] }[]>();

    const isEnabled = configs.some((config) => config.accounts.some((acc) => acc.isEnabled));
    return isEnabled;
  }

  async findRoutableConfig(routeType: RouteType, platformId: string): Promise<RoutableViberRouteConfig | null> {
    const config = await this.configModel
      .findOne({
        platformId,
        type: routeType,
      })
      .populate<{
        accounts: RouteAccountRoutable[];
      }>(`accounts.${RouteAccountVirtualField.AccountDetails}`, '-_id -__v -createdAt -updatedAt -name')
      .lean();

    if (!config) return null;

    const accounts = config.accounts.map((acc) => ({
      ...acc,
      id: acc.id.toString(),
    }));
    return { ...config, id: config._id.toString(), accounts };
  }

  async findConfig(routeType: RouteType, platformId: string): Promise<ViberRouteConfigView | null> {
    const config = await this.configModel
      .findOne({
        platformId,
        type: routeType,
      })
      .populate<{
        accounts: RouteAccountView[];
      }>(`accounts.${RouteAccountVirtualField.AccountDetails}`, '-_id -__v')
      .lean();

    if (!config) return null;

    const accounts = config.accounts.map((acc) => ({
      ...acc,
      id: acc.id.toString(),
    }));
    return { ...config, id: config._id.toString(), accounts };
  }
}
