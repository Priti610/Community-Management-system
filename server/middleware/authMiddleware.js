import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fixmycity-secret-key-2026';

// Middleware to authenticate JWT token
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Fetch user details from database to ensure account is active
    const [rows] = await query('SELECT id, name, email, phone, role FROM users WHERE id = ?', [decoded.id]);
    if (!rows || rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User no longer exists.',
      });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
}

// Middleware to check if authenticated user is municipal admin
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden. Municipal admin privileges required.',
    });
  }
  next();
}

export { JWT_SECRET };
