const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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
        console.log('Server is running on port', process.env.PORT || 8999);
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
  if (!date || !time) return res.status(400).json({ error: 'Date and time are required' });

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

app.get('/respond/:token', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'respond.html'));
});

app.get('/api/appointments/:token/respond', async (req, res) => {
  const { token } = req.params;
  try {
    const appointmentResult = await pool.query(
      'SELECT id, date, time FROM appointments WHERE token = $1',
      [token]
    );
    if (appointmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = appointmentResult.rows[0];
    const responsesResult = await pool.query(
      'SELECT name, response FROM responses WHERE appointment_id = $1',
      [appointment.id]
    );

    res.json({
      date: appointment.date,
      time: appointment.time,
      responses: responsesResult.rows
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/appointments/:token/respond', async (req, res) => {
  const { token } = req.params;
  const { name, response } = req.body;

  if (!name || !['yes', 'no'].includes(response)) {
    return res.status(400).json({ error: 'Name and valid response required' });
  }

  try {
    const appointmentResult = await pool.query(
      'SELECT id FROM appointments WHERE token = $1',
      [token]
    );
    if (appointmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointmentId = appointmentResult.rows[0].id;

    await pool.query(
      'INSERT INTO responses (appointment_id, name, response) VALUES ($1, $2, $3)',
      [appointmentId, name, response]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/', (req, res) => {
  res.send('Server is running!');
});

connectWithRetry();
