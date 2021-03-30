CREATE TABLE `aggregation_provider` (
   `class_name` varchar(256) COLLATE utf8mb4_general_ci NOT NULL COMMENT '类型名',
   `array_flag` bit(1) NOT NULL COMMENT '是否是数组',
   `service_name` varchar(128) COLLATE utf8mb4_general_ci NOT NULL COMMENT '服务名',
   `path` varchar(128) COLLATE utf8mb4_general_ci NOT NULL COMMENT '路径',
   `params` json DEFAULT NULL COMMENT '参数',
   PRIMARY KEY (`class_name`,`array_flag`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 
 COLLATE=utf8mb4_general_ci COMMENT='数据聚合提供方'

CREATE TABLE `aggregation_requirement` (
   `service_name` varchar(128) COLLATE utf8mb4_general_ci NOT NULL COMMENT '服务名',
   `method` varchar(45) COLLATE utf8mb4_general_ci NOT NULL COMMENT '方法名',
   `path` varchar(128) COLLATE utf8mb4_general_ci NOT NULL COMMENT '路径',
   `attribute` varchar(256) COLLATE utf8mb4_general_ci NOT NULL COMMENT '属性名',
   `class_name` varchar(256) COLLATE utf8mb4_general_ci NOT NULL COMMENT '类型名',
   `array_flag` bit(1) NOT NULL COMMENT '是否是数组',
   `params` json DEFAULT NULL COMMENT '参数',
   PRIMARY KEY (`service_name`,`method`,`path`,`attribute`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 
 COLLATE=utf8mb4_general_ci COMMENT='数据聚合需求方'

