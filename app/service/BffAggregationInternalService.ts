import { Service } from 'egg';
import { AggregationInit } from '../domain/AggregationDefine';
import { AggregationRequirementEntity } from '../entity/AggregationEntity';

export default class BffAggregationInternalService extends Service {
  public async initAggregation(aggregation: AggregationInit) {
    const { mysql } = this.ctx.app;
    await mysql.delete('bff_aggregation_requirement', {
      service_name: aggregation.serviceName,
    });
    await mysql.delete('bff_aggregation_provider', {
      service_name: aggregation.serviceName,
    });
    for (const requirement of aggregation.requirements) {
      for (const attribute of requirement.attributes) {
        await mysql.insert<AggregationRequirementEntity>('bff_aggregation_requirement', {
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
  }
}
