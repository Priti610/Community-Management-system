-- ==============================================================
-- FixMyCity: Community Issue Management System
-- Database Schema for MySQL
-- Database Name: fixmycity
-- ==============================================================

CREATE DATABASE IF NOT EXISTS `fixmycity` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `fixmycity`;

-- Disable foreign key checks for clean teardown/rebuild if needed
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `complaint_photos`;
DROP TABLE IF EXISTS `complaint_updates`;
DROP TABLE IF EXISTS `complaints`;
DROP TABLE IF EXISTS `departments`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------------
-- 1. Table structure for table `users`
-- --------------------------------------------------------------
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `role` ENUM('citizen', 'admin') NOT NULL DEFAULT 'citizen',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------
-- 2. Table structure for table `departments`
-- --------------------------------------------------------------
CREATE TABLE `departments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------
-- 3. Table structure for table `complaints`
-- --------------------------------------------------------------
CREATE TABLE `complaints` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `complaint_id` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` INT NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `status` ENUM('Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected') NOT NULL DEFAULT 'Submitted',
  `department_id` INT DEFAULT NULL,
  `assigned_to` VARCHAR(255) DEFAULT NULL,
  `admin_remark` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_complaint_id` (`complaint_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_category` (`category`),
  INDEX `idx_department_id` (`department_id`),
  CONSTRAINT `fk_complaints_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_complaints_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------
