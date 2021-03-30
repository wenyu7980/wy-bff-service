exports.schedule = {
  interval: '1s', // 1 分钟间隔
  type: 'worker',
};
exports.task = async function(ctx: any) {
  const { mysql } = ctx.app;
  const services = (await mysql.query('SELECT distinct service_name from aggregation_provider' +
    ' UNION SELECT distinct service_name from aggregation_requirement'))
    .map(d => d.service_name);
  for (const name of services) {
    ctx.app.messenger.sendToAgent('AGENT_SERVICE', name);
  }
};
