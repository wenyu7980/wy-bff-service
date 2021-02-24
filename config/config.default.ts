import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1610537372484_8658';

  // add your egg config in here
  config.middleware = [];
  config.mysql = {
    client: {
      host: '${database.host}',
      port: '${database.port}',
      user: '${database.username}',
      password: '${database.password}',
      database: '${database.database}',
    },
  };
  // the return config will combines to EggAppConfig
  return {
    ...config,
  };
};
