import { EggPlugin } from 'egg';

const plugin: EggPlugin = {
  // static: true,
  // nunjucks: {
  //   enable: true,
  //   package: 'egg-view-nunjucks',
  // },
  nacos: {
    enable: true,
    package: 'egg-nacos-ts',
  },
  mysql: {
    enable: true,
    package: 'egg-mysql',
  },
};

export default plugin;
