import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5050;

// Test route to check if the API is running
app.get('/', (req, res) => {
    res.send('Surfing Board API is running!');
});

// Test route to check database connection
app.get('/db-test', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ message: 'Database connected!', time: result.rows[0].now });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Route to fetch all surfboards
app.get('/surfboards', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM surfboards');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch surfboards' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
