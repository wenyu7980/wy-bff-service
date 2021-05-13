import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
  const config: PowerPartial<EggAppConfig> = {};
  config.logger = {
    level: 'INFO',
  };
  config.cluster = {
    listen: {
      port: 8001,
    },
  };
  // nacos
  config.nacos = {
    serverList: [ 'localhost:8848' ],
    namespace: 'public',
    configCenter: { // 配置中心相关配置
      clientOptions: {},
      configList: {
        baseConfig: {
          dataId: 'wy-aggregation',
          groupName: 'DEFAULT_GROUP',
        },
      },
    },
    providers: {
      AggregationService: {
        serviceName: 'wy-aggregation',
        instance: {
          ip: 'localhost',
          port: 8001,
        },
        groupName: 'DEFAULT_GROUP',
      },
    },
  };
  return config;
};
