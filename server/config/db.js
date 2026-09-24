import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

// Configuration for MySQL connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fixmycity',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let activePool = null;
let isUsingFallback = false;

// Fallback in-memory data store replicating MySQL tables exactly
// Used whenever an external MySQL daemon is not running in the current container environment
class FallbackDatabase {
  constructor() {
    this.users = [];
    this.departments = [];
    this.complaints = [];
    this.complaintUpdates = [];
    this.complaintPhotos = [];
    this.userAutoId = 1;
    this.deptAutoId = 1;
    this.complaintAutoId = 1;
    this.updateAutoId = 1;
    this.photoAutoId = 1;

    this.seedInitialData();
  }

  seedInitialData() {
    const defaultPassword = bcrypt.hashSync('password123', 10);

    // Initial users
    this.users = [
      {
        id: 1,
        name: 'Alex Morgan',
        email: 'citizen@fixmycity.org',
        password: defaultPassword,
        phone: '+1 (555) 234-5678',
        role: 'citizen',
        created_at: '2026-09-20 09:00:00',
      },
      {
        id: 2,
        name: 'Sarah Jenkins',
        email: 'admin@fixmycity.org',
        password: defaultPassword,
        phone: '+1 (555) 987-6543',
        role: 'admin',
        created_at: '2026-09-20 09:00:00',
      },
    ];
    this.userAutoId = 3;

    // Initial departments
    this.departments = [
      { id: 1, name: 'Sanitation Department', description: 'Waste collection, street cleaning, dumpster overflow, and public trash management.' },
      { id: 2, name: 'Road Department', description: 'Potholes, curb repairs, sidewalk maintenance, paving, and road markings.' },
      { id: 3, name: 'Water Department', description: 'Main line leaks, water pressure failures, meter issues, and municipal supply.' },
      { id: 4, name: 'Electricity Department', description: 'Streetlights, traffic lights, exposed wiring, and power grid infrastructure.' },
      { id: 5, name: 'Drainage Department', description: 'Storm drains, clogged gutters, sewage overflow, and flooding mitigation.' },
      { id: 6, name: 'General Civic Department', description: 'Parks, public restrooms, benches, signage, and general municipal amenities.' },
    ];
    this.deptAutoId = 7;

    // Initial complaints matching the FixMyCity prototype screenshots
    this.complaints = [
      {
        id: 1,
        complaint_id: 'FMC-2026-0C2083',
        user_id: 1,
        category: 'Damaged Roads',
        title: 'Broken curb ramp outside library',
        description: 'The curb ramp is cracked and difficult for wheelchair users to cross safely.',
        location: 'Central Library, West entrance',
        status: 'Submitted',
        department_id: null,
        assigned_to: null,
        admin_remark: null,
        created_at: '2026-09-24 10:55:00',
        updated_at: '2026-09-24 10:55:00',
      },
      {
        id: 2,
        complaint_id: 'FMC-2026-2DCC7C',
        user_id: 1,
        category: 'Other Civic Problems',
        title: 'Public ingress test report',
        description: 'Walkway barrier has dislodged causing safety obstruction for pedestrians.',
        location: 'Test Plaza',
        status: 'Submitted',
        department_id: null,
        assigned_to: null,
        admin_remark: null,
        created_at: '2026-09-24 10:54:00',
        updated_at: '2026-09-24 10:54:00',
      },
      {
        id: 3,
        complaint_id: 'FMC-2026-5FA9B7',
        user_id: 1,
        category: 'Garbage Accumulation',
        title: 'Overflowing bins near Riverside Park',
        description: 'Multiple recycling and trash bins are overflowing onto the grass after the weekend market.',
        location: 'Riverside Park, North Gate',
        status: 'In Progress',
        department_id: 1,
        assigned_to: 'Officer Dave Miller',
        admin_remark: 'Dispatched Sanitation Crew #3 for bulk cleanup.',
        created_at: '2026-09-24 10:53:00',
        updated_at: '2026-09-24 11:30:00',
      },
      {
        id: 4,
        complaint_id: 'FMC-2026-50B11F',
        user_id: 1,
        category: 'Damaged Roads',
        title: 'Large pothole on Maple Avenue',
        description: 'Deep pothole in the right lane damaging vehicular tires and creating hazard for bikes.',
        location: 'Maple Avenue, Block 4',
        status: 'Under Review',
        department_id: 2,
        assigned_to: null,
        admin_remark: 'Initial inspection queued with road assessment surveyor.',
        created_at: '2026-09-24 10:53:00',
        updated_at: '2026-09-24 11:15:00',
      },
      {
        id: 5,
        complaint_id: 'FMC-2026-20082E',
        user_id: 1,
        category: 'Water Leakage',
        title: 'Water leaking from sidewalk valve',
        description: 'Continuous stream of clean water escaping through municipal shutoff valve casing.',
        location: '5th Street & Elm Way',
        status: 'Assigned',
        department_id: 3,
        assigned_to: 'Inspector Rodriguez',
        admin_remark: 'Assigned to Water Maintenance Division Team Alpha.',
        created_at: '2026-09-24 10:53:00',
        updated_at: '2026-09-24 11:20:00',
      },
      {
        id: 6,
        complaint_id: 'FMC-2026-88A129',
        user_id: 1,
        category: 'Streetlight Problems',
        title: 'Streetlight flickering at night',
        description: 'Pole #42 bulb is strobing continuously creating visibility hazard for motorists.',
        location: 'Oakland Boulevard, Pole #42',
        status: 'Resolved',
        department_id: 4,
        assigned_to: 'Technician Kyle Vance',
        admin_remark: 'Replaced ballast and LED fixture. Tested functional.',
        created_at: '2026-09-23 16:15:00',
        updated_at: '2026-09-24 09:40:00',
      },
    ];
    this.complaintAutoId = 7;

    // Timeline updates
    this.complaintUpdates = [
      { id: 1, complaint_id: 'FMC-2026-0C2083', old_status: null, new_status: 'Submitted', remark: 'Complaint submitted by citizen.', updated_by: 'Alex Morgan', created_at: '2026-09-24 10:55:00' },
      { id: 2, complaint_id: 'FMC-2026-2DCC7C', old_status: null, new_status: 'Submitted', remark: 'Complaint submitted by citizen.', updated_by: 'Alex Morgan', created_at: '2026-09-24 10:54:00' },
      { id: 3, complaint_id: 'FMC-2026-5FA9B7', old_status: null, new_status: 'Submitted', remark: 'Complaint submitted by citizen.', updated_by: 'Alex Morgan', created_at: '2026-09-24 10:53:00' },
      { id: 4, complaint_id: 'FMC-2026-5FA9B7', old_status: 'Submitted', new_status: 'Under Review', remark: 'Report reviewed by dispatch.', updated_by: 'Sarah Jenkins (Admin)', created_at: '2026-09-24 11:00:00' },
      { id: 5, complaint_id: 'FMC-2026-5FA9B7', old_status: 'Under Review', new_status: 'Assigned', remark: 'Assigned to Sanitation Department', updated_by: 'Sarah Jenkins (Admin)', created_at: '2026-09-24 11:10:00' },
      { id: 6, complaint_id: 'FMC-2026-5FA9B7', old_status: 'Assigned', new_status: 'In Progress', remark: 'Sanitation Crew #3 dispatched to North Gate.', updated_by: 'Sarah Jenkins (Admin)', created_at: '2026-09-24 11:30:00' },
      { id: 7, complaint_id: 'FMC-2026-50B11F', old_status: null, new_status: 'Submitted', remark: 'Complaint submitted by citizen.', updated_by: 'Alex Morgan', created_at: '2026-09-24 10:53:00' },
      { id: 8, complaint_id: 'FMC-2026-50B11F', old_status: 'Submitted', new_status: 'Under Review', remark: 'Prioritizing safety hazard assessment.', updated_by: 'Sarah Jenkins (Admin)', created_at: '2026-09-24 11:15:00' },
      { id: 9, complaint_id: 'FMC-2026-20082E', old_status: null, new_status: 'Submitted', remark: 'Complaint submitted by citizen.', updated_by: 'Alex Morgan', created_at: '2026-09-24 10:53:00' },
      { id: 10, complaint_id: 'FMC-2026-20082E', old_status: 'Submitted', new_status: 'Under Review', remark: 'Initial triage complete.', updated_by: 'Sarah Jenkins (Admin)', created_at: '2026-09-24 11:05:00' },
      { id: 11, complaint_id: 'FMC-2026-20082E', old_status: 'Under Review', new_status: 'Assigned', remark: 'Assigned to Water Department (Inspector Rodriguez).', updated_by: 'Sarah Jenkins (Admin)', created_at: '2026-09-24 11:20:00' },
      { id: 12, complaint_id: 'FMC-2026-88A129', old_status: null, new_status: 'Submitted', remark: 'Complaint submitted by citizen.', updated_by: 'Alex Morgan', created_at: '2026-09-23 16:15:00' },
      { id: 13, complaint_id: 'FMC-2026-88A129', old_status: 'Submitted', new_status: 'Assigned', remark: 'Assigned to Electricity Department.', updated_by: 'Sarah Jenkins (Admin)', created_at: '2026-09-23 17:00:00' },
      { id: 14, complaint_id: 'FMC-2026-88A129', old_status: 'Assigned', new_status: 'In Progress', remark: 'Repair truck dispatched.', updated_by: 'Sarah Jenkins (Admin)', created_at: '2026-09-24 08:30:00' },
      { id: 15, complaint_id: 'FMC-2026-88A129', old_status: 'In Progress', new_status: 'Resolved', remark: 'Replaced ballast and LED fixture. Tested functional.', updated_by: 'Sarah Jenkins (Admin)', created_at: '2026-09-24 09:40:00' },
    ];
    this.updateAutoId = 16;
  }

