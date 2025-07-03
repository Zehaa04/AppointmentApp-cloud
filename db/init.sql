CREATE DATABASE appointmentdb;

\connect appointmentdb

CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  time TIME NOT NULL,
  token VARCHAR NOT NULL
);

CREATE TABLE responses (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  response VARCHAR CHECK (response IN ('yes', 'no')) NOT NULL,
  CONSTRAINT unique_appointment_name UNIQUE (appointment_id, name)
);
