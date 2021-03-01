import { Controller } from 'egg';

export default class AggregationController extends Controller {

  public async getAggregate() {
    const result = await this.service.aggregationService.getAggregate();
    this.ctx.body = result.body;
    this.ctx.status = result.status;
    this.ctx.headers = result.headers;
  }

  public async postAggregate() {
    const result = await this.service.aggregationService.postAggregate();
    this.ctx.body = result.body;
    this.ctx.status = result.status;
    this.ctx.headers = result.headers;
  }
}
