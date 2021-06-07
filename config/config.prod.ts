import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
  const { NACOS_ADDRESS, NACOS_NAMESPACE, NACOS_GROUP_NAME, ADDRESS, SERVER_PORT } = global.process.env;
  const config: PowerPartial<EggAppConfig> = {};
  const port: number = +(SERVER_PORT ?? 0);
  config.logger = {
    level: 'WARN',
  };
  config.cluster = {
    listen: {
      port,
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
        serviceName: 'wy-aggregation',
        instance: {
          ip: ADDRESS,
          port,
        },
        groupName: NACOS_GROUP_NAME,
      },
    },
  };
  return config;
};
