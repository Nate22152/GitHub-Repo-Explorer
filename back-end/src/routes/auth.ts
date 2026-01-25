// src/routes/auth.ts
import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || '';


interface AuthRequestBody {
  username?: string;
  password?: string;
}

// POST /auth/register - Create a new user
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO "User" (username, password) VALUES ($1, $2)',
      [username, hashedPassword]
    );

    console.log("User saved:", result.rows[0]);
    res.status(201).json({ message: "User registered successfully" });

  } catch (err: any) {
    console.error("POSTGRES ERROR:", err.message);
    console.error("ERROR CODE:", err.code);

    res.status(500).json({ error: err.message });
  }
});

// POST /auth/login - Authenticate and return JWT token
router.post('/login', async (req: Request<{}, {}, AuthRequestBody>, res: Response) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM "User" WHERE username = $1', [username]);
    const user = result.rows[0];

    if (user && password && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { id: user.id, username: user.username }, 
        JWT_SECRET,
        { expiresIn: '2h' }
      );
      res.json({ token });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;