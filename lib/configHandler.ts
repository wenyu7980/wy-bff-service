import { Agent, EggApplication } from 'egg';
import * as fs from 'fs';
import * as path from 'path';
import * as YAML from 'yamljs';
import * as is from 'is-type-of';

// 临时写入的远程配置文件
export const nacosRuntimeFile = './run/nacos-remote-config.json';

/**
 * 使用字符串深度获取对象属性
 * @param object
 * @param path
 * @param defaultValue
 */
export const deepGet = (object, path, defaultValue?) => {
  return (
    (!Array.isArray(path) ? path.replace(/\[/g, '.')
      .replace(/\]/g, '')
      .split('.') : path
    ).reduce((o, k) => (o || {})[k], object) || defaultValue
  );
};

/**
 * 深度遍历配置文件，检查模板字段，并替换。
 * @param obj
 * @param cb
 */
export const depthSearch = (obj, config) => {
  const regular = /^\$\{(.*)+\}$/;
  for (const index in obj) {
    const item = obj[index];
    if (is.object(item)) {
      depthSearch(item, config);
    } else if (is.string(item) && regular.test(item)) {
      // console.log(item,  deepGet(config, temp[1], ''));
      const temp = item.match(regular);
      obj[index] = deepGet(config, temp[1], '');
    }
  }
};

/**
 * agentWorker获取nacos配置数据，
 * 写入到运行时文件中，供appWorker调用。
 * @param agent
 */
export const saveNacosRemoteConfig = async (agent: Agent) => {
  const { nacosConfig } = agent;
  try {
    const configs = await nacosConfig.getAllConfigs();
    if (configs.length < 1) {
      throw new Error('Nacos配置信息未找到');
    }
    const configData = YAML.parse(Object.values(configs[0])[0]);
    const tempConfigFile = path.join(agent.baseDir, nacosRuntimeFile);
    fs.writeFileSync(tempConfigFile, JSON.stringify(configData));
  } catch (err) {
    agent.logger.error(err);
    throw new Error('Nacos配置信息获取失败！');
  }
};

/**
 * 从临时文件中读取agentWorker保存的远程配置文件，
 * 并修改当前项目中的config文件。
 * @param app
 */
export const initNacosConfig = (app: EggApplication) => {
  const tempConfigFile = path.join(app.baseDir, nacosRuntimeFile);
  try {
    const content = fs.readFileSync(tempConfigFile);
    const remoteConfig = JSON.parse(content.toString());
    depthSearch(app.config, remoteConfig);
  } catch (err) {
    app.logger.error('nacos配置文件读取失败！');
    throw err;
  }
};
