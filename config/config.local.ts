import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
  const config: PowerPartial<EggAppConfig> = {};
  config.logger = {
    level: 'WARN',
  };
  // nacos
  config.nacos = {
    serverList: [ '127.0.0.1:8848' ],
    namespace: 'public',
    // subscribers: { // 需要监听的服务，不配置不监听
    //   messageService: {
    //     serviceName: 'message-service',
    //   },
    // },
    configCenter: { // 配置中心相关配置
      clientOptions: {},
      configList: {
        baseConfig: {
          dataId: 'application-bff-properties',
          groupName: 'DEFAULT_GROUP',
        },
      },
    },
    providers: {
      bffService: {
        serviceName: 'wy-bff',
        instance: {
          ip: '127.0.0.1',
          port: 7001,
        },
        groupName: 'DEFAULT_GROUP',
      },
    },
  };
  return config;
};
