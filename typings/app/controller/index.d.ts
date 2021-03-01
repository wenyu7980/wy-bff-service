// This file is created by egg-ts-helper@1.25.8
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAggregationController from '../../../app/controller/AggregationController';
import ExportAggregationInternalController from '../../../app/controller/AggregationInternalController';

declare module 'egg' {
  interface IController {
    aggregationController: ExportAggregationController;
    aggregationInternalController: ExportAggregationInternalController;
  }
}
