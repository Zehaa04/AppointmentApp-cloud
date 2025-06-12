const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send('running');
});

const pool = new Pool({
  host: process.env.DB_HOST || 'db',   
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'postgres',
  port: process.env.DB_PORT || 5432,
});

let retries = 5;

const connectWithRetry = () => {
  pool.connect()
    .then(client => {
      client.release(); 
      app.listen(process.env.PORT || 8999, () => {
        console.log('Server is running...');
      });
    })
    .catch((err) => {
      console.error('DB connection failed, retrying...', err.message);
      if (retries > 0) {
        retries--;
        setTimeout(connectWithRetry, 3000);
      } else {
        console.error('Could not connect to database. Exiting.');
        process.exit(1);
      }
    });
};

app.post('/api/appointments', async (req, res) => {
  const { date, time } = req.body;

  if (!date || !time) {
    return res.status(400).json({ error: 'Date and time are required' });
  }

  const token = uuidv4();

  try {
    await pool.query(
      'INSERT INTO appointments (date, time, token) VALUES ($1, $2, $3)',
      [date, time, token]
    );
    res.json({ token });
  } catch (err) {
    console.error('Database error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

connectWithRetry();
