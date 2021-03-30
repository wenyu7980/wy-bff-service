import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
  const { NACOS_ADDRESS, NACOS_NAMESPACE, NACOS_GROUP_NAME, ADDRESS, PORT } = global.process.env;
  const config: PowerPartial<EggAppConfig> = {};
  config.logger = {
    level: 'WARN',
  };
  config.cluster = {
    listen: {
      port: PORT,
    },
  };
  // nacos
  config.nacos = {
    serverList: [ NACOS_ADDRESS ],
    namespace: NACOS_NAMESPACE,
    configCenter: { // 配置中心相关配置
      clientOptions: {},
      configList: {
        baseConfig: {
          dataId: 'wy-aggregation',
          groupName: NACOS_GROUP_NAME,
        },
      },
    },
    providers: {
      AggregationService: {
        serviceName: NACOS_GROUP_NAME,
        instance: {
          ip: ADDRESS,
          port: PORT,
        },
        groupName: NACOS_GROUP_NAME,
      },
    },
  };
  return config;
};
