-- ========================================
-- Student Management System MySQL Database Init Script
-- ========================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Django Token Auth Table
-- ----------------------------

DROP TABLE IF EXISTS `authtoken_token`;
CREATE TABLE `authtoken_token` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created` datetime(6) NOT NULL,
  `key` varchar(40) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`),
  KEY `token_user_id` (`user_id`),
  CONSTRAINT `token_user_id_refs_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Django Auth Tables
-- ----------------------------

DROP TABLE IF EXISTS `auth_group`;
CREATE TABLE `auth_group` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `auth_group_permissions`;
CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` bigint NOT NULL,
  `permission_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `group_id` (`group_id`, `permission_id`),
  KEY `auth_group_permissions_group_id_b76f8aba` (`group_id`),
  KEY `auth_group_permissions_permission_id_9deb68a3` (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `auth_permission`;
CREATE TABLE `auth_permission` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` bigint NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `content_type_id` (`content_type_id`, `codename`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `django_content_type`;
CREATE TABLE `django_content_type` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `app_label` (`app_label`, `model`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `django_migrations`;
CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `django_session`;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c6267f` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- User Table (Custom User Model)
-- ----------------------------

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'student',
  `student_id` varchar(20) DEFAULT NULL,
  `employee_id` varchar(20) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `avatar` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `student_id` (`student_id`),
  UNIQUE KEY `employee_id` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `user_groups`;
CREATE TABLE `user_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `group_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`, `group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `user_user_permissions`;
CREATE TABLE `user_user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `permission_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`, `permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Course Table
-- ----------------------------

DROP TABLE IF EXISTS `course`;
CREATE TABLE `course` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `teacher_id` bigint NOT NULL,
  `name` varchar(200) NOT NULL,
  `code` varchar(50) NOT NULL,
  `description` longtext NOT NULL,
  `credits` int NOT NULL DEFAULT '0',
  `semester` varchar(50) NOT NULL,
  `max_students` int NOT NULL DEFAULT '50',
  `cover_image` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `course_teacher_id_b694c4f5` (`teacher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Enrollment Table
-- ----------------------------

DROP TABLE IF EXISTS `enrollment`;
CREATE TABLE `enrollment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `student_id` bigint NOT NULL,
  `course_id` bigint NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'active',
  `enrolled_at` datetime NOT NULL,
  `completed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_id` (`student_id`, `course_id`),
  KEY `enrollment_course_id_82c44e2e` (`course_id`),
  KEY `enrollment_student_id_75934c6f` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Task Table
-- ----------------------------

DROP TABLE IF EXISTS `task`;
CREATE TABLE `task` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `course_id` bigint NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` longtext NOT NULL,
  `due_date` datetime NOT NULL,
  `total_score` float NOT NULL,
  `weight` float NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `task_course_id_5559635f` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Task Submission Table
-- ----------------------------

DROP TABLE IF EXISTS `task_submission`;
CREATE TABLE `task_submission` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `student_id` bigint NOT NULL,
  `task_id` bigint NOT NULL,
  `content` longtext NOT NULL,
  `attachment` varchar(100) DEFAULT NULL,
  `score` float DEFAULT NULL,
  `feedback` longtext DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `submitted_at` datetime NOT NULL,
  `graded_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_id` (`student_id`, `task_id`),
  KEY `task_submission_student_id_5d294d93` (`student_id`),
  KEY `task_submission_task_id_9106cc75` (`task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Course Resource Table
-- ----------------------------

DROP TABLE IF EXISTS `course_resource`;
CREATE TABLE `course_resource` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `course_id` bigint NOT NULL,
  `uploaded_by_id` bigint DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `description` longtext DEFAULT NULL,
  `resource_type` varchar(20) NOT NULL,
  `file` varchar(100) NOT NULL,
  `file_size` int NOT NULL DEFAULT '0',
  `download_count` int NOT NULL DEFAULT '0',
  `is_visible` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `course_resource_course_id_47d8cca5` (`course_id`),
  KEY `course_resource_uploaded_by_id_a4d9e76f` (`uploaded_by_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Announcement Table
-- ----------------------------

DROP TABLE IF EXISTS `announcement`;
CREATE TABLE `announcement` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `course_id` bigint NOT NULL,
  `created_by_id` bigint DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `content` longtext NOT NULL,
  `priority` varchar(20) NOT NULL DEFAULT 'normal',
  `is_pinned` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `announcement_course_id_2cf9ee64` (`course_id`),
  KEY `announcement_created_by_id_359ccf50` (`created_by_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Add Foreign Key Constraints
-- ----------------------------

ALTER TABLE `course`
  ADD CONSTRAINT `course_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

ALTER TABLE `enrollment`
  ADD CONSTRAINT `enrollment_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enrollment_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`) ON DELETE CASCADE;

ALTER TABLE `task`
  ADD CONSTRAINT `task_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`) ON DELETE CASCADE;

ALTER TABLE `task_submission`
  ADD CONSTRAINT `task_submission_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `task_submission_ibfk_2` FOREIGN KEY (`task_id`) REFERENCES `task` (`id`) ON DELETE CASCADE;

ALTER TABLE `course_resource`
  ADD CONSTRAINT `course_resource_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_resource_ibfk_2` FOREIGN KEY (`uploaded_by_id`) REFERENCES `user` (`id`) ON DELETE SET NULL;

ALTER TABLE `announcement`
  ADD CONSTRAINT `announcement_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `announcement_ibfk_2` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE SET NULL;

ALTER TABLE `user_groups`
  ADD CONSTRAINT `user_groups_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_groups_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`) ON DELETE CASCADE;

ALTER TABLE `user_user_permissions`
  ADD CONSTRAINT `user_user_permissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_user_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`) ON DELETE CASCADE;

