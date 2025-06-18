CREATE DATABASE appointmentdb;

\connect appointmentdb;

CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  time TIME NOT NULL,
  token VARCHAR NOT NULL
);

CREATE TABLE responses (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER REFERENCES appointments(id),
  name VARCHAR NOT NULL,
  response VARCHAR CHECK (response IN ('yes', 'no')) NOT NULL
);

