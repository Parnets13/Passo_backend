# Worker Management Admin Panel - Backend API

Professional Node.js/Express backend for the Worker Management Admin Panel with MongoDB database.

## 🏗️ Architecture

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   └── database.js  # MongoDB connection
│   ├── controllers/     # Request handlers
│   │   ├── auth.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── user.controller.js
│   │   ├── worker.controller.js
│   │   └── category.controller.js
│   ├── middleware/      # Custom middleware
│   │   ├── auth.js      # JWT authentication
│   │   ├── errorHandler.js
│   │   ├── validate.js
│   │   └── rateLimiter.js
│   ├── models/          # Mongoose schemas
│   │   ├── Admin.js
│   │   ├── User.js
│   │   ├── Worker.js
│   │   ├── Category.js
│   │   ├── Transaction.js
│   │   ├── Complaint.js
│   │   ├── Notification.js
│   │   └── CMS.js
│   ├── routes/          # API routes
│   │   ├── index.js
│   │   ├── auth.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── user.routes.js
│   │   ├── worker.routes.js
│   │   └── ...
│   └── server.js        # Entry point
├── .env.example         # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Installation

1. **Navigate to backend folder**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/worker-admin
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

4. **Start MongoDB**
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas cloud database
```

5. **Run the server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will start on `https://passo-backend.onrender.com`

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register    - Register new admin
POST   /api/auth/login       - Login admin
GET    /api/auth/me          - Get current admin
POST   /api/auth/logout      - Logout admin
```

### Dashboard
```
GET    /api/dashboard/stats           - Get dashboard statistics
GET    /api/dashboard/daily-unlocks   - Get daily unlocks data
GET    /api/dashboard/revenue-by-type - Get revenue breakdown
GET    /api/dashboard/top-categories  - Get top categories
```

### Users
```
GET    /api/users              - Get all users (with filters)
GET    /api/users/:id          - Get user by ID
POST   /api/users/:id/block    - Block user
POST   /api/users/:id/unblock  - Unblock user
POST   /api/users/:id/credits  - Issue free credits
GET    /api/users/:id/history  - Get user history
```

### Workers
```
GET    /api/workers                  - Get all workers (with filters)
GET    /api/workers/:id              - Get worker by ID
POST   /api/workers/:id/approve      - Approve worker
POST   /api/workers/:id/reject       - Reject worker
POST   /api/workers/:id/block        - Block worker
POST   /api/workers/:id/unblock      - Unblock worker
POST   /api/workers/:id/featured     - Mark as featured
DELETE /api/workers/:id/featured     - Remove featured
POST   /api/workers/:id/badge        - Assign badge
DELETE /api/workers/:id/badge        - Remove badge
POST   /api/workers/:id/kyc/approve  - Approve KYC
```

### Categories
```
GET    /api/categories     - Get all categories
GET    /api/categories/:id - Get category by ID
POST   /api/categories     - Create category
PUT    /api/categories/:id - Update category
DELETE /api/categories/:id - Delete category
```

### Transactions
```
GET    /api/transactions         - Get all transactions
GET    /api/transactions/revenue - Get revenue reports
POST   /api/transactions/refund  - Issue refund
```

### Complaints
```
GET    /api/complaints              - Get all complaints
POST   /api/complaints/:id/warn     - Issue warning
POST   /api/complaints/:id/refund   - Issue refund
POST   /api/complaints/:id/resolve  - Resolve complaint
```

### Analytics
```
GET    /api/analytics/unlocks-by-category - Unlocks by category
GET    /api/analytics/workers-by-city     - Workers by city
GET    /api/analytics/conversion-rate     - Conversion rate
GET    /api/analytics/export              - Export analytics
```

### Notifications
```
POST   /api/notifications/send    - Send notification
GET    /api/notifications/history - Get history
POST   /api/notifications/banner  - Upload banner
GET    /api/notifications/banners - Get banners
```

### CMS
```
GET    /api/cms/:type - Get content (terms/privacy/consent/about/help)
PUT    /api/cms/:type - Update content
```

## 🔐 Authentication

All protected routes require JWT token in Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Login Example

```bash
curl -X POST https://passo-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@admin.com",
    "password": "admin123"
  }'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "...",
    "name": "Admin User",
    "email": "admin@admin.com",
    "role": "admin"
  }
}
```

## 📊 Database Models

### Admin
- name, email, password (hashed)
- role (admin/super-admin)
- status, lastLogin

### User
- name, mobile, email, password
- unlocks, totalSpent, freeCredits
- status (Active/Blocked)
- unlockHistory, paymentHistory

### Worker
- Personal info (name, email, mobile, password)
- workerType, category, serviceArea, city
- Bank details, Documents
- status, verified, kycVerified
- badges, featured, online
- subscription, stats

### Category
- name, price, active
- icon, description
- totalWorkers, totalUnlocks

### Transaction
- userId, workerId, type, amount
- status, paymentGateway
- Razorpay details
- Refund/Credit details

### Complaint
- userId, workerId, type, description
- status, priority
- adminAction, adminNotes
- refund details

### Notification
- title, message, type
- targetAudience, filters
- status, stats
- createdBy

### CMS
- type, title, content
- version, lastUpdatedBy

## 🛡️ Security Features

- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Rate limiting
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ Input validation
- ✅ MongoDB injection prevention
- ✅ Error handling

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | development |
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/worker-admin |
| JWT_SECRET | JWT secret key | - |
| JWT_EXPIRE | JWT expiration time | 7d |
| CORS_ORIGIN | Allowed CORS origin | http://localhost:5173 |
| RAZORPAY_KEY_ID | Razorpay key ID | - |
| RAZORPAY_KEY_SECRET | Razorpay secret | - |

## 🔄 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ]
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## 🚀 Deployment

### Production Checklist

- [ ] Set NODE_ENV=production
- [ ] Use strong JWT_SECRET
- [ ] Configure MongoDB Atlas
- [ ] Set up Razorpay credentials
- [ ] Configure CORS_ORIGIN
- [ ] Enable HTTPS
- [ ] Set up monitoring
- [ ] Configure backups

### Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Documentation](https://jwt.io/)

## 🤝 Contributing

1. Follow the existing code structure
2. Write clean, documented code
3. Test thoroughly before committing
4. Update documentation

## 📄 License

Proprietary - All rights reserved

---

**Status**: Production Ready
**Version**: 1.0.0
**Last Updated**: February 2024
