# Vercel Deployment Guide

This guide provides step-by-step instructions for deploying the MERN stack application to Vercel. This guide includes configuration for environment variables, deployment steps, and logging setup.

## Prerequisites

1. A [Vercel](https://vercel.com) account
2. [Vercel CLI](https://vercel.com/docs/cli) installed globally (`npm install -g vercel`)
3. MongoDB Atlas account (for the production database)

## Deployment Steps

### 1. Prepare Environment Variables

#### Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Connection
MONGO_URI=your_mongodb_atlas_connection_string

# MongoDB Connection Pool Settings
MONGO_MAX_POOL_SIZE=50
MONGO_MIN_POOL_SIZE=5

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@example.com

# Chapa Payment Gateway
CHAPA_SECRET_KEY=your_chapa_secret_key

# URLs
BACKEND_URL=https://api.gidf.org.et
FRONTEND_URL=https://gidf.org.et
CHAPA_CALLBACK_URL=https://api.gidf.org.et/api/donations/verify-chapa
CHAPA_RETURN_URL=https://gidf.org.et/donation-success

# CORS Settings
CORS_ORIGIN=https://gidf.org.et

# Security Settings
RATE_LIMIT_WINDOW_MS=15
RATE_LIMIT_MAX=100
```

### 4. Logging Configuration for Serverless Environments

When deploying to Vercel or other serverless environments, be aware of the following logging considerations:

1. **File-based logging is disabled automatically** in serverless environments as they don't support persistent file writing.

2. **Console logging is still active** and will be captured by the Vercel logging system.

3. **No action required** - The application has been configured to detect serverless environments (like Vercel) and will automatically adjust the logging configuration.

4. **Viewing logs** - You can view logs in the Vercel dashboard under the "Logs" tab of your deployment.

5. **Known Issues Fixed** - The application has been updated to handle two common Vercel deployment issues:
   - File-based logging is automatically disabled in serverless environments
   - The logs directory creation is skipped in serverless environments

```
# JWT Settings
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1d
```

#### Frontend Environment Variables

Update the `.env.production` file in the root directory:

```
VITE_API_URL=https://api.gidf.org.et/api
```

### 2. Deploy the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Login to Vercel (if not already logged in):
   ```bash
   vercel login
   ```

3. Deploy the backend:
   ```bash
   vercel
   ```

4. Follow the prompts to configure your project. When asked about environment variables, make sure to add all the variables from your `.env` file.

5. After deployment, note the URL of your backend deployment. You'll need to set up a custom domain for your backend API (e.g., `api.gidf.org.et`).

### 3. Deploy the Frontend

1. Update the `.env.production` file with your backend URL.

2. Navigate to the project root directory:
   ```bash
   cd ..
   ```

3. Deploy the frontend:
   ```bash
   vercel
   ```

4. Follow the prompts to configure your project.

5. After deployment, note the URL of your frontend deployment. You'll need to set up a custom domain for your frontend (e.g., `gidf.org.et`).

### 4. Link Backend and Frontend

1. Update the backend environment variables in the Vercel dashboard:
   - Go to your backend project in the Vercel dashboard
   - Navigate to Settings > Environment Variables
   - Update `FRONTEND_URL` with your frontend domain (https://gidf.org.et)
   - Update `CORS_ORIGIN` with your frontend domain (https://gidf.org.et)
   - Update `CHAPA_RETURN_URL` with your frontend domain + `/donation-success` (https://gidf.org.et/donation-success)

2. Redeploy the backend to apply the changes:
   ```bash
   cd backend
   vercel --prod
   ```

### 5. Set Up Custom Domains

1. For the frontend:
   - Go to your frontend project in the Vercel dashboard
   - Navigate to Settings > Domains
   - Add your domain (gidf.org.et)
   - Follow Vercel's instructions to configure DNS settings with your domain provider

2. For the backend API:
   - Go to your backend project in the Vercel dashboard
   - Navigate to Settings > Domains
   - Add your API subdomain (api.gidf.org.et)
   - Follow Vercel's instructions to configure DNS settings with your domain provider

### 6. Verify the Deployment

1. Visit your frontend domain (https://gidf.org.et) to ensure the application is working correctly.
2. Test the donation form to verify that the backend API is accessible.
3. Check that all features are functioning as expected.

## Troubleshooting

### CORS Issues

If you encounter CORS issues, ensure that:

1. The `CORS_ORIGIN` environment variable in the backend is set correctly to your frontend URL.
2. The `VITE_API_URL` in the frontend is pointing to the correct backend URL.

### Database Connection Issues

If the application cannot connect to the database:

1. Verify that your MongoDB Atlas connection string is correct.
2. Ensure that your IP address is whitelisted in MongoDB Atlas.
3. Check that the database user has the correct permissions.

### API Request Failures

If API requests are failing:

1. Check the browser console for error messages.
2. Verify that the `VITE_API_URL` is set correctly in the frontend.
3. Check the Vercel logs for the backend service to identify any server-side errors.

## Automated Deployment Helper

You can use the included `deploy.js` script to help with the deployment process:

```bash
node deploy.js
```

This script will check for the necessary configuration files and guide you through the deployment process.