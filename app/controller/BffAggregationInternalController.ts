import { Controller } from 'egg';
import { AggregationInit } from '../domain/AggregationDefine';

export default class BffAggregationInternalController extends Controller {

  public async initAggregation() {
    const { request, service } = this.ctx;
    const body: AggregationInit = request.body;
    await service.bffAggregationInternalService.initAggregation(body);
    this.ctx.status = 200;
  }

  public async aggregations() {
    this.ctx.body = [];
    this.ctx.status = 200;
  }

}
