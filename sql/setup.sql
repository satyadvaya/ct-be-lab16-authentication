DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS blatherings;

CREATE TABLE roles (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL UNIQUE
);

CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role_id BIGINT NOT NULL,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE blatherings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, 
  burble TEXT NOT NULL,
  banterer_id BIGINT NOT NULL,
  FOREIGN KEY (banterer_id) REFERENCES users(id)
);

INSERT INTO roles (title)
VALUES ('ADMIN'), ('USER');
