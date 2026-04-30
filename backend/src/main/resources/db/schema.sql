-- Requirement Management System Schema
-- MySQL 8.0, utf8mb4, Asia/Shanghai

CREATE DATABASE IF NOT EXISTS `requirement` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `requirement`;

-- 1. t_user
CREATE TABLE `t_user` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL COMMENT 'BCrypt hash',
    `real_name` VARCHAR(50) DEFAULT NULL,
    `enabled` TINYINT(1) DEFAULT 1,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户';

-- 2. t_project
CREATE TABLE `t_project` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(50) NOT NULL UNIQUE,
    `finance_code` VARCHAR(50) DEFAULT NULL COMMENT '财务编号',
    `owner` VARCHAR(50) DEFAULT NULL,
    `manager` VARCHAR(50) DEFAULT NULL,
    `start_date` DATE DEFAULT NULL,
    `end_date` DATE DEFAULT NULL,
    `status` VARCHAR(10) DEFAULT '未开始' COMMENT '未开始/进行中/已完成/已暂停',
    `description` TEXT DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目';

-- 3. t_version
CREATE TABLE `t_version` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `product_name` VARCHAR(100) DEFAULT NULL,
    `project_id` BIGINT NOT NULL,
    `version_number` VARCHAR(50) NOT NULL,
    `start_date` DATE DEFAULT NULL,
    `end_date` DATE DEFAULT NULL,
    `status` VARCHAR(10) DEFAULT '规划中' COMMENT '规划中/进行中/已发布',
    `description` TEXT DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT(1) DEFAULT 0,
    INDEX `idx_project_id` (`project_id`),
    CONSTRAINT `fk_version_project` FOREIGN KEY (`project_id`) REFERENCES `t_project`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='版本';

-- 4. t_iteration
CREATE TABLE `t_iteration` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `project_id` BIGINT DEFAULT NULL,
    `product_name` VARCHAR(100) DEFAULT NULL,
    `version_id` BIGINT DEFAULT NULL,
    `start_date` DATE DEFAULT NULL,
    `end_date` DATE DEFAULT NULL,
    `status` VARCHAR(10) DEFAULT '规划中' COMMENT '规划中/进行中/已完成',
    `description` TEXT DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT(1) DEFAULT 0,
    INDEX `idx_project_id` (`project_id`),
    INDEX `idx_version_id` (`version_id`),
    CONSTRAINT `fk_iteration_project` FOREIGN KEY (`project_id`) REFERENCES `t_project`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_iteration_version` FOREIGN KEY (`version_id`) REFERENCES `t_version`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='迭代';

-- 5. t_requirement (core table)
CREATE TABLE `t_requirement` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(32) NOT NULL UNIQUE COMMENT 'LMT/IR/SR/AR-YYYY-NNN',
    `name` VARCHAR(200) NOT NULL,
    `type` VARCHAR(10) NOT NULL COMMENT 'LMT/IR/SR/AR',
    `customer` VARCHAR(100) NOT NULL,
    `project` VARCHAR(100) DEFAULT NULL,
    `expected_date` DATE NOT NULL,
    `status` VARCHAR(10) DEFAULT '待分析' COMMENT '待分析/进行中/已完成/已关闭',
    `priority` VARCHAR(5) DEFAULT '中' COMMENT '高/中/低',
    `description` TEXT DEFAULT NULL,
    `parent_id` BIGINT DEFAULT NULL COMMENT 'SR→IR, AR→SR',
    `ir_id` BIGINT DEFAULT NULL COMMENT 'LMT关联的IR',
    `iteration_id` BIGINT DEFAULT NULL COMMENT 'AR所属迭代',
    `frontend` VARCHAR(50) DEFAULT NULL COMMENT 'AR前端负责人',
    `backend` VARCHAR(50) DEFAULT NULL COMMENT 'AR后端负责人',
    `tester` VARCHAR(50) DEFAULT NULL COMMENT 'AR测试负责人',
    `test_case_count` INT DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT(1) DEFAULT 0,
    INDEX `idx_type` (`type`),
    INDEX `idx_status` (`status`),
    INDEX `idx_priority` (`priority`),
    INDEX `idx_parent_id` (`parent_id`),
    INDEX `idx_ir_id` (`ir_id`),
    INDEX `idx_iteration_id` (`iteration_id`),
    INDEX `idx_expected_date` (`expected_date`),
    INDEX `idx_type_status` (`type`, `status`),
    INDEX `idx_created_at` (`created_at`),
    CONSTRAINT `fk_requirement_parent` FOREIGN KEY (`parent_id`) REFERENCES `t_requirement`(`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_requirement_ir` FOREIGN KEY (`ir_id`) REFERENCES `t_requirement`(`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_requirement_iteration` FOREIGN KEY (`iteration_id`) REFERENCES `t_iteration`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='需求';

-- 6. t_test_case
CREATE TABLE `t_test_case` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(32) NOT NULL UNIQUE COMMENT 'TC-YYYY-NNN',
    `name` VARCHAR(200) NOT NULL,
    `status` VARCHAR(10) DEFAULT '未执行' COMMENT '通过/失败/未执行',
    `priority` VARCHAR(5) DEFAULT '中' COMMENT '高/中/低',
    `executed_at` DATE DEFAULT NULL,
    `ar_id` BIGINT NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT(1) DEFAULT 0,
    INDEX `idx_ar_id` (`ar_id`),
    CONSTRAINT `fk_testcase_ar` FOREIGN KEY (`ar_id`) REFERENCES `t_requirement`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='测试用例';

-- 7. t_task
CREATE TABLE `t_task` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(32) NOT NULL UNIQUE COMMENT 'TASK-YYYY-NNN',
    `name` VARCHAR(200) NOT NULL,
    `type` VARCHAR(10) NOT NULL COMMENT '需求/测试/临时/调研/支持',
    `assignee` VARCHAR(50) DEFAULT NULL,
    `creator` VARCHAR(50) NOT NULL,
    `deadline` DATE NOT NULL,
    `status` VARCHAR(10) DEFAULT '待分配' COMMENT '待分配/进行中/已完成/已关闭',
    `description` TEXT DEFAULT NULL,
    `related_requirement_id` BIGINT DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT(1) DEFAULT 0,
    INDEX `idx_type` (`type`),
    INDEX `idx_status` (`status`),
    INDEX `idx_assignee` (`assignee`),
    INDEX `idx_deadline` (`deadline`),
    INDEX `idx_creator` (`creator`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务';

-- 8. t_task_history
CREATE TABLE `t_task_history` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `task_id` BIGINT NOT NULL,
    `action` VARCHAR(50) NOT NULL COMMENT '创建/分配/状态变更/修改',
    `operator` VARCHAR(50) NOT NULL,
    `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `old_value` VARCHAR(500) DEFAULT NULL,
    `new_value` VARCHAR(500) DEFAULT NULL,
    `description` VARCHAR(500) DEFAULT NULL,
    CONSTRAINT `fk_task_history_task` FOREIGN KEY (`task_id`) REFERENCES `t_task`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务历史';

