import { query } from '../config/db.js';
import { generateComplaintId } from '../utils/idGenerator.js';

/**
 * Report a new civic issue
 * POST /api/complaints
 */
export async function createComplaint(req, res) {
  try {
    const { category, title, location, description, photoBase64 } = req.body;
    const userId = req.user.id;
    const userName = req.user.name;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Issue title is required.' });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Category selection is required.' });
    }
    if (!location || !location.trim()) {
      return res.status(400).json({ success: false, message: 'Issue location is required.' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Description is required.' });
    }
    if (description.trim().length > 1200) {
      return res.status(400).json({ success: false, message: 'Description exceeds maximum of 1200 characters.' });
    }

    // Generate unique complaint ID in format FMC-YYYY-XXXXXX
    let complaintId = generateComplaintId();

    // Ensure uniqueness
    const [existing] = await query('SELECT id FROM complaints WHERE complaint_id = ?', [complaintId]);
    if (existing && existing.length > 0) {
      complaintId = generateComplaintId();
    }

    // Insert complaint record
    const [result] = await query(
      'INSERT INTO complaints (complaint_id, user_id, category, title, description, location, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [complaintId, userId, category.trim(), title.trim(), description.trim(), location.trim(), 'Submitted']
    );

    // Create first complaint history record in complaint_updates
    await query(
      'INSERT INTO complaint_updates (complaint_id, old_status, new_status, remark, updated_by) VALUES (?, ?, ?, ?, ?)',
      [complaintId, null, 'Submitted', 'Complaint submitted by citizen.', userName]
    );

    // Handle photo evidence if uploaded via multipart/form-data or photoBase64
    let photoUrl = null;
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
      await query('INSERT INTO complaint_photos (complaint_id, image_url) VALUES (?, ?)', [complaintId, photoUrl]);
    } else if (photoBase64 && typeof photoBase64 === 'string') {
      photoUrl = photoBase64;
      await query('INSERT INTO complaint_photos (complaint_id, image_url) VALUES (?, ?)', [complaintId, photoUrl]);
    }

    return res.status(201).json({
      success: true,
      message: 'Your complaint has been submitted successfully.',
      complaint_id: complaintId,
      data: {
        id: result.insertId,
        complaint_id: complaintId,
        category: category.trim(),
        title: title.trim(),
        location: location.trim(),
        description: description.trim(),
        status: 'Submitted',
        photo_url: photoUrl,
      },
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit complaint. Please check your data and try again.',
    });
  }
}

/**
 * Get all complaints submitted by the currently logged-in citizen
 * GET /api/complaints/my
 */
