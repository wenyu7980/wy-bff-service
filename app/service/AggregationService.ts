import { Service } from 'egg';
import { HeaderRequest } from '../domain/AggregationDefine';
import { Type, TypeAggregation } from './AggregationDataService';

export default class AggregationService extends Service {

  async postAggregate(): Promise<{ body: any, status: number, headers: any }> {
    const { request } = this.ctx;
    const header: HeaderRequest = JSON.parse(request.headers.context).request;
    const url = this.app.context.nacosServices.get(header.serviceName);
    const result = await this.ctx.curl(`${url}/${getPath(request.url)}`, {
      headers: request.headers,
      data: request.queries,
      method: 'POST',
    });
    const data = JSON.parse(result.data);
    // await Promise.allSettled(
    //   generateAggregations(await this.getAggregation(header.serviceName, header.method, header.path), data)
    //     .map(a => this.aggregates(a)),
    // );
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
    const results = await Promise.all([
      this.ctx.curl(`${url}/${getPath(request.url)}`, {
        headers: request.headers,
        data: request.body,
      }),
      this.service.aggregationDataService.getReturnType(header.serviceName, header.method, header.path),
      this.service.aggregationDataService.getTypes(header.serviceName, header.method, header.path),
    ]);
    const result = results[0];
    if (!results[1] || results[2].size === 0) {
      return {
        body: JSON.parse(result.data),
        status: result.status,
        headers: result.headers,
      };
    }
    if (result.status > 300) {
      return {
        body: JSON.parse(result.data),
        status: result.status,
        headers: result.headers,
      };
    }
    const data = JSON.parse(result.data);
    const aggregations: AggregationAttributes[] = [];
    generateAggregations(results[2].get(results[1]) ?? { name: '', attributes: [] }, data, aggregations);
    await Promise.allSettled(aggregations.map(a => this.aggregates(a)));
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
}

function generateAggregations(type: Type, data: any, aggregations: AggregationAttributes[]) {
  if (!data) {
    // 空数据不处理
    return;
  }
  if (data instanceof Array) {
    // 数据处理
    for (const d of data) {
      generateAggregations(type, d, aggregations);
    }
    return;
  }
  // 对象数据处理
  for (const attribute of type.attributes) {
    const d = data[attribute.name];
    if (attribute.aggregation) {
      // 聚合数据
      if (attribute.custom) {
        // 用户自定义
        addAggregations(aggregations, attribute, data, { parent: data, name: attribute.name });
      } else if (d) {
        if (d instanceof Array) {
          for (const [ i, v ] of d.entries()) {
            addAggregations(aggregations, attribute, v, { parent: d, name: i });
          }
        } else {
          addAggregations(aggregations, attribute, d, { parent: data, name: attribute.name });
        }
      }
    } else {
      // 非聚合数据
      generateAggregations(attribute.type, d, aggregations);
    }
  }
}

function addAggregations(aggregations: AggregationAttributes[], type: TypeAggregation, data: any, index: { parent: any, name: any }) {
  const params: AggregationAttributeParam[] = [];
  for (const p of type.params) {
    if (p.constant) {
      params.push({ ...p });
    } else {
      if (!data[p.name]) {
        // 参数不存在，不查询
        return;
      }
      params.push({ ...p, value: data[p.name] });
    }
  }
  for (const aggregation of aggregations) {
    if (type.name === aggregation.typeName
      && diffParamArray(params, aggregation.params)) {
      // 合并
      aggregation.attributes.push(index);
      return;
    }
  }
  // 添加
  aggregations.push({
    ...type,
    typeName: type.name,
    params,
    attributes: [ index ],
  });
}

interface AggregationAttributes {
  readonly typeName: string;
  readonly params: AggregationAttributeParam[];
  readonly serviceName: string;
  readonly path: string;
  readonly attributes: { parent: any, name: any }[];
}

interface AggregationAttributeParam {
  readonly name: string;
  readonly value: string;
  readonly path: boolean;
}

function getAggregatePath(params: { name: string; value: string; path: boolean; }[], path: string): string {
  for (const param of params) {
    if (param.path) {
      path = path.replace(`{${param.name}}`, param.value);
    }
  }
  return path;
}

function getAggregateQueries(params: { name: string; value: string; path: boolean; }[]): any {
  const ret = {};
  for (const param of params) {
    if (!param.path) {
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

function diffParamArray(o1: AggregationAttributeParam[], o2: AggregationAttributeParam[]): boolean {
  if (o1.length !== o2.length) {
    return false;
  }
  outer: for (const l of o1) {
    for (const r of o2) {
      if (l.name === r.name && l.value === r.value && l.path === r.path) {
        continue outer;
      }
    }
    return false;
  }
  return true;
}
