import { Service } from 'egg';

export default class DataAggregationService extends Service {
  private static serviceMap: Map<string, string> = new Map<string, string>();

  async getHandler(serviceName: string, path: string, queries: any, headers: any):
  Promise<{ body: any, status: number, headers: any }> {
    const url = await this.getServiceUrl(serviceName);
    const result = await this.ctx.curl(`${url}/${path}`, {
      headers,
      data: queries,
    });
    return { body: JSON.parse(result.data), status: result.status, headers: result.headers };
  }

  private async getServiceUrl(serviceName: string) {
    if (!DataAggregationService.serviceMap.has(serviceName)) {
      const nacos = this.app.nacosNaming;
      const services = await nacos.getAllInstances(serviceName);
      const service = services.sort((a, b) => b.weight - a.weight)[0];
      DataAggregationService.serviceMap.set(serviceName, `http://${service.ip}:${service.port}`);
    }
    return DataAggregationService.serviceMap.get(serviceName);
  }
}
