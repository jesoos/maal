CREATE DATABASE IF NOT EXISTS wordlist;
USE wordlist;

DROP TABLE IF EXISTS texts;
DROP TABLE IF EXISTS words;
DROP TABLE IF EXISTS master;
DROP TABLE IF EXISTS asks;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id   INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nick VARCHAR(60)  NOT NULL UNIQUE,  -- 아이디
  pass BINARY(32)   NOT NULL,         -- 비밀번호 해시 값
  name VARCHAR(60)  NOT NULL,         -- 이름
  mail VARCHAR(100) NOT NULL,         -- 이메일 주소
  rank TINYINT NOT NULL DEFAULT 0,    -- 등급
  sure INT UNSIGNED NULL,             -- 보증인
  FOREIGN KEY(sure) REFERENCES users(id) ON UPDATE CASCADE
);

CREATE TABLE master (
  user INT UNSIGNED NOT NULL,
  FOREIGN KEY(user) REFERENCES users(id) ON UPDATE CASCADE
);

CREATE TABLE asks (
  id   INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  t    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  user INT UNSIGNED NOT NULL,
  mail VARCHAR(100) NOT NULL, -- 이메일 주소
  phone VARCHAR(20) NOT NULL, -- 전화번호
  FOREIGN KEY(user) REFERENCES users(id) ON UPDATE CASCADE
);

CREATE TABLE etc (
  id   INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user INT UNSIGNED NOT NULL,
  data VARCHAR(100) NOT NULL  -- nick name mail sure
);

CREATE TABLE words (
  id   INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  word VARCHAR(100) NOT NULL UNIQUE,  -- 낱말
  user INT UNSIGNED NOT NULL,         -- 교열자
  tell TINYINT NOT NULL DEFAULT 0,    -- 0=더살핌 1=올림 2=버림
  FOREIGN KEY(user) REFERENCES users(id) ON UPDATE CASCADE
);

CREATE TABLE texts (
  id   INT UNSIGNED   NOT NULL AUTO_INCREMENT PRIMARY KEY,
  i    TINYINT        NOT NULL,  -- 0=풀이 1=적바림
  t    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  user INT UNSIGNED   NOT NULL,  -- 갈무리한 이
  word INT UNSIGNED   NOT NULL,  -- 낱말
  data VARCHAR(15000) NOT NULL,  -- 풀이/적바림
  FOREIGN KEY(word) REFERENCES words(id) ON UPDATE CASCADE,
  FOREIGN KEY(user) REFERENCES users(id) ON UPDATE CASCADE
);

-- mysql -h localhost -u scott -p <..\..\htdocs\maal\wordlist.sql
-- mysqldump -h localhost -u scott -p --databases wordlist >wordlist_backup.sql
