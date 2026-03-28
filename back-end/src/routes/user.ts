// src/routes/user.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import express from 'express';
import { authenticateJWT } from '../middleware/auth';

dotenv.config();
const router = express.Router();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';


const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// GET /user/favorites - Retrieve user's favorite repos
router.get('/favorites', authenticateJWT, async (req: any, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false,
        error: "User not authenticated" 
      });
    }

    const { data, error } = await supabase
      .from('favorite_repos')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching favorites:", error);
      return res.status(500).json({ 
        success: false,
        error: "Error retrieving favorites" 
      });
    }

    res.json({ 
      success: true,
      message: "Favorites retrieved successfully",
      data: data || []
    });
    
  } catch (err: any) {
    console.error("Server error:", err);
    res.status(500).json({ 
      success: false,
      error: "Server error" 
    });
  }
});

// POST /user/favorites - Save a repo 
router.post('/favorites', authenticateJWT, async (req: any, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false,
        error: "User not authenticated" 
      });
    }

    const { 
      repoId, 
      githubId, 
      name, 
      description, 
      stargazersCount, 
      htmlUrl, 
      language,
      owner 
    } = req.body;

    // Use repoId or githubId (support both field names)
    const repositoryId = repoId || githubId;

    // Validation
    if (!repositoryId || !name || !htmlUrl) {
      return res.status(400).json({ 
        success: false,
        error: "Missing required fields: repoId/githubId, name, htmlUrl" 
      });
    }

    // Check if already favorited
    const { data: existing, error: checkError } = await supabase
      .from('favorite_repos')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('repo_id', repositoryId)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ 
        success: false,
        error: "Repository already in favorites" 
      });
    }

    // Insert new favorite
    const { data, error } = await supabase
      .from('favorite_repos')
      .insert([
        {
          repo_id: repositoryId,
          name,
          description: description || null,
          stargazers_count: stargazersCount || 0,
          html_url: htmlUrl,
          language: language || null,
          owner: owner || 'unknown',
          user_id: req.user.id
        }
      ])
      .select()
      .single();
      
    if (error) {
      console.error("Error saving favorite:", error);
      return res.status(500).json({ 
        success: false,
        error: "Error saving favorite" 
      });
    }

    res.status(201).json({ 
      success: true,
      message: "Repository added to favorites",
      data 
    });
    
  } catch (err: any) {
    console.error("Error saving favorite:", err);
    res.status(500).json({ 
      success: false,
      error: "Error saving favorite" 
    });
  }
});

// DELETE /user/favorites/:id - Remove a repo 
router.delete('/favorites/:id', authenticateJWT, async (req: any, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false,
        error: "User not authenticated" 
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        success: false,
        error: "Favorite ID is required" 
      });
    }

    const { error } = await supabase
      .from('favorite_repos')
      .delete()
      .eq('repo_id', id)
      .eq('user_id', req.user.id);

    if (error) {
      console.error("Error removing favorite:", error);
      return res.status(500).json({ 
        success: false,
        error: "Error removing favorite" 
      });
    }

    res.status(200).json({ 
      success: true,
      message: "Favorite removed successfully",
      data: { id }
    });
    
  } catch (err: any) {
    console.error("Error removing favorite:", err);
    res.status(500).json({ 
      success: false,
      error: "Error removing favorite" 
    });
  }
});

export default router;