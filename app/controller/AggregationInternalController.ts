import { Controller } from 'egg';
import { AggregationInit } from '../domain/AggregationDefine';

export default class AggregationInternalController extends Controller {

  public async initAggregation() {
    const { request, service } = this.ctx;
    const body: AggregationInit = request.body;
    await service.aggregationInternalService.initAggregation(body);
    this.ctx.status = 200;
  }

  public async aggregations() {
    const { service } = this.ctx;
    this.ctx.body = await service.aggregationInternalService.getAggregationItem();
    this.ctx.status = 200;
  }

}
