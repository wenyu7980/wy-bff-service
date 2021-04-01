// agent.ts
import { Agent } from 'egg';
import { saveNacosRemoteConfig } from './lib/configHandler';
import { NacosHost } from 'egg-nacos-ts/typings/interface';

export default class AgentBootHook {
  private SERVICE_SUBS: Map<string, any> = new Map<string, any>();

  constructor(private readonly agent: Agent) {
  }

  async didReady() {
    // 把nacos远程配置保存到临时文件，供appWorker调用。
    await saveNacosRemoteConfig(this.agent);
    // 增量监听nacos的服务注册
    this.agent.messenger.on('AGENT_SERVICE', name => {
      if (!this.SERVICE_SUBS.has(name)) {
        this.SERVICE_SUBS.set(name, this.agent.nacosNaming
          .nacosNamingClient.subscribe(name, (hosts: NacosHost[]) => {
            const service = hosts.sort((a, b) => b.weight - a.weight)?.[0];
            this.agent.messenger
              .sendToApp('WORK_SERVICE', { name, url: service && `http://${service.ip}:${service.port}` });
          }));
      }
    });
  }
}
