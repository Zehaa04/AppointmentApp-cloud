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
  const { dates } = req.body;

  if (!Array.isArray(dates) || dates.length === 0) {
    return res.status(400).json({ error: 'At least one date-time pair is required' });
  }

  if (!dates.every(d => d.date && d.time)) {
    return res.status(400).json({ error: 'Each appointment must include a date and time' });
  }

  const token = uuidv4();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const { date, time } of dates) {
      await client.query(
        'INSERT INTO appointments (date, time, token) VALUES ($1, $2, $3)',
        [date, time, token]
      );
    }

    await client.query('COMMIT');
    res.json({ token });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Database error:', err.message);
    res.status(500).json({ error: 'Database error' });
  } finally {
    client.release();
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

    const appointments = await Promise.all(appointmentResult.rows.map(async appt => {
      const responsesResult = await pool.query(
        'SELECT name, response FROM responses WHERE appointment_id = $1',
        [appt.id]
      );
      return { ...appt, responses: responsesResult.rows };
    }));

    res.json({ appointments });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/appointments/:token/respond', async (req, res) => {
  const { token } = req.params;
  const { name, responses } = req.body;

  if (!name || !Array.isArray(responses) || responses.length === 0) {
    return res.status(400).json({ error: 'Name and responses are required' });
  }

  const client = await pool.connect();
  try {
    const appointmentResult = await client.query(
      'SELECT id FROM appointments WHERE token = $1',
      [token]
    );
    const validIds = appointmentResult.rows.map(row => row.id);

    if (validIds.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    await client.query('BEGIN');

    for (const r of responses) {
      if (!validIds.includes(r.appointmentId) || !['yes', 'no'].includes(r.response)) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Invalid appointment ID or response' });
      }

      await client.query(
        'INSERT INTO responses (appointment_id, name, response) VALUES ($1, $2, $3)',
        [r.appointmentId, name, r.response]
      );
    }

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ error: 'Database error' });
  } finally {
    client.release();
  }
});


app.get('/', (req, res) => {
  res.send('Server is running!');
});

connectWithRetry();
