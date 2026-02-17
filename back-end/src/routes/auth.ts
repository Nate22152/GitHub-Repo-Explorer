// src/routes/auth.ts
import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
const router = express.Router();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const JWT_SECRET = process.env.JWT_SECRET || '';

// Use service role key for backend operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface AuthRequestBody {
  username?: string;
  email?: string;
  password?: string;
}

// POST /auth/register - Create a new user
router.post('/register', async (req: Request<{}, {}, AuthRequestBody>, res: Response) => {
  const { username, email, password } = req.body;
  
  // Support both username and email
  const userIdentifier = email || username;

  if (!userIdentifier || !password) {
    return res.status(400).json({ 
      success: false,
      error: "Email/username and password are required" 
    });
  }

  // Validate email format if email is provided
  if (email) {
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        error: "Please provide a valid email" 
      });
    }
  }

  // Password validation
  if (password.length < 6) {
    return res.status(400).json({ 
      success: false,
      error: "Password must be at least 6 characters" 
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const { data: user, error } = await supabase
      .from('users')
      .insert([
        {
          email: userIdentifier.toLowerCase(),
          password_hash: hashedPassword
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      
      // Handle duplicate email
      if (error.code === '23505') { 
        return res.status(400).json({ 
          success: false,
          error: "User already exists with this email" 
        });
      }
      
      return res.status(500).json({ 
        success: false,
        error: "Error creating user" 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log("User registered successfully:", user.email);
    
    res.status(201).json({ 
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user.id,
          email: user.email
        },
        token
      }
    });
    
  } catch (err: any) {
    console.error("Registration error:", err.message);
    res.status(500).json({ 
      success: false,
      error: "Internal server error" 
    });
  }
});

// POST /auth/login - Authenticate and return JWT token
router.post('/login', async (req: Request<{}, {}, AuthRequestBody>, res: Response) => {
  const { username, email, password } = req.body;
  
  // Support both username and email
  const userIdentifier = email || username;

  if (!userIdentifier || !password) {
    return res.status(400).json({ 
      success: false,
      error: "Email/username and password are required" 
    });
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', userIdentifier.toLowerCase())
      .single();

    if (error || !user) {
      return res.status(401).json({ 
        success: false,
        error: "Invalid credentials" 
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        error: "Invalid credentials" 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log("User logged in successfully:", user.email);
    
    res.json({ 
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          email: user.email
        },
        token
      }
    });
    
  } catch (err: any) {
    console.error("Login error:", err.message);
    res.status(500).json({ 
      success: false,
      error: "Internal server error" 
    });
  }
});

export default router;