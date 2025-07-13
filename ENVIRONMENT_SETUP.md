# Environment Setup Guide

This guide explains how to set up environment variables for the Financial Tracker application.

## Project Overview

The Financial Tracker application consists of three main components:
1. **Backend (Spring Boot)** - Java application with PostgreSQL database
2. **Frontend (React)** - Web application using Vite
3. **Mobile (React Native)** - Mobile application using Expo

## Environment Files Setup

### 1. Backend (Spring Boot)

**File**: `financial-tracker/.env`

The `.env` file has been created with the following configuration:

**Configuration Variables**:
```env
# Database Configuration
DB_HOST=10.230.13.28
DB_PORT=5432
DB_NAME=financial_tracker
DB_USERNAME=nathan
DB_PASSWORD=nathan

# Server Configuration
SERVER_PORT=8082
SERVER_ADDRESS=0.0.0.0

# JWT Configuration
JWT_SECRET=mhksaFj5v0WD/S1axvphyF3jNDez18AXo8dQQDQA0vo=

# JPA Configuration
JPA_DDL_AUTO=update
JPA_SHOW_SQL=true

# Logging Configuration
LOGGING_LEVEL_SPRING_SECURITY=DEBUG
LOGGING_LEVEL_SPRING_SECURITY_WEB=DEBUG

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://192.168.1.94:5173,exp://192.168.1.94:8081,exp://localhost:8081
```

**Important Notes**:
- Change the `JWT_SECRET` for production use
- Update database credentials as needed
- Modify `CORS_ALLOWED_ORIGINS` to include your frontend URLs

### 2. Frontend (React)

**File**: `financial-tracker-frontend/.env`

The `.env` file has been created with the following configuration:

**Configuration Variables**:
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8082
VITE_API_TIMEOUT=10000

# Development Configuration
VITE_DEV_SERVER_PORT=5173
VITE_DEV_SERVER_HOST=localhost

# Feature Flags
VITE_ENABLE_DEBUG_LOGGING=true
VITE_ENABLE_THEME_TOGGLE=true
```

**Important Notes**:
- `VITE_API_BASE_URL` should point to your backend server
- All variables must be prefixed with `VITE_` to be accessible in the React app
- Update the URL if your backend runs on a different port or host

### 3. Mobile (React Native)

**File**: `financial-tracker-mobile/.env`

The `.env` file has been created with the following configuration:

**Configuration Variables**:
```env
# API Configuration
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.94:8082
EXPO_PUBLIC_API_TIMEOUT=10000

# Development Configuration
EXPO_PUBLIC_DEV_MODE=true
EXPO_PUBLIC_ENABLE_DEBUG_LOGGING=true

# App Configuration
EXPO_PUBLIC_APP_NAME=Financial Tracker
EXPO_PUBLIC_APP_VERSION=1.0.0
```

**Important Notes**:
- `EXPO_PUBLIC_API_BASE_URL` should point to your backend server
- All variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the React Native app
- Use your local network IP (e.g., `192.168.1.94`) for mobile development

## Security Considerations

### Production Environment

1. **JWT Secret**: Generate a strong, random JWT secret for production
2. **Database Credentials**: Use strong, unique passwords
3. **CORS Configuration**: Restrict CORS origins to your production domains
4. **Environment Variables**: Never commit `.env` files to version control

### Development Environment

1. **Local Database**: Use a local PostgreSQL instance for development
2. **Network Access**: Ensure your backend is accessible from your mobile device's network
3. **Debug Logging**: Enable debug logging only in development

## Environment Files Status

✅ **All `.env` files have been created and are ready to use**

The following `.env` files are now available:
- `financial-tracker/.env` - Backend configuration
- `financial-tracker-frontend/.env` - Frontend configuration  
- `financial-tracker-mobile/.env` - Mobile configuration

### Security Note
- `.env` files are **NOT tracked by Git** (they're in `.gitignore`)
- Your actual configuration stays local and secure
- You can edit these files directly with your specific configuration

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your backend CORS configuration includes your frontend URLs
2. **Connection Refused**: Check if your backend is running and accessible
3. **JWT Token Issues**: Verify the JWT secret is consistent across restarts
4. **Database Connection**: Ensure PostgreSQL is running and credentials are correct

### Network Configuration

For mobile development, you may need to:
1. Use your computer's local IP address instead of `localhost`
2. Ensure your firewall allows connections on the backend port
3. Configure your router to allow local network communication

## Environment Variable Reference

| Component | Prefix | Purpose |
|-----------|--------|---------|
| Backend | None | Database, server, and JWT configuration |
| Frontend | `VITE_` | API endpoints and feature flags |
| Mobile | `EXPO_PUBLIC_` | API endpoints and app configuration | 