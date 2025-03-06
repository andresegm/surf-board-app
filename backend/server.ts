import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db';
import authRoutes from "./routes/auth";
import surfboardsRoutes from './routes/surfboards';
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
app.use(cors({
    origin: "http://localhost:3000", // Allow frontend requests
    credentials: true, // Allow cookies
}));
app.use(express.json());
app.use(cookieParser());

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

// Register authentication routes
app.use("/auth", authRoutes);

// Register surfboards routes
app.use('/surfboards', surfboardsRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
