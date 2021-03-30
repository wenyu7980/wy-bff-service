import { Service } from 'egg';
import { HeaderRequest } from '../domain/AggregationDefine';

export default class AggregationService extends Service {

  async postAggregate(): Promise<{ body: any, status: number, headers: any }> {
    const { request } = this.ctx;
    const header: HeaderRequest = JSON.parse(request.headers.context).request;
    const url = this.app.context.nacosServices.get(header.serviceName);
    const result = await this.ctx.curl(`${url}/${getPath(request.path)}`, {
      headers: request.headers,
      data: request.queries,
      method: 'POST',
    });
    const data = JSON.parse(result.data);
    await Promise.all(
      generateAggregations(await this.getAggregation(header.serviceName, header.method, header.path), data)
        .map(a => this.aggregates(a)),
    );
    return {
      body: data,
      status: result.status,
      headers: result.headers,
    };
  }

  async getAggregate(): Promise<{ body: any, status: number, headers: any }> {
    const { request } = this.ctx;
    const header: HeaderRequest = JSON.parse(request.headers.context).request;
    const url = this.app.context.nacosServices.get(header.serviceName);
    const result = await this.ctx.curl(`${url}/${getPath(request.path)}`, {
      headers: request.headers,
      data: request.body,
    });
    const data = JSON.parse(result.data);
    await Promise.all(
      generateAggregations(await this.getAggregation(header.serviceName, header.method, header.path), data)
        .map(a => this.aggregates(a)),
    );
    return {
      body: data,
      status: result.status,
      headers: result.headers,
    };
  }

  private async aggregates(aggregation: AggregationAttributes) {
    if (!this.app.context.nacosServices.has(aggregation.serviceName)) {
      return;
    }
    const url = this.app.context.nacosServices.get(aggregation.serviceName);
    const result = await this.ctx.curl(`${url}/${getAggregatePath(aggregation.params, aggregation.path)}`, {
      data: getAggregateQueries(aggregation.params),
    });
    if (result.status < 300) {
      for (const attribute of aggregation.attributes) {
        attribute.parent[attribute.name] = JSON.parse(result.data);
      }
    }
  }

  private async getAggregation(serviceName: string, method: string, path: string): Promise<AggregationResult[]> {
    const { mysql } = this.ctx.app;
    return (await mysql.query(`
    SELECT
      requirement.attribute as attribute,
      provider.service_name as serviceName,
      provider.path as path,
      provider.params as providerParams,
      provider.class_name as className,
      provider.array_flag as arrayFlag,
      requirement.params as requirementParams
    FROM aggregation_requirement requirement
    JOIN aggregation_provider provider
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
  }
}

function getAggregatePath(params: { name: string; value: string; pathFlag: boolean; }[], path: string): string {
  for (const param of params) {
    if (param.pathFlag) {
      path = path.replace(`{${param.name}}`, param.value);
    }
  }
  return path;
}

function getAggregateQueries(params: { name: string; value: string; pathFlag: boolean; }[]): any {
  const ret = {};
  for (const param of params) {
    if (!param.pathFlag) {
      ret[param.name] = param.value;
    }
  }
  return ret;
}


function getPath(path: string): string {
  return path.split('/')
    .slice(2)
    .join('/');
}

function generateAggregations(aggregations: AggregationResult[], data: any): AggregationAttributes[] {
  const ret: AggregationAttributes[] = [];
  for (const aggregation of aggregations) {
    const params = getParam(aggregation.attribute.split('.'), aggregation, data);
    labelParam: for (const param of params) {
      for (const attribute of ret) {
        if (attribute.className === aggregation.className
          && attribute.arrayFlag === aggregation.arrayFlag
          && diffParamArray(param.params, attribute.params)) {
          attribute.attributes.push({ parent: param.parent, name: param.name });
          continue labelParam;
        }
      }
      ret.push({
        className: aggregation.className,
        arrayFlag: aggregation.arrayFlag,
        serviceName: aggregation.serviceName,
        path: aggregation.path,
        attributes: [
          { parent: param.parent, name: param.name },
        ],
        params: param.params,
      });
    }
  }
  return ret;
}


function getParam(attributes: string[], aggregation: AggregationResult, data: any)
  : { params: AggregationAttributeParam[], parent: any, name: any }[] {
  if (attributes.length === 0) return [];
  const ret: { params: AggregationAttributeParam[], parent: any, name: any }[] = [];
  if (data instanceof Array) {
    for (const d of data) {
      ret.push(...getParam(attributes, aggregation, d));
    }
  }
  const attr = attributes[0];
  if (attributes.length === 1) {
    if (aggregation.arrayFlag) {
      ret.push({
        params: aggregation.requirementParams.map(p => {
          let pathFlag = false;
          for (const param of aggregation.providerParams) {
            if (param.name === p.name) {
              pathFlag = param.pathFlag;
              break;
            }
          }
          return { name: p.name, value: p.constant ? p.value : data[p.value], pathFlag };
        }),
        parent: data,
        name: attr,
      });
      return ret;
    } else if (data[attr]) {
      ret.push({
        params: aggregation.providerParams.map(p => {
          return { name: p.name, pathFlag: p.pathFlag, value: data[attr][p.name] };
        }),
        parent: data,
        name: attr,
      });
    }
    return ret;
  }
  if (!data[attr]) {
    return ret;
  }
  if (data[attr] instanceof Array) {
    for (const d of data[attr]) {
      ret.push(...getParam(attributes.slice(1), aggregation, d));
    }
  } else {
    ret.push(...getParam(attributes.slice(1), aggregation, data[attr]));
  }
  return ret;
}

function diffParamArray(o1: AggregationAttributeParam[], o2: AggregationAttributeParam[]): boolean {
  if (o1.length !== o2.length) {
    return false;
  }
  outer: for (const l of o1) {
    for (const r of o2) {
      if (l.name === r.name && l.value === r.value && l.pathFlag === r.pathFlag) {
        continue outer;
      }
    }
    return false;
  }
  return true;
}

interface AggregationAttributes {
  readonly className: string;
  readonly arrayFlag: boolean;
  readonly params: AggregationAttributeParam[];
  readonly serviceName: string;
  readonly path: string;
  readonly attributes: { parent: any, name: any }[];
}

interface AggregationAttributeParam {
  readonly name: string;
  readonly value: string;
  readonly pathFlag: boolean;
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

