import { query } from '../config/db.js';

/**
 * Get all municipal departments from MySQL
 * GET /api/departments
 */
export async function getDepartments(req, res) {
  try {
    const [departments] = await query('SELECT id, name, description FROM departments ORDER BY id ASC');
    return res.json({
      success: true,
      data: departments || [],
    });
  } catch (error) {
    console.error('Get departments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve departments.',
    });
  }
}