-- 9. t_work_item
CREATE TABLE `t_work_item` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL COMMENT '工作安排标题',
    `date` DATE NOT NULL COMMENT '工作日期',
    `type` VARCHAR(10) NOT NULL COMMENT 'meeting/task/review',
    `color` VARCHAR(20) NOT NULL COMMENT '颜色标识',
    `creator` VARCHAR(50) NOT NULL COMMENT '创建人',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT(1) DEFAULT 0,
    INDEX `idx_date` (`date`),
    INDEX `idx_type` (`type`),
    INDEX `idx_creator` (`creator`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作安排';

-- 10. t_project_member
CREATE TABLE `t_project_member` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `project_id` BIGINT NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `role` VARCHAR(20) NOT NULL COMMENT '负责人/项目经理/前端开发/后端开发/测试工程师/产品经理/架构师/UI设计师',
    `email` VARCHAR(100) DEFAULT NULL,
    `phone` VARCHAR(20) DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_member_project` FOREIGN KEY (`project_id`) REFERENCES `t_project`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目成员';

-- 11. t_operation_log
CREATE TABLE `t_operation_log` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `target_type` VARCHAR(20) NOT NULL COMMENT 'project/version/iteration',
    `target_id` BIGINT NOT NULL,
    `action` VARCHAR(50) NOT NULL COMMENT '创建/编辑/删除/状态变更',
    `operator` VARCHAR(50) NOT NULL,
    `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `old_value` VARCHAR(500) DEFAULT NULL,
    `new_value` VARCHAR(500) DEFAULT NULL,
    `description` VARCHAR(500) DEFAULT NULL,
    INDEX `idx_target` (`target_type`, `target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志';

-- Initial admin user (password: admin123, BCrypt hash)
INSERT INTO `t_user` (`username`, `email`, `password`, `real_name`, `enabled`) VALUES
('admin', 'admin@example.com', '$2a$10$yM55UfAFzjVq/2SvIdm5cuI.vt6DTVnhB6C4ymWVetEjGW2SKebmy', '管理员', 1);
