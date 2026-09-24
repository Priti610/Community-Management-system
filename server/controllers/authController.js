import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { JWT_SECRET } from '../middleware/authMiddleware.js';

/**
 * Register a new citizen account
 * POST /api/auth/register
 */
export async function register(req, res) {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check if user already exists
    const [existing] = await query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing && existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user (default role: citizen)
    const [result] = await query(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), hashedPassword, phone ? phone.trim() : null, 'citizen']
    );

    const newUserId = result.insertId;

    // Generate JWT token
    const token = jwt.sign({ id: newUserId, role: 'citizen' }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: newUserId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone ? phone.trim() : null,
        role: 'citizen',
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register account. Please try again.',
    });
  }
}

/**
 * Log in an existing user (Citizen or Municipal Admin)
 * POST /api/auth/login
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const [rows] = await query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!rows || rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = rows[0];

    // Verify bcrypt password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login.',
    });
  }
}

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
export async function getMe(req, res) {
  try {
    return res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile.',
    });
  }
}
