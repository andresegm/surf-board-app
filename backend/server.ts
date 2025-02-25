import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db';
import surfboardsRoutes from './routes/surfboards';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5050;

// Test API route
app.get('/', (req, res) => {
    res.send('Surfing Board API is running!');
});

// Test database connection
app.get('/db-test', async (_req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ message: 'Database connected!', time: result.rows[0].now });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Use surfboards routes
app.use('/surfboards', surfboardsRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
