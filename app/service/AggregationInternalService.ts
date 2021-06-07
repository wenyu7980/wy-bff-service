import { Service } from 'egg';
import { AggregationInit, AggregationItem } from '../domain/AggregationDefine';
import {
  ProviderEntity,
  RequirementAttributeEntity,
  RequirementEntity,
  RequirementTypeEntity,
} from '../entity/AggregationEntity';

export default class AggregationInternalService extends Service {
  public async initAggregation(aggregation: AggregationInit) {
    const { mysql } = this.ctx.app;
    const conn = await mysql.beginTransaction();
    try {
      await Promise.all([
        conn.delete('aggregation_requirement', { service_name: aggregation.serviceName }),
        conn.delete('aggregation_provider', { service_name: aggregation.serviceName }),
        conn.delete('aggregation_requirement_type', { service_name: aggregation.serviceName }),
        conn.delete('aggregation_requirement_attribute', { service_name: aggregation.serviceName }),
      ]);
      // requirement
      const methods: RequirementEntity[] = [];
      const types: RequirementTypeEntity[] = [];
      for (const method of aggregation.methods) {
        methods.push({
          service_name: aggregation.serviceName,
          method: method.method,
          path: method.path,
          return_type_name: method.returnType,
        });
        for (const type of method.types) {
          types.push({
            service_name: aggregation.serviceName,
            method: method.method,
            path: method.path,
            type_name: type,
          });
        }
      }
      // attributes
      const attributes: RequirementAttributeEntity[] = [];
      for (const type of aggregation.types) {
        for (const attribute of type.attributes) {
          attributes.push({
            service_name: aggregation.serviceName,
            type_name: type.name,
            type: attribute.type,
            name: attribute.name,
            params: JSON.stringify(attribute.params),
          });
        }
      }
      // providers
      const providers: ProviderEntity[] = [];
      for (const provider of aggregation.providers) {
        providers.push({
          service_name: aggregation.serviceName,
          path: provider.path,
          type_name: provider.typeName,
          params: JSON.stringify(provider.params),
        });
      }
      const promises: any = [];
      if (types.length) {
        promises.push(conn.insert<RequirementTypeEntity[]>('aggregation_requirement_type', types));
      }
      if (methods.length) {
        promises.push(conn.insert<RequirementEntity[]>('aggregation_requirement', methods));
      }
      if (attributes.length) {
        promises.push(conn.insert<RequirementAttributeEntity[]>('aggregation_requirement_attribute', attributes));
      }
      if (providers.length) {
        promises.push(conn.insert<ProviderEntity[]>('aggregation_provider', providers));
      }
      await Promise.all(promises);
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    }
  }

  public async getAggregationItem(): Promise<AggregationItem[]> {
    const { mysql } = this.ctx.app;
    return (await mysql.query('SELECT distinct service_name,method,path from aggregation_requirement')
    ).map(d => {
      return { serviceName: d.service_name, path: d.path, method: d.method };
    });
  }
}
