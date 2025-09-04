/**
 * Deployment verification script
 * This script checks if the deployed frontend and backend are functioning correctly
 */

import axios from 'axios';
import readline from 'readline';
import fs from 'fs';

// For ES modules, we need to construct the __dirname equivalent
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Check if browserslist needs updating
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  if (packageJson.devDependencies && packageJson.devDependencies.autoprefixer) {
    console.log(`${colors.yellow}Note: If you saw a "Browserslist: caniuse-lite is outdated" warning during build,${colors.reset}`);
    console.log(`${colors.yellow}run this command to update it: npx update-browserslist-db@latest${colors.reset}\n`);
  }
} catch (error) {
  // Silently ignore any errors reading package.json
}

async function verifyDeployment() {
  let frontendUrl, backendUrl;

  // Get URLs from user
  await new Promise(resolve => {
    rl.question('Enter your frontend URL (e.g., https://your-project.vercel.app): ', (answer) => {
      frontendUrl = answer.trim();
      if (!frontendUrl) {
        console.log(`${colors.yellow}No URL provided. You need to deploy your frontend to Vercel first.${colors.reset}`);
        console.log(`${colors.yellow}To deploy your frontend, run the following commands:${colors.reset}`);
        console.log(`  cd ${path.resolve(__dirname)}`); 
        console.log(`  vercel`); 
        console.log(`${colors.yellow}After deployment, Vercel will provide you with a URL to use.${colors.reset}`);
        process.exit(0);
      }
      // Ensure URL has protocol
      if (!frontendUrl.startsWith('http://') && !frontendUrl.startsWith('https://')) {
        frontendUrl = 'https://' + frontendUrl;
      }
      resolve();
    });
  });

  await new Promise(resolve => {
    rl.question('Enter your backend URL (e.g., https://your-api-project.vercel.app): ', (answer) => {
      backendUrl = answer.trim();
      if (!backendUrl) {
        console.log(`${colors.yellow}No backend URL provided. You need to deploy your backend to Vercel first.${colors.reset}`);
        console.log(`${colors.yellow}To deploy your backend, run the following commands:${colors.reset}`);
        console.log(`  cd ${path.resolve(__dirname, 'backend')}`); 
        console.log(`  vercel`); 
        console.log(`${colors.yellow}After deployment, Vercel will provide you with a URL to use.${colors.reset}`);
        process.exit(0);
      }
      // Ensure URL has protocol
      if (!backendUrl.startsWith('http://') && !backendUrl.startsWith('https://')) {
        backendUrl = 'https://' + backendUrl;
      }
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
  
  // Define variables to track errors
  let frontendError = false;
  let backendError = false;
  let corsError = false;
  let authError = false;
  
  // We'll use a simple approach - just check if the domain is the default one
  if (frontendUrl.includes('gidf.org.et')) {
    frontendError = true;
  }
  
  // For backend and auth errors, we'll just provide general advice
  
  console.log(`\n${colors.cyan}=== Common Issues ===${colors.reset}`);
  console.log(`1. CORS configuration - Ensure CORS_ORIGIN in backend environment variables is set to your frontend URL`);
  console.log(`2. Environment variables - Verify all required environment variables are set in Vercel`);
  console.log(`3. API URL - Check that VITE_API_URL in frontend .env.production points to your backend URL`);
  
  // Always show authentication advice since it's a common issue
  console.log(`\n${colors.yellow}=== Authentication Tips ===${colors.reset}`);
  console.log(`If you're seeing 401 Unauthorized errors:`);
  console.log(`1. Check if your backend requires API keys or tokens for access`);
  console.log(`2. Verify that all required environment variables are set in Vercel:`);
  console.log(`   - MONGODB_URI`);
  console.log(`   - JWT_SECRET`);
  console.log(`   - Any payment gateway credentials`);
  console.log(`3. If using JWT authentication, ensure tokens are properly configured`);
  
  if (frontendError) {
    console.log(`\n${colors.yellow}=== Frontend Deployment Tips ===${colors.reset}`);
    console.log(`It seems you're still using the default domain (gidf.org.et) which doesn't exist.`);
    console.log(`To deploy your frontend to Vercel:`);
    console.log(`1. Run 'vercel' in your project root directory`);
    console.log(`2. Follow the prompts to deploy your application`);
    console.log(`3. Vercel will provide you with a URL like 'your-project.vercel.app'`);
    console.log(`4. Use that URL when running this verification script`);
  }
  
  console.log(`\n${colors.cyan}=== Deployment Tips ===${colors.reset}`);
  console.log(`1. For custom domains, go to your Vercel project settings > Domains`);
  console.log(`2. To update your deployment, simply push changes to your connected repository`);
  console.log(`3. To view deployment logs, go to your Vercel dashboard > Project > Deployments`);
  console.log(`4. For environment variables, go to your Vercel project settings > Environment Variables`);
  
  console.log(`\n${colors.cyan}=== Build Optimization Tips ===${colors.reset}`);
  console.log(`1. To address the "chunks are larger than 500 kB" warning:`);
  console.log(`   - Add code splitting with dynamic imports: import('./Component') instead of import Component`);
  console.log(`   - Configure manual chunks in vite.config.ts:`);
  console.log(`     build: {`);
  console.log(`       rollupOptions: {`);
  console.log(`         output: {`);
  console.log(`           manualChunks: {`);
  console.log(`             vendor: ['react', 'react-dom'],`);
  console.log(`             three: ['three', '@react-three/fiber', '@react-three/drei']`);
  console.log(`           }`);
  console.log(`         }`);
  console.log(`       }`);
  console.log(`     }`);
  console.log(`2. Increase the warning limit in vite.config.ts if needed:`);
  console.log(`   build: { chunkSizeWarningLimit: 1000 }`);
  
  rl.close();
}

verifyDeployment().catch(error => {
  console.error(`${colors.red}An unexpected error occurred: ${error.message}${colors.reset}`);
  rl.close();
});