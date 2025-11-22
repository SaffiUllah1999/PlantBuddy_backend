# PlantBuddy Backend API

> Production-ready Express.js backend for the PlantBuddy plant management application

[![Node.js](https://img.shields.io/badge/Node.js-14%2B-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green.svg)](https://www.mongodb.com/)

## 📖 Overview

PlantBuddy Backend is a RESTful API built with Express.js and MongoDB, designed to manage plant-related data, user information, and leaderboard functionality. The application is production-ready with comprehensive health checks, error handling, and logging.

## ✨ Features

- **RESTful API** - Clean and intuitive API endpoints
- **MongoDB Integration** - Robust database connection with automatic reconnection
- **Health Monitoring** - Comprehensive health check endpoints for monitoring
- **Error Handling** - Professional error handling with detailed logging
- **CORS Support** - Configurable CORS for frontend integration
- **File Upload** - Support for image uploads using Multer
- **Production Ready** - Optimized for deployment on platforms like alwaysdata.com
- **Graceful Shutdown** - Proper cleanup of database connections

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB Atlas account (or local MongoDB instance)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SaffiUllah1999/PlantBuddy_backend.git
   cd PlantBuddy_backend/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=your-mongodb-connection-string
   DB_NAME=PlantBuddy
   CORS_ORIGIN=*
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Start the production server**
   ```bash
   npm start
   ```

The server will start at `http://localhost:3000`

## 📡 API Endpoints

### Health & Status

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/` | GET | Root endpoint - Simple health check | `{ success: true, message: "PlantBuddy API is running" }` |
| `/health` | GET | Comprehensive health check with system info | Detailed health status (see below) |
| `/status` | GET | Quick status check | `{ success: true, online: true, database: true }` |

### User Management

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/getUsers` | GET | Get all users | `{ success: true, count: N, data: [...] }` |
| `/getLeaderBoardUsers` | GET | Get users sorted by score | `{ success: true, count: N, data: [...] }` |

### Health Check Response Example

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
    "connected": true,
    "lastAttempt": "2025-11-23T00:15:35.000Z"
  },
  "system": {
    "nodeVersion": "v18.17.0",
    "platform": "linux",
    "memory": {
      "rss": "45MB",
      "heapUsed": "23MB",
      "heapTotal": "35MB"
    },
    "pid": 12345
  },
  "performance": {
    "responseTime": "15ms"
  }
}
```

## 🏗️ Project Structure

```
server/
├── index.js              # Main application file
├── package.json          # Dependencies and scripts
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore rules
├── models/              # Database models
├── uploads/             # File upload directory
└── vercel.json          # Vercel deployment config (optional)
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | Environment mode (`development` or `production`) |
| `MONGODB_URI` | Yes | - | MongoDB connection string |
| `DB_NAME` | No | `PlantBuddy` | Database name |
| `CORS_ORIGIN` | No | `*` | Allowed CORS origins (comma-separated) |

### CORS Configuration

In production, it's recommended to specify exact origins:

```env
CORS_ORIGIN=https://yourfrontend.com,https://www.yourfrontend.com
```

## 🚢 Deployment

### Deploy to alwaysdata.com

See the comprehensive [DEPLOYMENT.md](../DEPLOYMENT.md) guide for step-by-step instructions on deploying to alwaysdata.com.

Quick steps:
1. Create a Node.js site on alwaysdata.com
2. Configure environment variables
3. Clone repository via SSH
4. Install dependencies: `npm install --production`
5. Start application: `npm start`

### Deploy to Other Platforms

The application is compatible with:
- **Heroku** - Use the Procfile: `web: npm start`
- **Railway** - Auto-detects Node.js and uses `npm start`
- **Render** - Configure build command: `npm install` and start command: `npm start`
- **Vercel** - Uses the included `vercel.json` configuration

## 🧪 Testing

Test the API endpoints:

```bash
# Test root endpoint
curl http://localhost:3000/

# Test health check
curl http://localhost:3000/health

# Test status
curl http://localhost:3000/status

# Test users endpoint
curl http://localhost:3000/getUsers
```

## 📊 Monitoring

The `/health` endpoint provides comprehensive monitoring information:

- **Service uptime** - How long the server has been running
- **Database status** - Connection health and last attempt
- **System metrics** - Memory usage, Node.js version, platform
- **Performance** - Response time for the health check

Use this endpoint with monitoring services like:
- UptimeRobot
- Pingdom
- StatusCake
- Custom monitoring scripts

## 🔒 Security

- **Environment Variables** - Sensitive data stored in `.env` (never committed)
- **CORS Protection** - Configurable allowed origins
- **Error Handling** - Production mode hides sensitive error details
- **Input Validation** - Request body size limits (100MB)
- **File Upload Limits** - 10MB maximum file size

## 🛠️ Development

### Available Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests (not yet implemented)
npm test
```

### Adding New Routes

Add new routes in `index.js` following the existing pattern:

```javascript
app.get("/your-endpoint", async (req, res) => {
  try {
    if (!dbo) {
      return res.status(503).json({
        success: false,
        error: "Database not connected"
      });
    }
    
    // Your logic here
    
    res.status(200).json({
      success: true,
      data: yourData
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      success: false,
      error: "Error message",
      message: NODE_ENV === "development" ? err.message : undefined
    });
  }
});
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m "Add new feature"`
4. Push to your fork: `git push origin feature-name`
5. Create a pull request

## 📝 License

ISC License

## 👤 Author

**Saffi Ullah**

## 🐛 Issues

If you encounter any issues or have suggestions, please [open an issue](https://github.com/SaffiUllah1999/PlantBuddy_backend/issues) on the repository.

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/)
- [alwaysdata.com Documentation](https://help.alwaysdata.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Made with ❤️ for PlantBuddy**
