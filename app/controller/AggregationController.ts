import { Controller } from 'egg';

export default class AggregationController extends Controller {

  public async getAggregate() {
    const result = await this.service.aggregationService.getAggregate();
    this.ctx.body = result.body;
    this.ctx.status = result.status;
  }

  public async postAggregate() {
    const result = await this.service.aggregationService.postAggregate();
    this.ctx.body = result.body;
    this.ctx.status = result.status;
  }
}
