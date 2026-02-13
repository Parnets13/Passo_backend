# Backend Integration Guide

Complete guide to integrate the backend API with your React frontend.

## 🚀 Quick Setup

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/worker-admin
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

### Step 3: Start MongoDB

**Option A: Local MongoDB**
```bash
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update MONGODB_URI in .env

### Step 4: Seed Initial Data

```bash
npm run seed
```

This creates:
- Default admin (admin@admin.com / admin123)
- 8 default categories

### Step 5: Start Backend Server

```bash
npm run dev
```

Server runs on http://localhost:5000

---

## 🔗 Frontend Integration

### Step 1: Create API Configuration

Create `admin/src/config/api.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Step 2: Create Frontend .env

Create `admin/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Step 3: Update AuthContext

Update `admin/src/context/AuthContext.jsx`:

```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('adminToken');
    
    if (token) {
      try {
        const response = await api.get('/auth/me');
        setIsAuthenticated(true);
        setUser(response.data.admin);
      } catch (error) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.admin));
      
      setIsAuthenticated(true);
      setUser(response.data.admin);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Step 4: Create Service Files

Create `admin/src/services/` directory with service files:

**dashboardService.js**
```javascript
import api from '../config/api';

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data.data;
};

export const getDailyUnlocks = async (days = 7) => {
  const response = await api.get(`/dashboard/daily-unlocks?days=${days}`);
  return response.data.data;
};

export const getRevenueByType = async () => {
  const response = await api.get('/dashboard/revenue-by-type');
  return response.data.data;
};

export const getTopCategories = async () => {
  const response = await api.get('/dashboard/top-categories');
  return response.data.data;
};
```

**userService.js**
```javascript
import api from '../config/api';

export const getUsers = async (params = {}) => {
  const response = await api.get('/users', { params });
  return response.data;
};

export const blockUser = async (userId) => {
  const response = await api.post(`/users/${userId}/block`);
  return response.data;
};

export const unblockUser = async (userId) => {
  const response = await api.post(`/users/${userId}/unblock`);
  return response.data;
};

export const issueCredits = async (userId, credits, reason) => {
  const response = await api.post(`/users/${userId}/credits`, { credits, reason });
  return response.data;
};

export const getUserHistory = async (userId) => {
  const response = await api.get(`/users/${userId}/history`);
  return response.data.data;
};
```

**workerService.js**
```javascript
import api from '../config/api';

export const getWorkers = async (params = {}) => {
  const response = await api.get('/workers', { params });
  return response.data;
};

export const approveWorker = async (workerId) => {
  const response = await api.post(`/workers/${workerId}/approve`);
  return response.data;
};

export const rejectWorker = async (workerId, reason) => {
  const response = await api.post(`/workers/${workerId}/reject`, { reason });
  return response.data;
};

export const blockWorker = async (workerId) => {
  const response = await api.post(`/workers/${workerId}/block`);
  return response.data;
};

export const markFeatured = async (workerId, plan) => {
  const response = await api.post(`/workers/${workerId}/featured`, { plan });
  return response.data;
};

export const assignBadge = async (workerId, badgeType) => {
  const response = await api.post(`/workers/${workerId}/badge`, { badgeType });
  return response.data;
};

export const approveKYC = async (workerId) => {
  const response = await api.post(`/workers/${workerId}/kyc/approve`);
  return response.data;
};
```

**categoryService.js**
```javascript
import api from '../config/api';

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data.data;
};

export const createCategory = async (data) => {
  const response = await api.post('/categories', data);
  return response.data;
};

export const updateCategory = async (id, data) => {
  const response = await api.put(`/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};
```

### Step 5: Update Components to Use Services

**Example: Dashboard.jsx**

```javascript
import { useEffect, useState } from 'react';
import { getDashboardStats, getDailyUnlocks, getRevenueByType, getTopCategories } from '../services/dashboardService';
import { MdPeople, MdWork, MdLock, MdTrendingUp, MdWarning } from 'react-icons/md';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [dailyUnlocks, setDailyUnlocks] = useState([]);
  const [revenueByType, setRevenueByType] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, unlocksData, revenueData, categoriesData] = await Promise.all([
        getDashboardStats(),
        getDailyUnlocks(7),
        getRevenueByType(),
        getTopCategories()
      ]);

      setStats(statsData);
      setDailyUnlocks(unlocksData);
      setRevenueByType(revenueData);
      setTopCategories(categoriesData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button onClick={fetchDashboardData} className="mt-2 text-red-600 hover:underline">
          Try Again
        </button>
      </div>
    );
  }

  // Rest of your component JSX...
};

export default Dashboard;
```

---

## 🧪 Testing the Integration

### 1. Test Authentication

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}'
```

### 2. Test Protected Routes

```bash
# Get dashboard stats (replace TOKEN with your JWT)
curl -X GET http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer TOKEN"
```

### 3. Test in Frontend

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd admin && npm run dev`
3. Open http://localhost:5173
4. Login with admin@admin.com / admin123
5. Navigate through dashboard

---

## 🔍 Troubleshooting

### CORS Issues

If you see CORS errors:
1. Check CORS_ORIGIN in backend .env
2. Ensure it matches your frontend URL
3. Restart backend server

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongosh

# Or check MongoDB Atlas connection string
```

### Authentication Issues

1. Clear localStorage in browser
2. Check JWT_SECRET is set in .env
3. Verify token is being sent in headers

### API Not Responding

1. Check backend server is running
2. Verify PORT in .env
3. Check firewall settings

---

## 📊 API Testing with Postman

Import this collection to test all endpoints:

1. Create new collection "Worker Admin API"
2. Add environment variables:
   - `base_url`: http://localhost:5000/api
   - `token`: (will be set after login)
3. Add requests for each endpoint
4. Use `{{base_url}}` and `{{token}}` in requests

---

## 🚀 Production Deployment

### Backend Deployment (Heroku)

```bash
cd backend
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-atlas-uri
heroku config:set JWT_SECRET=your-production-secret
git push heroku main
```

### Frontend Deployment (Vercel)

```bash
cd admin
vercel
```

Update frontend .env:
```env
VITE_API_BASE_URL=https://your-backend.herokuapp.com/api
```

---

## ✅ Integration Checklist

- [ ] Backend server running
- [ ] MongoDB connected
- [ ] Seed data created
- [ ] Frontend .env configured
- [ ] API config file created
- [ ] AuthContext updated
- [ ] Service files created
- [ ] Components updated to use services
- [ ] Login working
- [ ] Dashboard loading data
- [ ] All CRUD operations working

---

## 📚 Next Steps

1. Implement remaining controllers (complaints, analytics, etc.)
2. Add file upload for documents
3. Integrate Razorpay payment gateway
4. Add real-time notifications with Socket.io
5. Implement advanced filtering and search
6. Add data export functionality
7. Set up automated backups
8. Configure monitoring and logging

---

**Need Help?** Check the main README.md or API documentation.
