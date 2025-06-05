CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  name VARCHAR(100),
  token VARCHAR(255) UNIQUE NOT NULL,
  response VARCHAR(10)
);