-- 4. Table structure for table `complaint_updates`
-- --------------------------------------------------------------
CREATE TABLE `complaint_updates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `complaint_id` VARCHAR(50) NOT NULL,
  `old_status` VARCHAR(50) DEFAULT NULL,
  `new_status` VARCHAR(50) NOT NULL,
  `remark` TEXT DEFAULT NULL,
  `updated_by` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_history_complaint_id` (`complaint_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------
-- 5. Table structure for table `complaint_photos`
-- --------------------------------------------------------------
CREATE TABLE `complaint_photos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `complaint_id` VARCHAR(50) NOT NULL,
  `image_url` TEXT NOT NULL,
  `uploaded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_photo_complaint_id` (`complaint_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------
-- SEED DATA: Departments
-- --------------------------------------------------------------
INSERT INTO `departments` (`id`, `name`, `description`) VALUES
(1, 'Sanitation Department', 'Waste collection, street cleaning, dumpster overflow, and public trash management.'),
(2, 'Road Department', 'Potholes, curb repairs, sidewalk maintenance, paving, and road markings.'),
(3, 'Water Department', 'Main line leaks, water pressure failures, meter issues, and municipal supply.'),
(4, 'Electricity Department', 'Streetlights, traffic lights, exposed wiring, and power grid infrastructure.'),
(5, 'Drainage Department', 'Storm drains, clogged gutters, sewage overflow, and flooding mitigation.'),
(6, 'General Civic Department', 'Parks, public restrooms, benches, signage, and general municipal amenities.');

-- --------------------------------------------------------------
-- SEED DATA: Users
-- Passwords below are hashed with bcrypt (password is 'password123')
-- --------------------------------------------------------------
INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `role`, `created_at`) VALUES
(1, 'Citizen Resident', 'citizen@fixmycity.org', '$2a$10$w8B7iM.v6XmU/xHq3C6ege8wW8p1d2cT0w5s4f1V3b9a0m1q2y4u2', '+1 (555) 234-5678', 'citizen', '2026-09-20 09:00:00'),
(2, 'Municipal Administrator', 'admin@fixmycity.org', '$2a$10$w8B7iM.v6XmU/xHq3C6ege8wW8p1d2cT0w5s4f1V3b9a0m1q2y4u2', '+1 (555) 987-6543', 'admin', '2026-09-20 09:00:00');

-- --------------------------------------------------------------
-- SEED DATA: Complaints (Matching Prototype Numbers)
-- --------------------------------------------------------------
INSERT INTO `complaints` (`id`, `complaint_id`, `user_id`, `category`, `title`, `description`, `location`, `status`, `department_id`, `assigned_to`, `admin_remark`, `created_at`, `updated_at`) VALUES
(1, 'FMC-2026-0C2083', 1, 'Damaged Roads', 'Broken curb ramp outside library', 'The curb ramp is cracked and difficult for wheelchair users to cross safely.', 'Central Library, West entrance', 'Submitted', NULL, NULL, NULL, '2026-09-24 10:55:00', '2026-09-24 10:55:00'),
(2, 'FMC-2026-2DCC7C', 1, 'Other Civic Problems', 'Public ingress test report', 'Walkway barrier has dislodged causing safety obstruction for pedestrians.', 'Test Plaza', 'Submitted', NULL, NULL, NULL, '2026-09-24 10:54:00', '2026-09-24 10:54:00'),
(3, 'FMC-2026-5FA9B7', 1, 'Garbage Accumulation', 'Overflowing bins near Riverside Park', 'Multiple recycling and trash bins are overflowing onto the grass after the weekend market.', 'Riverside Park, North Gate', 'In Progress', 1, 'Officer Dave Miller', 'Dispatched Sanitation Crew #3 for bulk cleanup.', '2026-09-24 10:53:00', '2026-09-24 11:30:00'),
(4, 'FMC-2026-50B11F', 1, 'Damaged Roads', 'Large pothole on Maple Avenue', 'Deep pothole in the right lane damaging vehicular tires and creating hazard for bikes.', 'Maple Avenue, Block 4', 'Under Review', 2, NULL, 'Initial inspection queued with road assessment surveyor.', '2026-09-24 10:53:00', '2026-09-24 11:15:00'),
(5, 'FMC-2026-20082E', 1, 'Water Leakage', 'Water leaking from sidewalk valve', 'Continuous stream of clean water escaping through municipal shutoff valve casing.', '5th Street & Elm Way', 'Assigned', 3, 'Inspector Rodriguez', 'Assigned to Water Maintenance Division Team Alpha.', '2026-09-24 10:53:00', '2026-09-24 11:20:00'),
(6, 'FMC-2026-88A129', 1, 'Streetlight Problems', 'Streetlight flickering at night', 'Pole #42 bulb is strobing continuously creating visibility hazard for motorists.', 'Oakland Boulevard, Pole #42', 'Resolved', 4, 'Technician Kyle Vance', 'Replaced ballast and LED fixture. Tested functional.', '2026-09-23 16:15:00', '2026-09-24 09:40:00');

-- --------------------------------------------------------------
-- SEED DATA: Complaint Updates (Timeline History)
-- --------------------------------------------------------------
INSERT INTO `complaint_updates` (`complaint_id`, `old_status`, `new_status`, `remark`, `updated_by`, `created_at`) VALUES
('FMC-2026-0C2083', NULL, 'Submitted', 'Complaint submitted by citizen.', 'Citizen Resident', '2026-09-24 10:55:00'),
('FMC-2026-2DCC7C', NULL, 'Submitted', 'Complaint submitted by citizen.', 'Citizen Resident', '2026-09-24 10:54:00'),
('FMC-2026-5FA9B7', NULL, 'Submitted', 'Complaint submitted by citizen.', 'Citizen Resident', '2026-09-24 10:53:00'),
('FMC-2026-5FA9B7', 'Submitted', 'Under Review', 'Report reviewed by dispatch.', 'Municipal Officer', '2026-09-24 11:00:00'),
('FMC-2026-5FA9B7', 'Under Review', 'Assigned', 'Assigned to Sanitation Department', 'Municipal Officer', '2026-09-24 11:10:00'),
('FMC-2026-5FA9B7', 'Assigned', 'In Progress', 'Sanitation Crew #3 dispatched to North Gate.', 'Municipal Officer', '2026-09-24 11:30:00'),
('FMC-2026-50B11F', NULL, 'Submitted', 'Complaint submitted by citizen.', 'Citizen Resident', '2026-09-24 10:53:00'),
('FMC-2026-50B11F', 'Submitted', 'Under Review', 'Prioritizing safety hazard assessment.', 'Municipal Officer', '2026-09-24 11:15:00'),
('FMC-2026-20082E', NULL, 'Submitted', 'Complaint submitted by citizen.', 'Citizen Resident', '2026-09-24 10:53:00'),
('FMC-2026-20082E', 'Submitted', 'Under Review', 'Initial triage complete.', 'Municipal Officer', '2026-09-24 11:05:00'),
('FMC-2026-20082E', 'Under Review', 'Assigned', 'Assigned to Water Department (Inspector Rodriguez).', 'Municipal Officer', '2026-09-24 11:20:00'),
('FMC-2026-88A129', NULL, 'Submitted', 'Complaint submitted by citizen.', 'Citizen Resident', '2026-09-23 16:15:00'),
('FMC-2026-88A129', 'Submitted', 'Assigned', 'Assigned to Electricity Department.', 'Municipal Officer', '2026-09-23 17:00:00'),
('FMC-2026-88A129', 'Assigned', 'In Progress', 'Repair truck dispatched.', 'Municipal Officer', '2026-09-24 08:30:00'),
('FMC-2026-88A129', 'In Progress', 'Resolved', 'Replaced ballast and LED fixture. Tested functional.', 'Municipal Officer', '2026-09-24 09:40:00');
