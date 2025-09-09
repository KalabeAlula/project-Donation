# Donation Website with ArifPay Payment Integration

This project is a donation website for Glory Integrated Development Foundation with ArifPay payment integration. It allows users to make donations using ArifPay payment gateway or bank transfer. The backend has been enhanced with production-ready features for robust deployment. The project is now configured for deployment on Vercel.

## Features

- Donation form with predefined and custom amounts
- Multiple payment methods (ArifPay and Bank Transfer)
- One-time and monthly donation options
- Email notifications for donors
- Admin dashboard to view donations
- ArifPay payment gateway integration
- Bank transfer payment option

### Backend Enhancements

- **Robust Error Handling**: Centralized error handling with custom error classes
- **Environment-Specific Configurations**: Development, testing, and production environments
- **Security Best Practices**: CORS, Helmet, Rate Limiting, XSS Protection, etc.
- **Performance Monitoring**: Response time tracking, resource usage monitoring
- **Comprehensive Logging**: Winston logger with environment-specific configurations
- **Database Optimization**: Connection pooling, monitoring, and performance tracking
- **API Documentation**: Swagger UI for interactive API documentation
- **Health Checks**: Endpoint for monitoring application health
- **Containerization**: Docker and docker-compose setup
- **CI/CD Pipeline**: GitHub Actions workflow for testing and deployment

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Chapa Account and API Key

## Installation

1. Clone the repository

```bash
git clone <repository-url>
cd project
```

2. Install dependencies for both frontend and backend

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ..
npm install
```

## Deployment to Vercel

This project is configured for deployment to Vercel. We've provided several tools to help with the deployment process:

### Automated Deployment

1. Run the deployment preparation script:

```bash
npm run deploy:prepare
```

This script will check for the necessary configuration files and guide you through the deployment process.

2. Deploy the backend first:

```bash
cd backend
npm run deploy
```

3. After the backend is deployed, update the `.env.production` file with your backend URL:

```
VITE_API_URL=https://your-backend-url.vercel.app/api
```

4. Deploy the frontend:

```bash
cd ..
npm run deploy
```

5. Verify your deployment:

```bash
npm run deploy:verify
```

### GitHub Actions Workflow

We've also included a GitHub Actions workflow that will automatically deploy your application to Vercel when you push to the main branch. To use this workflow, you'll need to add the following secrets to your GitHub repository:

- `VERCEL_TOKEN` - Your Vercel API token
- `VERCEL_ORG_ID` - Your Vercel organization ID
- `VERCEL_BACKEND_PROJECT_ID` - Your Vercel backend project ID
- `VERCEL_FRONTEND_PROJECT_ID` - Your Vercel frontend project ID
- `BACKEND_URL` - Your backend URL (after deployment)

### Manual Deployment

For detailed instructions on manually deploying the application to Vercel, please refer to the [DEPLOYMENT.md](./DEPLOYMENT.md) file.
cd ../
npm install
```

3. Set up environment variables

```bash
# In the backend directory, create a .env file based on .env.example
cp .env.example .env
```

Update the `.env` file with your own values:

```
# Server Configuration
PORT=5000

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/donation-website

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@example.com

# ArifPay Payment Gateway
ARIFPAY_SECRET_KEY=YOUR_ARIFPAY_SECRET_KEY

# URLs
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
ARIFPAY_CALLBACK_URL=http://localhost:5000/api/donations/verify-arifpay
ARIFPAY_RETURN_URL=http://localhost:3000/donation-success
```

4. Start the development servers

```bash
# Start backend server (from the backend directory)
cd backend
npm run dev

# Start frontend server (from the root directory)
cd ../
npm run dev
```

## Deployment

### Using Docker

1. Build and run with docker-compose
   ```bash
   docker-compose up -d
   ```

2. Access the application
   - API: http://localhost:5000
   - API Documentation: http://localhost:5000/api-docs

### Manual Deployment

1. Set up environment variables for production
   ```bash
   export NODE_ENV=production
   # Set other required environment variables
   ```

2. Start the production server
   ```bash
   cd backend
   npm start
   ```

### CI/CD Pipeline

This project includes a GitHub Actions workflow for continuous integration and deployment:

1. Automatically runs tests on pull requests to main and develop branches
2. Builds and pushes Docker images on successful merges
3. Deploys to production when changes are merged to main

To set up CI/CD, add the following secrets to your GitHub repository:
- `DOCKER_USERNAME`: Your Docker Hub username
- `DOCKER_PASSWORD`: Your Docker Hub password
- `DEPLOY_HOST`: Your production server hostname
- `DEPLOY_USER`: SSH username for deployment
- `DEPLOY_KEY`: SSH private key for deployment

## ArifPay Payment Integration

### How it works

1. User fills out the donation form and selects ArifPay as the payment method
2. The frontend sends the donation data to the backend
3. The backend initializes a payment with ArifPay and returns a checkout URL
4. The user is redirected to the ArifPay checkout page
5. After payment, ArifPay redirects the user back to the donation success page
6. The backend verifies the payment status with ArifPay
7. The donation status is updated in the database

### Testing ArifPay Payments

For testing, you can use the following test card details provided by ArifPay:

- Card Number: 4242424242424242
- Expiry Date: Any future date
- CVV: Any 3 digits
- PIN: Any 4 digits
- OTP: 123456

## API Endpoints

### Donations

- `POST /api/donations` - Create a new donation
- `GET /api/donations` - Get all donations (or filter by tx_ref)
- `PUT /api/donations/:id/verify` - Verify payment status
- `POST /api/donations/verify-arifpay` - Verify ArifPay payment callback

### Messages

- `POST /api/messages` - Send a contact message
- `GET /api/messages` - Get all messages

### Payments

- `POST /api/donate` - Create a payment
- `GET /api/members` - Get all members/donors

## License

This project is licensed under the MIT License.