ALTER TABLE `auth_group_permissions`
  ADD CONSTRAINT `auth_group_permissions_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `auth_group_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`) ON DELETE CASCADE;

ALTER TABLE `authtoken_token`
  ADD CONSTRAINT `authtoken_token_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

-- ----------------------------
-- Insert Initial Data
-- ----------------------------

-- Admin User (Password: admin123)
INSERT INTO `user` (`id`, `password`, `last_login`, `is_superuser`, `username`, `first_name`, `last_name`, `email`, `is_staff`, `is_active`, `date_joined`, `role`, `student_id`, `employee_id`, `phone`, `avatar`, `created_at`, `updated_at`) VALUES
(1, 'pbkdf2_sha256$1000000$hXfDOqzWBcKYYfRvE4rJ1y$F4qPozDB1uNvpaFlDqTmokvpL8z1XDG2ktguyfKPJ20=', NULL, 1, 'admin', 'System', 'Admin', 'admin@school.edu', 1, 1, NOW(), 'admin', NULL, NULL, NULL, NULL, NOW(), NOW());

-- Teacher Users (Password: teacher123)
INSERT INTO `user` (`id`, `password`, `last_login`, `is_superuser`, `username`, `first_name`, `last_name`, `email`, `is_staff`, `is_active`, `date_joined`, `role`, `student_id`, `employee_id`, `phone`, `avatar`, `created_at`, `updated_at`) VALUES
(2, 'pbkdf2_sha256$1000000$zUyU5lkoSAtCfPvu8w8Pnk$lxB1sXDWou2fXTGn8lNyEaq6wQG5EN8KGUedH9rAzCw=', NULL, 0, 'teacher_zhang', 'Wei', 'Zhang', 'zhang@school.edu', 0, 1, NOW(), 'teacher', NULL, 'T001', NULL, NULL, NOW(), NOW()),
(3, 'pbkdf2_sha256$1000000$zUyU5lkoSAtCfPvu8w8Pnk$lxB1sXDWou2fXTGn8lNyEaq6wQG5EN8KGUedH9rAzCw=', NULL, 0, 'teacher_li', 'Fang', 'Li', 'li@school.edu', 0, 1, NOW(), 'teacher', NULL, 'T002', NULL, NULL, NOW(), NOW()),
(4, 'pbkdf2_sha256$1000000$zUyU5lkoSAtCfPvu8w8Pnk$lxB1sXDWou2fXTGn8lNyEaq6wQG5EN8KGUedH9rAzCw=', NULL, 0, 'teacher_wang', 'Qiang', 'Wang', 'wang@school.edu', 0, 1, NOW(), 'teacher', NULL, 'T003', NULL, NULL, NOW(), NOW());

