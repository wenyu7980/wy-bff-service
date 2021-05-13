/** 提供方接口表 */
export interface ProviderEntity {
  type_name: string;
  service_name: string;
  path: string;
  params: string;
}

/** 类型属性表 */
export interface RequirementAttributeEntity {
  service_name: string;
  type_name: string;
  name: string;
  type: string;
  params: string;
}

/** 需求接口表 */
export interface RequirementEntity {
  service_name: string;
  method: string;
  path: string;
  return_type_name: string;
}

/** 需求接口表 */
export interface RequirementTypeEntity {
  service_name: string;
  method: string;
  path: string;
  type_name: string;
}

