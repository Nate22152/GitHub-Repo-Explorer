import express from 'express';
import pool from './db';

const app = express();

const connectionCheck = async () => {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('Database connected:', res.rows[0].now);
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
};

const PORT = 5000;
app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    await connectionCheck();
});