# PlantBuddy Backend API - Quick Reference

## 🌐 Base URL
- **Local Development**: `http://localhost:3000`
- **Production**: `https://your-domain.alwaysdata.net`

## 📡 Endpoints

### Health & Monitoring

| Endpoint | Method | Description | Use Case |
|----------|--------|-------------|----------|
| `/` | GET | Simple health check | Quick verification server is running |
| `/health` | GET | Comprehensive health status | Detailed monitoring, debugging |
| `/status` | GET | Quick status check | Uptime monitoring services |

### User Management

| Endpoint | Method | Description | Response Format |
|----------|--------|-------------|-----------------|
| `/getUsers` | GET | Get all users | `{ success, count, data: [...] }` |
| `/getLeaderBoardUsers` | GET | Get users by score (desc) | `{ success, count, data: [...] }` |

## 📝 Response Formats

### Success Response
```json
{
  "success": true,
  "count": 10,
  "data": [...]
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description",
  "message": "Detailed error message (dev only)"
}
```

### Health Check Response
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-11-23T00:15:35.000Z",
  "service": {
    "name": "PlantBuddy Backend API",
    "version": "1.0.0",
    "environment": "production",
    "uptime": "2h 15m 42s",
    "uptimeSeconds": 8142
  },
  "database": {
    "status": "healthy",
    "message": "Database connection active",
    "name": "PlantBuddy",
    "connected": true
  },
  "system": {
    "nodeVersion": "v18.17.0",
    "platform": "linux",
    "memory": {
      "rss": "45MB",
      "heapUsed": "23MB",
      "heapTotal": "35MB"
    }
  },
  "performance": {
    "responseTime": "15ms"
  }
}
```

## 🔧 Testing with cURL

### Test Root Endpoint
```bash
curl http://localhost:3000/
```

### Test Health Check
```bash
curl http://localhost:3000/health
```

### Test Status
```bash
curl http://localhost:3000/status
```

### Get All Users
```bash
curl http://localhost:3000/getUsers
```

### Get Leaderboard
```bash
curl http://localhost:3000/getLeaderBoardUsers
```

## 🧪 Testing with JavaScript/Fetch

### Basic Request
```javascript
fetch('http://localhost:3000/')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

### Health Check
```javascript
const checkHealth = async () => {
  try {
    const response = await fetch('http://localhost:3000/health');
    const health = await response.json();
    
    if (health.status === 'healthy') {
      console.log('✓ Backend is healthy');
      console.log(`Uptime: ${health.service.uptime}`);
      console.log(`Database: ${health.database.status}`);
    } else {
      console.warn('⚠ Backend is degraded');
    }
  } catch (error) {
    console.error('✗ Backend is down', error);
  }
};
```

### Get Users
```javascript
const getUsers = async () => {
  try {
    const response = await fetch('http://localhost:3000/getUsers');
    const result = await response.json();
    
    if (result.success) {
      console.log(`Found ${result.count} users`);
      console.log(result.data);
    }
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};
```

## 📊 HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful request |
| 404 | Not Found | Invalid endpoint |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Database not connected |

## 🔍 Monitoring

### Health Status Values

| Status | Meaning | Action |
|--------|---------|--------|
| `healthy` | All systems operational | None |
| `degraded` | Database issues | Check database connection |
| `disconnected` | Database not initialized | Restart server |
| `unhealthy` | Database connection failed | Check MongoDB Atlas |

### What to Monitor

1. **Uptime**: Check `/status` every 5 minutes
2. **Database**: Monitor `database.connected` in `/health`
3. **Memory**: Watch `system.memory` values in `/health`
4. **Response Time**: Track `performance.responseTime` in `/health`

## 🚨 Troubleshooting

### Server Not Responding
```bash
# Check if server is running
curl http://localhost:3000/status

# If no response, check logs
npm start
```

### Database Not Connected
```bash
# Check health endpoint
curl http://localhost:3000/health

# Look for database.status = "unhealthy"
# Verify MONGODB_URI in .env
```

### CORS Errors
```bash
# Update CORS_ORIGIN in .env
CORS_ORIGIN=https://your-frontend-domain.com

# Or allow all origins (development only)
CORS_ORIGIN=*
```

## 📱 Frontend Integration

### React Example
```javascript
// api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const api = {
  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/getUsers`);
    return response.json();
  },
  
  async getLeaderboard() {
    const response = await fetch(`${API_BASE_URL}/getLeaderBoardUsers`);
    return response.json();
  },
  
  async checkHealth() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  }
};
```

### Usage in Component
```javascript
import { api } from './api';

function UserList() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    api.getUsers()
      .then(result => {
        if (result.success) {
          setUsers(result.data);
        }
      })
      .catch(console.error);
  }, []);
  
  return (
    <div>
      {users.map(user => (
        <div key={user._id}>{user.name}</div>
      ))}
    </div>
  );
}
```

## 🔐 Environment Variables

```env
# Required
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/
DB_NAME=PlantBuddy

# Optional
PORT=3000
NODE_ENV=production
CORS_ORIGIN=*
```

## 📞 Quick Commands

```bash
# Install dependencies
npm install

# Start development server (with auto-reload)
npm run dev

# Start production server
npm start

# Test all endpoints
curl http://localhost:3000/
curl http://localhost:3000/health
curl http://localhost:3000/status
curl http://localhost:3000/getUsers
curl http://localhost:3000/getLeaderBoardUsers
```

---

**Keep this file handy for quick reference during development and deployment!**
