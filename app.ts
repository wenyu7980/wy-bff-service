import { Application, IBoot } from 'egg';
import { initNacosConfig } from './lib/configHandler';

export default class AppBoot implements IBoot {
  constructor(private app: Application) {
  }

  configWillLoad() {
    initNacosConfig(this.app);
  }
}