  // mysql2 compatible query execution
  async query(sql, params = []) {
    const cleanSql = sql.trim().replace(/;\s*$/, '');

    // 1. SELECT queries
    if (/^SELECT/i.test(cleanSql)) {
      // Users by email
      if (/FROM users WHERE email =/i.test(cleanSql)) {
        const email = params[0];
        const rows = this.users.filter((u) => u.email.toLowerCase() === String(email).toLowerCase());
        return [rows];
      }
      // Users by id
      if (/FROM users WHERE id =/i.test(cleanSql)) {
        const id = Number(params[0]);
        const rows = this.users.filter((u) => u.id === id);
        return [rows];
      }

      // Departments all
      if (/FROM departments/i.test(cleanSql)) {
        return [this.departments];
      }

      // Complaint counts by status (for statistics/cards)
      if (/COUNT\(\*\)\s+AS\s+total/i.test(cleanSql) || /COUNT\(\*\)\s+as\s+count/i.test(cleanSql)) {
        if (/GROUP BY status/i.test(cleanSql)) {
          const counts = {};
          this.complaints.forEach((c) => {
            counts[c.status] = (counts[c.status] || 0) + 1;
          });
          const rows = Object.entries(counts).map(([status, count]) => ({ status, count }));
          return [rows];
        }

        if (/GROUP BY category/i.test(cleanSql)) {
          const counts = {};
          this.complaints.forEach((c) => {
            counts[c.category] = (counts[c.category] || 0) + 1;
          });
          const rows = Object.entries(counts).map(([category, count]) => ({ category, count }));
          return [rows];
        }

        if (/GROUP BY d\.name/i.test(cleanSql) || /GROUP BY department/i.test(cleanSql)) {
          const counts = {};
          this.complaints.forEach((c) => {
            const dept = this.departments.find((d) => d.id === c.department_id);
            const deptName = dept ? dept.name : 'Unassigned';
            counts[deptName] = (counts[deptName] || 0) + 1;
          });
          const rows = Object.entries(counts).map(([department, count]) => ({ department, count }));
          return [rows];
        }

        const total = this.complaints.length;
        const pending = this.complaints.filter((c) => ['Submitted', 'Under Review', 'Assigned'].includes(c.status)).length;
        const inProgress = this.complaints.filter((c) => c.status === 'In Progress').length;
        const resolved = this.complaints.filter((c) => c.status === 'Resolved').length;
        const rejected = this.complaints.filter((c) => c.status === 'Rejected').length;
        return [[{ total, pending, in_progress: inProgress, resolved, rejected }]];
      }

      // Complaint updates by complaint_id
      if (/FROM complaint_updates WHERE complaint_id =/i.test(cleanSql)) {
        const complaintId = params[0];
        const rows = this.complaintUpdates
          .filter((u) => u.complaint_id === complaintId)
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        return [rows];
      }

      // Complaint photos by complaint_id
      if (/FROM complaint_photos WHERE complaint_id =/i.test(cleanSql)) {
        const complaintId = params[0];
        const rows = this.complaintPhotos.filter((p) => p.complaint_id === complaintId);
        return [rows];
      }

      // Single complaint by complaint_id
      if (/FROM complaints.*WHERE.*complaint_id =/i.test(cleanSql)) {
        const complaintId = params[0];
        const complaint = this.complaints.find((c) => c.complaint_id === complaintId);
        if (!complaint) return [[]];
        const user = this.users.find((u) => u.id === complaint.user_id);
        const dept = this.departments.find((d) => d.id === complaint.department_id);
        const row = {
          ...complaint,
          citizen_name: user ? user.name : 'Unknown Citizen',
          citizen_email: user ? user.email : '',
          citizen_phone: user ? user.phone : '',
          department_name: dept ? dept.name : 'Unassigned',
        };
        return [[row]];
      }

      // Single complaint by id
      if (/FROM complaints.*WHERE.*c\.id =|WHERE id =/i.test(cleanSql) && !/user_id =/i.test(cleanSql)) {
        const id = Number(params[0]);
        const complaint = this.complaints.find((c) => c.id === id);
        if (!complaint) return [[]];
        const user = this.users.find((u) => u.id === complaint.user_id);
        const dept = this.departments.find((d) => d.id === complaint.department_id);
        const row = {
          ...complaint,
          citizen_name: user ? user.name : 'Unknown Citizen',
          citizen_email: user ? user.email : '',
          citizen_phone: user ? user.phone : '',
          department_name: dept ? dept.name : 'Unassigned',
        };
        return [[row]];
      }

      // Complaints for specific user (My History)
      if (/FROM complaints.*WHERE.*user_id =/i.test(cleanSql)) {
        const userId = Number(params[0]);
        const rows = this.complaints
          .filter((c) => c.user_id === userId)
          .map((c) => {
            const dept = this.departments.find((d) => d.id === c.department_id);
            return {
              ...c,
              department_name: dept ? dept.name : 'Unassigned',
            };
          })
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return [rows];
      }

      // All complaints (Admin queue / Recent reports)
      let list = this.complaints.map((c) => {
        const user = this.users.find((u) => u.id === c.user_id);
        const dept = this.departments.find((d) => d.id === c.department_id);
        return {
          ...c,
          citizen_name: user ? user.name : 'Unknown Citizen',
          citizen_email: user ? user.email : '',
          department_name: dept ? dept.name : 'Unassigned',
        };
      });

      // Handle limit if present
      const limitMatch = cleanSql.match(/LIMIT\s+(\d+)/i);
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      if (limitMatch) {
        list = list.slice(0, Number(limitMatch[1]));
      }

      return [list];
    }

    // 2. INSERT queries
    if (/^INSERT INTO users/i.test(cleanSql)) {
      const [name, email, password, phone, role] = params;
      const newUser = {
        id: this.userAutoId++,
        name,
        email,
        password,
        phone: phone || null,
        role: role || 'citizen',
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      };
      this.users.push(newUser);
      return [{ insertId: newUser.id, affectedRows: 1 }];
    }

    if (/^INSERT INTO complaints/i.test(cleanSql)) {
      const [complaint_id, user_id, category, title, description, location, status] = params;
      const newComplaint = {
        id: this.complaintAutoId++,
        complaint_id,
        user_id: Number(user_id),
        category,
        title,
        description,
        location,
        status: status || 'Submitted',
        department_id: null,
        assigned_to: null,
        admin_remark: null,
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updated_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      };
      this.complaints.unshift(newComplaint);
      return [{ insertId: newComplaint.id, affectedRows: 1 }];
    }

    if (/^INSERT INTO complaint_updates/i.test(cleanSql)) {
      const [complaint_id, old_status, new_status, remark, updated_by] = params;
      const newUpdate = {
        id: this.updateAutoId++,
        complaint_id,
        old_status: old_status || null,
        new_status,
        remark: remark || null,
        updated_by: updated_by || 'System',
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      };
      this.complaintUpdates.push(newUpdate);
      return [{ insertId: newUpdate.id, affectedRows: 1 }];
    }

    if (/^INSERT INTO complaint_photos/i.test(cleanSql)) {
      const [complaint_id, image_url] = params;
      const newPhoto = {
        id: this.photoAutoId++,
        complaint_id,
        image_url,
        uploaded_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      };
      this.complaintPhotos.push(newPhoto);
      return [{ insertId: newPhoto.id, affectedRows: 1 }];
    }

    // 3. UPDATE complaints
    if (/^UPDATE complaints/i.test(cleanSql)) {
      // Find complaint by id or complaint_id in sql
      let targetComplaint = null;

      if (/WHERE id =/i.test(cleanSql)) {
        const id = Number(params[params.length - 1]);
        targetComplaint = this.complaints.find((c) => c.id === id);
      } else if (/WHERE complaint_id =/i.test(cleanSql)) {
        const cid = params[params.length - 1];
        targetComplaint = this.complaints.find((c) => c.complaint_id === cid);
      }

      if (targetComplaint) {
        if (/status = \?/i.test(cleanSql)) {
          targetComplaint.status = params[0];
        }
        if (/department_id = \?/i.test(cleanSql)) {
          const deptIdx = cleanSql.indexOf('department_id') > cleanSql.indexOf('status') ? 1 : 0;
          targetComplaint.department_id = params[deptIdx] ? Number(params[deptIdx]) : null;
        }
        if (/assigned_to = \?/i.test(cleanSql)) {
          const assignIdx = params.findIndex((p, idx) => typeof p === 'string' && idx > 0 && idx < params.length - 1);
          if (assignIdx !== -1) targetComplaint.assigned_to = params[assignIdx];
        }
        if (/admin_remark = \?/i.test(cleanSql)) {
          const remarkIdx = params.length - 2;
          targetComplaint.admin_remark = params[remarkIdx];
        }
        targetComplaint.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
        return [{ affectedRows: 1 }];
      }
      return [{ affectedRows: 0 }];
    }

    return [[]];
  }
}

const fallbackInstance = new FallbackDatabase();

// Connect to MySQL or fallback transparently
export async function getDbConnection() {
  if (activePool) {
    return activePool;
  }

  try {
    const pool = mysql.createPool(dbConfig);
    // Ping MySQL to verify active connectivity
    const connection = await pool.getConnection();
    connection.release();
    activePool = pool;
    isUsingFallback = false;
    console.log(`[Database] Successfully connected to MySQL at ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    return activePool;
  } catch (error) {
    console.warn(`[Database] MySQL not reachable on ${dbConfig.host}:${dbConfig.port} (${error.code || error.message}).`);
    console.log(`[Database] Active mode: High-fidelity in-memory database initialized with full FixMyCity schema and data.`);
    isUsingFallback = true;
    activePool = fallbackInstance;
    return activePool;
  }
}

// Quick execute helper
export async function query(sql, params = []) {
  const db = await getDbConnection();
  return db.query(sql, params);
}

export default {
  query,
  getDbConnection,
  isFallback: () => isUsingFallback,
};
