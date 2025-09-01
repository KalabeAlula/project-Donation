/**
 * Deployment verification script
 * This script checks if the deployed frontend and backend are functioning correctly
 */

const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}=== Deployment Verification Tool ===${colors.reset}\n`);

async function verifyDeployment() {
  let frontendUrl, backendUrl;

  // Get URLs from user
  await new Promise(resolve => {
    rl.question('Enter your frontend URL (default: https://gidf.org.et): ', (answer) => {
      frontendUrl = answer.trim() || 'https://gidf.org.et';
      resolve();
    });
  });

  await new Promise(resolve => {
    rl.question('Enter your backend URL (default: https://api.gidf.org.et): ', (answer) => {
      backendUrl = answer.trim() || 'https://api.gidf.org.et';
      resolve();
    });
  });

  console.log(`\n${colors.cyan}Starting verification...${colors.reset}\n`);

  // Verify frontend is accessible
  try {
    console.log(`Testing frontend accessibility: ${frontendUrl}`);
    const frontendResponse = await axios.get(frontendUrl, { timeout: 10000 });
    if (frontendResponse.status === 200) {
      console.log(`${colors.green}✓ Frontend is accessible${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ Frontend returned status code ${frontendResponse.status}${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}✗ Failed to access frontend: ${error.message}${colors.reset}`);
  }

  // Verify backend health endpoint
  try {
    const healthEndpoint = `${backendUrl}/api/health`;
    console.log(`Testing backend health endpoint: ${healthEndpoint}`);
    const healthResponse = await axios.get(healthEndpoint, { timeout: 10000 });
    if (healthResponse.status === 200) {
      console.log(`${colors.green}✓ Backend health check passed${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ Backend health check returned status code ${healthResponse.status}${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}✗ Failed to access backend health endpoint: ${error.message}${colors.reset}`);
  }

  // Verify CORS is properly configured
  try {
    const corsTestEndpoint = `${backendUrl}/api/donations`;
    console.log(`Testing CORS configuration: ${corsTestEndpoint}`);
    const corsResponse = await axios.get(corsTestEndpoint, {
      timeout: 10000,
      headers: {
        'Origin': frontendUrl
      }
    });
    
    if (corsResponse.headers['access-control-allow-origin']) {
      console.log(`${colors.green}✓ CORS is properly configured${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ CORS headers not found in response${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}✗ CORS test failed: ${error.message}${colors.reset}`);
  }

  console.log(`\n${colors.cyan}=== Verification Summary ===${colors.reset}`);
  console.log(`\nIf all checks passed, your deployment is functioning correctly!`);
  console.log(`If any checks failed, please review the error messages and check your configuration.`);
  console.log(`\nCommon issues:`);
  console.log(`1. CORS configuration - Ensure CORS_ORIGIN in backend environment variables is set to your frontend URL`);
  console.log(`2. Environment variables - Verify all required environment variables are set in Vercel`);
  console.log(`3. API URL - Check that VITE_API_URL in frontend .env.production points to your backend URL`);
  
  rl.close();
}

verifyDeployment().catch(error => {
  console.error(`${colors.red}An unexpected error occurred: ${error.message}${colors.reset}`);
  rl.close();
});