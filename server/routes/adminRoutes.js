import express from 'express';
import {
  getAllComplaints,
  getAdminComplaintById,
  updateComplaintStatus,
  assignDepartmentAndOfficer,
  updateComplaintFull,
  getStatistics,
} from '../controllers/adminController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Enforce both JWT authentication and Admin role for all routes in this router
router.use(authenticateToken);
router.use(requireAdmin);

// Admin complaint management endpoints
router.get('/complaints', getAllComplaints);
router.get('/complaints/:id', getAdminComplaintById);
router.put('/complaints/:id/status', updateComplaintStatus);
router.put('/complaints/:id/assign', assignDepartmentAndOfficer);
router.post('/complaints/:id/update', updateComplaintFull);

// Admin dashboard & statistics
router.get('/statistics', getStatistics);

export default router;
