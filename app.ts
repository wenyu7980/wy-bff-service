import { Application, IBoot } from 'egg';
import { initNacosConfig } from './lib/configHandler';

export default class AppBoot implements IBoot {
  constructor(private app: Application) {
  }

  configWillLoad() {
    initNacosConfig(this.app);
    this.app.context.nacosServices = new Map<string, string>();
  }

  async didReady() {
    this.app.messenger.on('WORK_SERVICE', data => {
      const services = this.app.context.nacosServices as Map<string, string>;
      if (data.url) {
        services.set(data.name, data.url);
      } else {
        services.delete(data.name);
      }
    });
  }
}