-- Student Users (Password: student123)
INSERT INTO `user` (`id`, `password`, `last_login`, `is_superuser`, `username`, `first_name`, `last_name`, `email`, `is_staff`, `is_active`, `date_joined`, `role`, `student_id`, `employee_id`, `phone`, `avatar`, `created_at`, `updated_at`) VALUES
(5, 'pbkdf2_sha256$1000000$DmXdbwfYfy8kgskq7kuK6G$F+UPkEIPP17UKqGqb6Qs9WeyfuE8JcQOVRtpKyXd0fk=', NULL, 0, 'student_liu', 'Yang', 'Liu', 'liu@student.edu', 0, 1, NOW(), 'student', 'S2021001', NULL, NULL, NULL, NOW(), NOW()),
(6, 'pbkdf2_sha256$1000000$DmXdbwfYfy8kgskq7kuK6G$F+UPkEIPP17UKqGqb6Qs9WeyfuE8JcQOVRtpKyXd0fk=', NULL, 0, 'student_chen', 'Jing', 'Chen', 'chen@student.edu', 0, 1, NOW(), 'student', 'S2021002', NULL, NULL, NULL, NOW(), NOW()),
(7, 'pbkdf2_sha256$1000000$DmXdbwfYfy8kgskq7kuK6G$F+UPkEIPP17UKqGqb6Qs9WeyfuE8JcQOVRtpKyXd0fk=', NULL, 0, 'student_zhao', 'Lei', 'Zhao', 'zhao@student.edu', 0, 1, NOW(), 'student', 'S2021003', NULL, NULL, NULL, NOW(), NOW()),
(8, 'pbkdf2_sha256$1000000$DmXdbwfYfy8kgskq7kuK6G$F+UPkEIPP17UKqGqb6Qs9WeyfuE8JcQOVRtpKyXd0fk=', NULL, 0, 'student_sun', 'Li', 'Sun', 'sun@student.edu', 0, 1, NOW(), 'student', 'S2021004', NULL, NULL, NULL, NOW(), NOW()),
(9, 'pbkdf2_sha256$1000000$DmXdbwfYfy8kgskq7kuK6G$F+UPkEIPP17UKqGqb6Qs9WeyfuE8JcQOVRtpKyXd0fk=', NULL, 0, 'student_zhou', 'Ming', 'Zhou', 'zhou@student.edu', 0, 1, NOW(), 'student', 'S2021005', NULL, NULL, NULL, NOW(), NOW());

-- Course Data
INSERT INTO `course` (`id`, `teacher_id`, `name`, `code`, `description`, `credits`, `semester`, `max_students`, `cover_image`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 2, 'Python Programming Basics', 'CS101', 'Python basic syntax, object-oriented programming, and commonly used libraries', 3, '2025-2026 Spring', 40, NULL, 1, NOW(), NOW()),
(2, 2, 'Data Structures and Algorithms', 'CS102', 'Linear lists, trees, graphs, and common algorithm design and analysis', 4, '2025-2026 Spring', 35, NULL, 1, NOW(), NOW()),
(3, 3, 'Database Principles', 'CS201', 'Relational database design, SQL language, transactions and concurrency control', 3, '2025-2026 Spring', 45, NULL, 1, NOW(), NOW()),
(4, 3, 'Computer Networks', 'CS202', 'Network layered model, TCP/IP protocol suite, HTTP, routing algorithms', 3, '2025-2026 Spring', 50, NULL, 1, NOW(), NOW()),
(5, 4, 'Machine Learning Basics', 'CS301', 'Supervised learning, unsupervised learning, neural networks and deep learning introduction', 4, '2025-2026 Spring', 30, NULL, 1, NOW(), NOW()),
(6, 4, 'Software Engineering', 'CS302', 'Software development process, requirements analysis, design patterns, testing and maintenance', 3, '2025-2026 Spring', 40, NULL, 1, NOW(), NOW());

-- Enrollment Data
INSERT INTO `enrollment` (`id`, `student_id`, `course_id`, `status`, `enrolled_at`, `completed_at`) VALUES
(1, 5, 1, 'active', NOW(), NULL),
(2, 5, 2, 'active', NOW(), NULL),
(3, 5, 3, 'active', NOW(), NULL),
(4, 6, 1, 'active', NOW(), NULL),
(5, 6, 3, 'active', NOW(), NULL),
(6, 6, 4, 'active', NOW(), NULL),
(7, 7, 2, 'active', NOW(), NULL),
(8, 7, 4, 'active', NOW(), NULL),
(9, 7, 5, 'active', NOW(), NULL),
(10, 8, 1, 'active', NOW(), NULL),
(11, 8, 5, 'active', NOW(), NULL),
(12, 8, 6, 'active', NOW(), NULL),
(13, 9, 3, 'active', NOW(), NULL),
(14, 9, 4, 'active', NOW(), NULL),
(15, 9, 6, 'active', NOW(), NULL);

