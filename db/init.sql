CREATE DATABASE appointmentdb;

\connect appointmentdb;

CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  time TIME NOT NULL,
  name VARCHAR(100),
  token VARCHAR(255) UNIQUE NOT NULL,
  response VARCHAR(10)
);
