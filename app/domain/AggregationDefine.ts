export interface AggregationInit {
  readonly serviceName: string;
  readonly providers: AggregationProvider[];
  readonly requirements: AggregationRequirement[];
}

export interface AggregationProvider {
  readonly path: string;
  readonly className: string;
  readonly arrayFlag: boolean;
  readonly params: {
    name: string;
    pathFlag: boolean;
  }[]
}

export interface AggregationRequirement {
  readonly method: string;
  readonly path: string;
  readonly attributes: AggregationRequirementAttribute[];

}

export interface AggregationRequirementAttribute {
  readonly attribute: string;
  readonly className: string;
  readonly arrayFlag: boolean;
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
