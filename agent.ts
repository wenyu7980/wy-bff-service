// agent.ts
import { Agent } from 'egg';
import { saveNacosRemoteConfig } from './lib/configHandler';

export default class AgentBootHook {
  constructor(private readonly agent: Agent) {
  }

  async didReady() {
    // 把nacos远程配置保存到临时文件，供appWorker调用。
    await saveNacosRemoteConfig(this.agent);
  }
}
