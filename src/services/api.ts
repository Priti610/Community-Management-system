import axios from 'axios';

// Centralized API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically to every request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fixmycity_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: trigger logout if token expired
      console.warn('[FixMyCity API] Unauthorized or expired session.');
    }
    return Promise.reject(error);
  }
);

// -------------------------------------------------------------
// Authentication Endpoints
// -------------------------------------------------------------
export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData: { name: string; email: string; password: string; phone?: string }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// -------------------------------------------------------------
// Citizen & Public Complaint Endpoints
// -------------------------------------------------------------
export const complaintService = {
  reportIssue: async (data: {
    category: string;
    title: string;
    location: string;
    description: string;
    photoBase64?: string | null;
  }) => {
    const response = await api.post('/complaints', data);
    return response.data;
  },
  getMyComplaints: async () => {
    const response = await api.get('/complaints/my');
    return response.data;
  },
  trackIssue: async (complaintId: string) => {
    const response = await api.get(`/complaints/track/${encodeURIComponent(complaintId)}`);
    return response.data;
  },
  getRecentComplaints: async () => {
    const response = await api.get('/complaints/recent');
    return response.data;
  },
  getComplaintDetails: async (id: string | number) => {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },
};

// -------------------------------------------------------------
// Admin Management & Statistics Endpoints
// -------------------------------------------------------------
export const adminService = {
  getAllComplaints: async (params?: { search?: string; status?: string; category?: string }) => {
    const response = await api.get('/admin/complaints', { params });
    return response.data;
  },
  getComplaintById: async (id: string | number) => {
    const response = await api.get(`/admin/complaints/${id}`);
    return response.data;
  },
  updateStatus: async (id: string | number, status: string, remark?: string) => {
    const response = await api.put(`/admin/complaints/${id}/status`, { status, remark });
    return response.data;
  },
  assignDepartment: async (id: string | number, data: { department_id: number; assigned_to?: string; remark?: string }) => {
    const response = await api.put(`/admin/complaints/${id}/assign`, data);
    return response.data;
  },
  updateFull: async (
    id: string | number,
    data: {
      status: string;
      department_id?: number | null;
      assigned_to?: string | null;
      admin_remark?: string | null;
    }
  ) => {
    const response = await api.post(`/admin/complaints/${id}/update`, data);
    return response.data;
  },
  getStatistics: async () => {
    const response = await api.get('/admin/statistics');
    return response.data;
  },
};

// -------------------------------------------------------------
// Departments
// -------------------------------------------------------------
export const departmentService = {
  getAll: async () => {
    const response = await api.get('/departments');
    return response.data;
  },
};

export default api;
