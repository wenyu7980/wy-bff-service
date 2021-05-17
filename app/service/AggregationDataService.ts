import { Service } from 'egg';

/**
 * @author wenyu
 */
export default class AggregationDataService extends Service {
  public async getTypes(serviceName: string, method: string, path: string): Promise<Map<string, Type>> {
    const types: Map<string, Type> = new Map<string, Type>();
    const results: QueryTypeResult[] = (await this.ctx.app.mysql.query(`
    select 
        a.type_name,
        a.name,
        a.type,
        a.params aparams,
        p.service_name,
        p.path,
        p.params pparams
    from aggregation_requirement r
    join aggregation_requirement_type t on r.method = t.method and r.path = t.path and r.service_name = t.service_name
    join aggregation_requirement_attribute a on t.type_name  = a.type_name and t.service_name = a.service_name
    left join aggregation_provider p on p.type_name  = a.type
    where r.service_name = ? and r.method=? and r.path =?;
    `, [ serviceName, method, path ])).map(r => {
      return {
        ...r,
        typeName: r.type_name,
        aparams: JSON.parse(r.aparams),
        pparams: JSON.parse(r.pparams),
        serviceName: r.service_name,
      };
    });
    for (const result of results) {
      if (!types.has(result.typeName)) {
        types.set(result.typeName, { name: result.typeName, attributes: [] });
      }
      if (result.serviceName) {
        const params: TypeAttributeParam[] = [];
        for (const p of result.pparams) {
          if (result.aparams && result.aparams.length > 0) {
            for (const a of result.aparams) {
              if (a.name === p.name) {
                params.push({ ...p, ...a, path: p.pathFlag });
                break;
              }
            }
          } else {
            params.push({ ...p, constant: false, value: p.name, path: p.pathFlag });
          }
        }
        // 需要聚合
        types.get(result.typeName)?.attributes.push({
          name: result.name,
          aggregation: true,
          custom: !!result.aparams?.length,
          serviceName: result.serviceName,
          path: result.path,
          params,
        });
      } else {
        // 不需要聚合
        if (!types.has(result.type)) {
          types.set(result.type, { name: result.type, attributes: [] });
        }
        const type = types.get(result.type);
        if (type) {
          types.get(result.typeName)?.attributes.push({
            aggregation: false,
            name: result.name,
            type,
          });
        }
      }
      result.typeName;
    }
    return types;
  }

  public async getReturnType(serviceName: string, method: string, path: string): Promise<string> {
    return (await this.ctx.app.mysql.query(`
    select
     r.return_type_name 
    from aggregation_requirement r
    where r.service_name = ? and r.method=? and r.path =?;
    `, [ serviceName, method, path ]))?.[0]?.['return_type_name'];
  }
}


interface QueryTypeResult {
  typeName: string;
  name: string;
  type: string;
  aparams: any[];
  serviceName: string;
  path: string;
  pparams: any[];
}

export interface Type {
  name: string;
  attributes: TypeAttribute[];
}

export type TypeAttribute = TypeNonAggregation | TypeAggregation;

export interface TypeNonAggregation {
  name: string;
  type: Type;
  aggregation: false;
}

export interface TypeAggregation {
  name: string;
  aggregation: true;
  custom: boolean;
  serviceName: string;
  path: string;
  params: TypeAttributeParam[];
}

export interface TypeAttributeParam {
  readonly name: string;
  readonly value: string;
  readonly constant: boolean;
  readonly path: boolean;
}