-- Task Data
INSERT INTO `task` (`id`, `course_id`, `title`, `description`, `due_date`, `total_score`, `weight`, `created_at`, `updated_at`) VALUES
(1, 1, 'Python Basics Exercises', 'Complete exercises related to lists, dictionaries, and functions', DATE_ADD(NOW(), INTERVAL 7 DAY), 100.0, 0.2, NOW(), NOW()),
(2, 1, 'OOP Assignment', 'Design and implement a simple student information management class', DATE_ADD(NOW(), INTERVAL 14 DAY), 100.0, 0.3, NOW(), NOW()),
(3, 2, 'Sorting Algorithm Implementation', 'Implement bubble, quick, merge sort and analyze complexity', DATE_ADD(NOW(), INTERVAL 5 DAY), 100.0, 0.25, NOW(), NOW()),
(4, 2, 'Binary Tree Traversal', 'Implement pre-order, in-order, post-order traversal algorithms', DATE_ADD(NOW(), INTERVAL 10 DAY), 100.0, 0.25, NOW(), NOW()),
(5, 3, 'Database Design Assignment', 'Design ER diagram for library management system and convert to relational schema', DATE_ADD(NOW(), INTERVAL 8 DAY), 100.0, 0.3, NOW(), NOW()),
(6, 4, 'Network Protocol Analysis Report', 'Use Wireshark to capture and analyze TCP three-way handshake', DATE_ADD(NOW(), INTERVAL 6 DAY), 100.0, 0.2, NOW(), NOW()),
(7, 5, 'Linear Regression Experiment', 'Implement linear regression with sklearn and visualize results', DATE_ADD(NOW(), INTERVAL 12 DAY), 100.0, 0.3, NOW(), NOW()),
(8, 6, 'Requirements Analysis Document', 'Write complete software requirements specification for given system', DATE_ADD(NOW(), INTERVAL 9 DAY), 100.0, 0.25, NOW(), NOW());

-- Task Submission Data
INSERT INTO `task_submission` (`id`, `student_id`, `task_id`, `content`, `attachment`, `score`, `feedback`, `status`, `submitted_at`, `graded_at`) VALUES
(1, 5, 1, 'Completed all exercises, attachment in zip file', NULL, 88.0, 'Good quality, pay attention to code standards', 'graded', NOW(), NOW()),
(2, 5, 3, 'Implemented three sorting algorithms, drew comparison chart with matplotlib', NULL, NULL, NULL, 'submitted', NOW(), NULL),
(3, 6, 1, 'Completed most exercises, need more practice on dictionaries', NULL, 75.0, 'Good foundation, keep it up', 'graded', NOW(), NOW()),
(4, 6, 5, 'Completed ER diagram design, relational schema conversion in attachment', NULL, 92.0, 'Clear design thinking, good normalization', 'graded', NOW(), NOW()),
(5, 7, 3, 'Implemented three sorting algorithms, quick sort with random pivot optimization', NULL, 95.0, 'Excellent! Deep understanding of algorithms', 'graded', NOW(), NOW()),
(6, 8, 1, 'All Python basic exercises completed', NULL, 80.0, 'Keep it up', 'graded', NOW(), NOW()),
(7, 9, 5, 'ER diagram completed, please review teacher', NULL, NULL, NULL, 'submitted', NOW(), NULL);

-- Announcement Data
INSERT INTO `announcement` (`id`, `course_id`, `created_by_id`, `title`, `content`, `priority`, `is_pinned`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 'First Assignment Released', 'Python basics exercises have been released. Please complete and submit on time.', 'normal', 0, 1, NOW(), NOW()),
(2, 1, 2, 'Midterm Exam Schedule', 'Midterm exam will be held next Friday 9:00-11:00 in Building 3 Room 302. Please prepare in advance.', 'high', 1, 1, NOW(), NOW()),
(3, 2, 2, 'Algorithm Assignment Deadline Reminder', 'Sorting algorithm assignment deadline is Sunday 23:59. Please submit as soon as possible.', 'urgent', 1, 1, NOW(), NOW()),
(4, 3, 3, 'Database Course Notice', 'This week class has been moved to Thursday 15:00-17:00. Please note the change.', 'normal', 0, 1, NOW(), NOW()),
(5, 5, 4, 'Machine Learning Lab Environment Setup', 'Please install Python 3.10+, scikit-learn, pandas, matplotlib before next class.', 'high', 1, 1, NOW(), NOW()),
(6, 6, 4, 'Software Engineering Project Instructions', 'Final project requires 3 students per team. Please form teams and register by this Friday.', 'normal', 0, 1, NOW(), NOW());

SET FOREIGN_KEY_CHECKS = 1;

-- ========================================
-- Initial Account Information
-- ========================================
-- Admin: admin / admin123
-- Teacher: teacher_zhang / teacher123
-- Student: student_liu / student123
