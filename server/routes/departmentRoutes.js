import express from 'express';
import { getDepartments } from '../controllers/departmentController.js';

const router = express.Router();

// Publicly readable departments list
router.get('/', getDepartments);

export default router;
