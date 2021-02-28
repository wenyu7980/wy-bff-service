import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;
  router.post('/internal/aggregations', controller.bffAggregationInternalController.initAggregation);
  router.get('/internal/aggregations', controller.bffAggregationInternalController.aggregations);
  router.get('/**', controller.dataAggregationController.getIndex);
};
