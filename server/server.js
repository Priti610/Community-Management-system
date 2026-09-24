import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { getDbConnection } from './config/db.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads folder
const uploadsDir = path.resolve('server/uploads');
app.use('/uploads', express.static(uploadsDir));

// Test health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'FixMyCity API', timestamp: new Date().toISOString() });
});

// REST API routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/departments', departmentRoutes);

// Error handling middleware
app.use(errorHandler);

// Attempt database connection on server start
getDbConnection().then(() => {
  console.log('[FixMyCity] Database subsystem initialized successfully.');
}).catch((err) => {
  console.error('[FixMyCity] Database initialization warning:', err.message);
});

export default app;