export async function getMyComplaints(req, res) {
  try {
    const userId = req.user.id;
    const [complaints] = await query(
      `SELECT c.id, c.complaint_id, c.title, c.category, c.location, c.status, 
              c.created_at, c.updated_at, d.name AS department_name
       FROM complaints c
       LEFT JOIN departments d ON c.department_id = d.id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [userId]
    );

    return res.json({
      success: true,
      data: complaints || [],
    });
  } catch (error) {
    console.error('Get my complaints error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve your complaints.',
    });
  }
}

/**
 * Public track endpoint for citizens to track an issue by complaint ID or search term
 * GET /api/complaints/track/:complaintId
 */
export async function trackComplaint(req, res) {
  try {
    const { complaintId } = req.params;
    const rawInput = complaintId ? decodeURIComponent(complaintId).trim() : '';

    if (!rawInput) {
      return res.status(400).json({
        success: false,
        message: 'Complaint ID or search term is required.',
      });
    }

    const cleanInput = rawInput.toUpperCase().trim();

    // 1. Try exact or clean ID lookup
    let [rows] = await query(
      `SELECT c.*, d.name AS department_name
       FROM complaints c
       LEFT JOIN departments d ON c.department_id = d.id
       WHERE UPPER(c.complaint_id) = ?`,
      [cleanInput]
    );

    // 2. If not found and input does not start with FMC-, try prepending prefix or suffix search
    if (!rows || rows.length === 0) {
      const candidateFull = cleanInput.startsWith('FMC-') ? cleanInput : `FMC-2026-${cleanInput}`;
      [rows] = await query(
        `SELECT c.*, d.name AS department_name
         FROM complaints c
         LEFT JOIN departments d ON c.department_id = d.id
         WHERE UPPER(c.complaint_id) = ?`,
        [candidateFull]
      );
    }

    // 3. If still not found, try flexible title or ID match
    if (!rows || rows.length === 0) {
      const [allMatches] = await query(
        `SELECT c.*, d.name AS department_name
         FROM complaints c
         LEFT JOIN departments d ON c.department_id = d.id
         WHERE UPPER(c.complaint_id) LIKE ? OR UPPER(c.title) LIKE ? OR UPPER(c.location) LIKE ?`,
        [`%${cleanInput}%`, `%${cleanInput}%`, `%${cleanInput}%`]
      );
      if (allMatches && allMatches.length > 0) {
        rows = allMatches;
      }
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No complaint found matching '${rawInput}'. Please verify the ID or search keyword.`,
      });
    }

    const complaint = rows[0];

    // Fetch timeline updates
    const [updates] = await query(
      'SELECT id, old_status, new_status, remark, updated_by, created_at FROM complaint_updates WHERE complaint_id = ? ORDER BY created_at ASC',
      [complaint.complaint_id]
    );

    // Fetch photos
    const [photos] = await query(
      'SELECT id, image_url, uploaded_at FROM complaint_photos WHERE complaint_id = ?',
      [complaint.complaint_id]
    );

    return res.json({
      success: true,
      data: {
        ...complaint,
        history: updates || [],
        photos: photos || [],
      },
      matchedCount: rows.length,
      allMatches: rows.slice(0, 5).map((r) => ({
        id: r.id,
        complaint_id: r.complaint_id,
        title: r.title,
        status: r.status,
        category: r.category,
      })),
    });
  } catch (error) {
    console.error('Track complaint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to track complaint status.',
    });
  }
}

/**
 * Public recent complaints for the homepage "Community Pulse"
 * GET /api/complaints/recent
 */
export async function getRecentComplaints(req, res) {
  try {
    const [complaints] = await query(
      `SELECT c.id, c.complaint_id, c.title, c.category, c.location, c.status, 
              c.created_at, d.name AS department_name
       FROM complaints c
       LEFT JOIN departments d ON c.department_id = d.id
       ORDER BY c.created_at DESC
       LIMIT 6`
    );

    return res.json({
      success: true,
      data: complaints || [],
    });
  } catch (error) {
    console.error('Recent complaints error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve recent complaints.',
    });
  }
}

/**
 * Get detailed complaint by DB ID
 * GET /api/complaints/:id
 */
export async function getComplaintDetails(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await query(
      `SELECT c.*, d.name AS department_name, u.name AS citizen_name, u.email AS citizen_email, u.phone AS citizen_phone
       FROM complaints c
       LEFT JOIN departments d ON c.department_id = d.id
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.id = ? OR c.complaint_id = ?`,
      [id, id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    const complaint = rows[0];

    // Check authorization: citizen can only view their own complaint, admin can view any
    if (req.user.role !== 'admin' && complaint.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this complaint.',
      });
    }

    const [updates] = await query(
      'SELECT * FROM complaint_updates WHERE complaint_id = ? ORDER BY created_at ASC',
      [complaint.complaint_id]
    );

    const [photos] = await query(
      'SELECT * FROM complaint_photos WHERE complaint_id = ?',
      [complaint.complaint_id]
    );

    return res.json({
      success: true,
      data: {
        ...complaint,
        history: updates || [],
        photos: photos || [],
      },
    });
  } catch (error) {
    console.error('Get complaint details error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve complaint details.',
    });
  }
}
