# PlantBuddy Backend - Deployment Guide for alwaysdata.com

This guide will help you deploy your PlantBuddy backend to alwaysdata.com.

## 📋 Prerequisites

- An alwaysdata.com account
- Your MongoDB Atlas connection string
- Git installed on your local machine

## 🚀 Deployment Steps

### 1. Prepare Your Repository

Make sure all your changes are committed:

```bash
cd server
git add .
git commit -m "Prepare backend for production deployment"
git push origin main
```

### 2. Set Up on alwaysdata.com

#### A. Create a Node.js Site

1. Log in to your alwaysdata.com dashboard
2. Go to **Web > Sites**
3. Click **Add a site**
4. Choose **Node.js** as the type
5. Configure:
   - **Name**: plantbuddy-backend (or your preferred name)
   - **Addresses**: Choose your domain/subdomain
   - **Node.js version**: Select the latest LTS version (14.x or higher)
   - **Application path**: `/server` (or wherever your index.js is located)
   - **Entry point**: `index.js`

#### B. Configure Environment Variables

1. Go to **Web > Sites** and select your site
2. Click on **Environment variables**
3. Add the following variables:

```
NODE_ENV=production
PORT=3000
MONGODB_URI=your-mongodb-connection-string
DB_NAME=PlantBuddy
CORS_ORIGIN=*
```

**Important**: Replace `your-mongodb-connection-string` with your actual MongoDB Atlas URI.

### 3. Deploy via SSH

#### A. Connect via SSH

```bash
ssh your-account@ssh-your-account.alwaysdata.net
```

#### B. Navigate to Your Application Directory

```bash
cd ~/www/plantbuddy-backend/
```

#### C. Clone Your Repository

```bash
git clone https://github.com/your-username/PlantBuddy_backend.git .
cd server
```

#### D. Install Dependencies

```bash
npm install --production
```

#### E. Start the Application

alwaysdata.com will automatically start your application using the `npm start` command defined in your `package.json`.

### 4. Verify Deployment

Once deployed, test your endpoints:

#### Root Endpoint
```bash
curl https://your-domain.com/
```

Expected response:
```json
{
  "success": true,
  "message": "PlantBuddy API is running",
  "version": "1.0.0",
  "timestamp": "2025-11-23T00:15:35.000Z"
}
```

#### Health Check Endpoint
```bash
curl https://your-domain.com/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-11-23T00:15:35.000Z",
  "service": {
    "name": "PlantBuddy Backend API",
    "version": "1.0.0",
    "environment": "production",
    "uptime": "0h 5m 23s",
    "uptimeSeconds": 323
  },
  "database": {
    "status": "healthy",
    "message": "Database connection active",
    "name": "PlantBuddy",
    "connected": true
  },
  "system": {
    "nodeVersion": "v18.x.x",
    "platform": "linux",
    "memory": {
      "rss": "45MB",
      "heapUsed": "23MB",
      "heapTotal": "35MB"
    }
  }
}
```

#### Status Endpoint
```bash
curl https://your-domain.com/status
```

Expected response:
```json
{
  "success": true,
  "online": true,
  "database": true,
  "timestamp": "2025-11-23T00:15:35.000Z"
}
```

## 🔧 Troubleshooting

### Application Won't Start

1. Check the logs in alwaysdata.com dashboard: **Web > Sites > Logs**
2. Verify environment variables are set correctly
3. Ensure MongoDB connection string is valid
4. Check that all dependencies are installed

### Database Connection Issues

1. Verify MongoDB Atlas allows connections from alwaysdata.com IPs
2. In MongoDB Atlas, go to **Network Access** and add `0.0.0.0/0` (allow from anywhere) or specific alwaysdata.com IP ranges
3. Check that your MongoDB URI is correct in environment variables

### CORS Errors

If you're getting CORS errors from your frontend:

1. Update the `CORS_ORIGIN` environment variable with your frontend domain
2. Example: `CORS_ORIGIN=https://yourfrontend.com`
3. Restart your application

## 📊 Monitoring Your Application

### Health Checks

Set up automated health checks using the `/health` endpoint:

- **URL**: `https://your-domain.com/health`
- **Method**: GET
- **Expected Status**: 200 (healthy) or 503 (degraded)

### Logs

Access logs through:
1. alwaysdata.com dashboard: **Web > Sites > Logs**
2. SSH into your server and check: `~/admin/logs/`

## 🔄 Updating Your Application

To deploy updates:

```bash
# SSH into your server
ssh your-account@ssh-your-account.alwaysdata.net

# Navigate to your app
cd ~/www/plantbuddy-backend/server

# Pull latest changes
git pull origin main

# Install any new dependencies
npm install --production

# Restart the application (alwaysdata.com handles this automatically)
```

## 🔐 Security Best Practices

1. **Never commit `.env` files** - They contain sensitive credentials
2. **Use environment variables** for all sensitive data
3. **Restrict CORS origins** in production to only your frontend domains
4. **Keep dependencies updated**: Run `npm audit` and `npm update` regularly
5. **Enable MongoDB IP whitelist** for additional security
6. **Use HTTPS** - alwaysdata.com provides free SSL certificates

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `DB_NAME` | Database name | `PlantBuddy` |
| `CORS_ORIGIN` | Allowed CORS origins | `https://yourapp.com` or `*` |

## 🆘 Support

If you encounter issues:

1. Check the [alwaysdata.com documentation](https://help.alwaysdata.com/)
2. Review application logs
3. Test endpoints using the `/health` endpoint
4. Verify MongoDB Atlas network access settings

## ✅ Deployment Checklist

- [ ] Code committed and pushed to repository
- [ ] Node.js site created on alwaysdata.com
- [ ] Environment variables configured
- [ ] Repository cloned to server
- [ ] Dependencies installed
- [ ] Application started successfully
- [ ] Root endpoint (`/`) returns success
- [ ] Health endpoint (`/health`) returns healthy status
- [ ] Database connection verified
- [ ] API endpoints tested
- [ ] CORS configured for frontend
- [ ] MongoDB Atlas network access configured
- [ ] SSL certificate active (HTTPS)

---

**Congratulations!** 🎉 Your PlantBuddy backend is now deployed and ready for production use!
