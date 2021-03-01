export interface AggregationRequirementEntity {
  service_name: string;
  method: string;
  path: string;
  attribute: string;
  class_name: string;
  array_flag: number;
  params: string;
}

export interface AggregationProviderEntity {
  class_name: string;
  array_flag: number;
  service_name: string;
  path: string;
  params: string;
}

