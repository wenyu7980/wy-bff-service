import { Service } from 'egg';
import { HeaderRequest } from '../domain/AggregationDefine';

export default class AggregationService extends Service {
  private static serviceMap: Map<string, string> = new Map<string, string>();

  async postAggregate(): Promise<{ body: any, status: number, headers: any }> {
    const { request } = this.ctx;
    const header: HeaderRequest = JSON.parse(request.headers.context).request;
    const url = await this.getServiceUrl(header.serviceName);
    const result = await this.ctx.curl(`${url}/${getPath(request.path)}`, {
      headers: request.headers,
      data: request.queries,
    });
    return {
      body: this.aggregate(await this.getAggregation(header.serviceName, header.method, header.path), JSON.parse(result.data)),
      status: result.status,
      headers: result.headers,
    };
  }

  async getAggregate(): Promise<{ body: any, status: number, headers: any }> {
    const { request } = this.ctx;
    const header: HeaderRequest = JSON.parse(request.headers.context).request;
    const url = await this.getServiceUrl(header.serviceName);
    const result = await this.ctx.curl(`${url}/${getPath(request.path)}`, {
      headers: request.headers,
      data: request.queries,
      method: 'POST',
    });
    return {
      body: this.aggregate(await this.getAggregation(header.serviceName, header.method, header.path), JSON.parse(result.data)),
      status: result.status,
      headers: result.headers,
    };
  }

  private async getServiceUrl(serviceName: string) {
    if (!AggregationService.serviceMap.has(serviceName)) {
      const nacos = this.app.nacosNaming;
      const services = await nacos.getAllInstances(serviceName);
      const service = services.sort((a, b) => b.weight - a.weight)[0];
      AggregationService.serviceMap.set(serviceName, `http://${service.ip}:${service.port}`);
    }
    return AggregationService.serviceMap.get(serviceName);
  }

  private async aggregate(attributes: AggregationAttribute[], data: any): Promise<any> {
    const result = { ...data };
    for (const attribute of attributes) {
      if (attribute.request) {
        if (attribute.request.arrayFlag) {
          result[attribute.name] = [];
        } else {
          result[attribute.name] = {};
        }
      } else if (data[attribute.name]) {
        if (data[attribute.name] instanceof Array) {
          for (const [ index, d ] of data[attribute.name].entries) {
            result[attribute.name][index] = await this.aggregate(attribute.attributes, d);
          }
        } else {
          result[attribute.name] = await this.aggregate(attribute.attributes, data[attribute.name]);
        }
      }
    }
    return result;
  }

  private async getAggregation(serviceName: string, method: string, path: string): Promise<AggregationAttribute[]> {
    const { mysql } = this.ctx.app;
    const result: AggregationResult[] = (await mysql.query(`
    SELECT
      requirement.attribute as attribute,
      provider.service_name as serviceName,
      provider.method as method,
      provider.path as path,
      provider.params as providerParams,
      provider.class_name as className,
      provider.array_flag as arrayFlag,
      requirement.params as requirementParams
    FROM bff_aggregation_requirement requirement
    JOIN bff_aggregation_provider provider
    ON requirement.array_flag = provider.array_flag AND requirement.class_name = provider.class_name
    WHERE
      requirement.service_name = ? AND requirement.method = ? AND requirement.path = ?;
    `, [ serviceName, method, path ])).map(d => {
      return {
        ...d,
        arrayFlag: d.arrayFlag === 1,
        providerParams: JSON.parse(d.providerParams),
        requirementParams: JSON.parse(d.requirementParams),
      };
    });
    const attributes: AggregationAttribute[] = [];
    for (const r of result) {
      addAttributes(r.attribute.split('.'), r, attributes);
    }
    return attributes;
  }
}


function getPath(path: string): string {
  return path.split('/').slice(2).join('/');
}

function addAttributes(names: string[], aggregation: AggregationResult, attributes: AggregationAttribute[]) {
  if (names.length === 1) {
    attributes.push(
      {
        name: names[0],
        attributes: [],
        request: {
          className: aggregation.className,
          arrayFlag: aggregation.arrayFlag,
          serviceName: aggregation.serviceName,
          path: aggregation.path,
          params: aggregation.arrayFlag ?
            aggregation.requirementParams.map(p => {
              let pathFlag = false;
              for (const param of aggregation.providerParams) {
                if (param.name === p.name) {
                  pathFlag = param.pathFlag;
                  break;
                }
              }
              return { ...p, pathFlag };
            }) :
            aggregation.providerParams.map(p => {
              return { ...p, constant: false, value: p.name };
            }),
        },
      },
    );
  } else {
    for (const attribute of attributes) {
      if (attribute.name === names[0]) {
        addAttributes(names.slice(1), aggregation, attribute.attributes);
        return;
      }
    }
    const attr = { name: names[0], attributes: [] };
    attributes.push(attr);
    addAttributes(names.slice(1), aggregation, attr.attributes);
  }
}

interface AggregationAttribute {
  name: string;
  attributes: AggregationAttribute[];
  request?: {
    className: string;
    arrayFlag: boolean;
    serviceName: string;
    path: string;
    params: {
      name: string;
      value: string;
      pathFlag: boolean;
      constant: boolean
    }[];
  }
}

interface AggregationResult {
  readonly attribute: string;
  readonly serviceName: string;
  readonly method: string;
  readonly path: string;
  readonly className: string;
  readonly arrayFlag: boolean;
  readonly providerParams: {
    readonly name: string;
    readonly pathFlag: boolean;
  }[],
  readonly requirementParams: {
    readonly name: string;
    readonly value: string;
    readonly constant: boolean
  }[],
}
