import { Controller, Mysql } from 'egg';

export default class DataAggregationController extends Controller {

  public async getIndex() {
    const { queries, path, headers } = this.ctx;
    const paths = path.split('/');
    const result = await this.service.dataAggregationService.getHandler(paths[1], paths.slice(2)
      .join('/'), queries, headers);
    this.ctx.body = result.body;
    this.ctx.status = result.status;
  }

  public async testMysql() {
    const mysql: Mysql = this.app.mysql;
    this.ctx.body = await mysql.get('users');
  }
}
