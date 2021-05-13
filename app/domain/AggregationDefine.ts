export interface AggregationInit {
  readonly serviceName: string;
  readonly providers: Provider[];
  readonly methods: RequirementMethod[];
  readonly types: RequirementType[];
}

export interface Provider {
  readonly path: string;
  readonly typeName: string;
  readonly params: {
    name: string;
    pathFlag: boolean;
  }[]
}

export interface RequirementMethod {
  readonly method: string;
  readonly path: string;
  readonly returnType: string;
  readonly types: string[];

}

export interface RequirementType {
  readonly name: string;
  readonly attributes: RequirementAttribute[];
}

export interface RequirementAttribute {
  readonly name: string;
  readonly type: string;
  readonly params: {
    readonly name: string;
    readonly value: string;
    readonly constant: boolean
  }[]
}

export interface AggregationItem {
  serviceName: string;
  method: string;
  path: string;
}

export interface HeaderRequest {
  serviceName: string;
  method: string;
  path: string;
}
