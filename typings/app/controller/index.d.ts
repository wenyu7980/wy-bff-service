// This file is created by egg-ts-helper@1.25.8
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportDataAggregationController from '../../../app/controller/DataAggregationController';

declare module 'egg' {
  interface IController {
    dataAggregationController: ExportDataAggregationController;
  }
}
