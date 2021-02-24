import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;
  router.get('/test', controller.dataAggregationController.testMysql);
  router.get('/**', controller.dataAggregationController.getIndex);
};
