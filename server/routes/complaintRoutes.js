import express from 'express';
import {
  createComplaint,
  getMyComplaints,
  trackComplaint,
  getRecentComplaints,
  getComplaintDetails,
} from '../controllers/complaintController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/track/:complaintId', trackComplaint);
router.get('/recent', getRecentComplaints);

// Protected citizen routes
router.post('/', authenticateToken, upload.single('photo'), createComplaint);
router.get('/my', authenticateToken, getMyComplaints);
router.get('/:id', authenticateToken, getComplaintDetails);

export default router;
