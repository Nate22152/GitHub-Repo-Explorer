
import express from 'express';
import pool from '../db';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

//GET /user/favorites - Retrieve user's favorite repos
router.get('/favorites', authenticateJWT, async (req: any, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "FavoriteRepo" WHERE "userId" = $1',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// POST /user/favorites - Save a repo 
router.post('/favorites', authenticateJWT, async (req: any, res) => {
  const { githubId, name, description, stargazersCount, htmlUrl, language } = req.body;
  try {
    await pool.query(
      'INSERT INTO "FavoriteRepo" ("githubId", name, description, "stargazersCount", "htmlUrl", language, "userId") VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [githubId, name, description, stargazersCount, htmlUrl, language, req.user.id]
    );
    res.status(201).send("Favorite saved");
  } catch (err) {
    res.status(500).send("Error saving favorite");
  }
});

// DELETE /user/favorites/:id - Remove a repo 
router.delete('/favorites/:id', authenticateJWT, async (req: any, res) => {
  try {
    await pool.query(
      'DELETE FROM "FavoriteRepo" WHERE "githubId" = $1 AND "userId" = $2',
      [req.params.id, req.user.id]
    );
    res.status(200).send("Favorite removed");
  } catch (err) {
    res.status(500).send("Error removing favorite");
  }
});

export default router;