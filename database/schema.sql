CREATE DATABASE IF NOT EXISTS sbpbs_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sbpbs_db;
CREATE TABLE IF NOT EXISTS projects (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  project_name VARCHAR(180) NOT NULL,
  owner VARCHAR(180), location VARCHAR(300), area DOUBLE, floors INT, style VARCHAR(80),
  analysis_json LONGTEXT, created_at TIMESTAMP(6) NULL,
  INDEX idx_projects_created_at (created_at)
);
