import { Service } from 'egg';
import { AggregationInit } from '../domain/AggregationDefine';
import { AggregationProviderEntity, AggregationRequirementEntity } from '../entity/AggregationEntity';

export default class BffAggregationInternalService extends Service {
  public async initAggregation(aggregation: AggregationInit) {
    const { mysql } = this.ctx.app;
    const conn = await mysql.beginTransaction();
    try {
      await conn.delete('bff_aggregation_requirement', {
        service_name: aggregation.serviceName,
      });
      await conn.delete('bff_aggregation_provider', {
        service_name: aggregation.serviceName,
      });
      // requirement
      for (const requirement of aggregation.requirements) {
        for (const attribute of requirement.attributes) {
          await conn.insert<AggregationRequirementEntity>('bff_aggregation_requirement', {
            service_name: aggregation.serviceName,
            class_name: attribute.className,
            method: requirement.method,
            path: requirement.path,
            array_flag: attribute.arrayFlag ? 1 : 0,
            attribute: attribute.attribute,
            params: JSON.stringify(attribute.params),
          });
        }
      }
      // provider
      for (const provider of aggregation.providers) {
        await conn.insert<AggregationProviderEntity>('bff_aggregation_provider', {
          service_name: aggregation.serviceName,
          path: provider.path,
          method: provider.method,
          class_name: provider.className,
          array_flag: provider.arrayFlag ? 1 : 0,
          params: JSON.stringify(provider.params),
        });
      }
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    }
  }
}
