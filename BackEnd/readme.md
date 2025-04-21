
Table: admins
Create Table: CREATE TABLE `admins` (
  `admin_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `role` enum('superadmin','event_manager') DEFAULT 'event_manager',
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `email` (`email`)
)
-----------------------------------------------------------------------------------
 Table: attendance
Create Table: CREATE TABLE `attendance` (
  `attendance_id` int NOT NULL AUTO_INCREMENT,
  `student_id` int DEFAULT NULL,
  `event_id` int DEFAULT NULL,
  `volunteer_id` int DEFAULT NULL,
  `attendance_status` enum('pending','present','absent') NOT NULL DEFAULT 'pending',
  `location_latitude` decimal(10,8) DEFAULT NULL,
  `location_longitude` decimal(11,8) DEFAULT NULL,
  `start_time` timestamp NULL DEFAULT NULL,
  `end_time` timestamp NULL DEFAULT NULL,
  `date` date NOT NULL,
  PRIMARY KEY (`attendance_id`),
  KEY `student_id` (`student_id`),
  KEY `volunteer_id` (`volunteer_id`),
  KEY `attendance_ibfk_2` (`event_id`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`),
  CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`) ON DELETE SET NULL,
  CONSTRAINT `attendance_ibfk_3` FOREIGN KEY (`volunteer_id`) REFERENCES `volunteers` (`volunteer_id`)
)
-----------------------------------------------------------------------------------------------
Table: events
Create Table: CREATE TABLE `events` (
  `event_id` int NOT NULL AUTO_INCREMENT,
  `event_name` varchar(255) NOT NULL,
  `event_description` text,
  `event_date` date DEFAULT NULL,
  `event_time` time DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `volunteer_id` int DEFAULT NULL,
  `is_completed` tinyint(1) DEFAULT '0',
  `is_started` tinyint DEFAULT '0',
  PRIMARY KEY (`event_id`),
  KEY `volunteer_id` (`volunteer_id`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`volunteer_id`) REFERENCES `volunteers` (`volunteer_id`)
)
-----------------------------------------------------------------------------------------------------------
 Table: students
Create Table: CREATE TABLE `students` (
  `student_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `registration_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `volunteer_id` int DEFAULT NULL,
  PRIMARY KEY (`student_id`),
  UNIQUE KEY `email` (`email`),
  KEY `volunteer_id` (`volunteer_id`),
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`volunteer_id`) REFERENCES `volunteers` (`volunteer_id`)
)
-----------------------------------------------------------------------------------------------------------------
Table: volunteerAttendance
Create Table: CREATE TABLE `volunteerAttendance` (
  `volunteer_attendance_id` int NOT NULL AUTO_INCREMENT,
  `volunteer_id` int NOT NULL,
  `location_latitude` varchar(50) DEFAULT NULL,
  `location_longitude` varchar(50) DEFAULT NULL,
  `attendance_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `start_time` timestamp NULL DEFAULT NULL,
  `end_time` timestamp NULL DEFAULT NULL,
  `event_id` int DEFAULT NULL,
  PRIMARY KEY (`volunteer_attendance_id`),
  KEY `volunteer_id` (`volunteer_id`),
  CONSTRAINT `volunteerAttendance_ibfk_1` FOREIGN KEY (`volunteer_id`) REFERENCES `volunteers` (`volunteer_id`)
) 
-----------------------------------------------------------------------------------------------------------------------
 Table: volunteers
Create Table: CREATE TABLE `volunteers` (
  `volunteer_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `registration_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`volunteer_id`),
  UNIQUE KEY `email` (`email`)
) 
--------------------------------------------------------------------------------------------------------------------------
