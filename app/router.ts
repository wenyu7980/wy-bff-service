import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;
  router.post('/internal/aggregations', controller.aggregationInternalController.initAggregation);
  router.get('/internal/aggregations', controller.aggregationInternalController.aggregations);
  router.post('/**', controller.aggregationController.postAggregate);
  router.get('/**', controller.aggregationController.getAggregate);
};
