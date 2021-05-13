-- 提供方接口表
CREATE TABLE `aggregation_provider` (
   `type_name` varchar(512) NOT NULL COMMENT '类型名',
   `service_name` varchar(64) NOT NULL COMMENT '服务名',
   `path` varchar(128) NOT NULL COMMENT '路径',
   `params` json DEFAULT NULL COMMENT '参数',
   PRIMARY KEY (`type_name`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
 COLLATE=utf8mb4_general_ci COMMENT='提供方接口表';

-- 类型属性表
CREATE TABLE `aggregation_requirement_attribute`(
   `service_name` varchar(64) NOT NULL COMMENT '服务名',
   `type_name` varchar(512) NOT NULL COMMENT '所属类型名称',
   `name` varchar(128) NOT NULL COMMENT '名称',
   `type` varchar(128) NOT NULL COMMENT '类型名称',
   `params` json DEFAULT NULL COMMENT '参数',
   PRIMARY KEY (`service_name`,`name`,`type_name`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
 COLLATE=utf8mb4_general_ci COMMENT='类型属性表';

-- 需求接口表
CREATE TABLE `aggregation_requirement`(
   `service_name` varchar(64) NOT NULL COMMENT '服务名',
   `method` varchar(16) NOT NULL COMMENT '方法名',
   `path` varchar(128) NOT NULL COMMENT '路径',
   `return_type_name` varchar(512) NOT NULL COMMENT '返回类型名称',
   PRIMARY KEY (`service_name`,`method`,`path`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
 COLLATE=utf8mb4_general_ci COMMENT='需求接口表';

-- 需求接口关联类型关联表
CREATE TABLE `aggregation_requirement_type`(
   `service_name` varchar(64) NOT NULL COMMENT '服务名',
   `method` varchar(16) NOT NULL COMMENT '方法名',
   `path` varchar(128) NOT NULL COMMENT '路径',
   `type_name` varchar(512) NOT NULL COMMENT '名称',
   PRIMARY KEY (`service_name`,`method`,`path`,`type_name`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
 COLLATE=utf8mb4_general_ci COMMENT='需求接口关联类型关联表';

