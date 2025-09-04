/**
 * Deployment helper script for Vercel
 * This script helps prepare the project for deployment to Vercel
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Ensure we're in the project root
const projectRoot = process.cwd();

// For ES modules, we need to construct the __dirname equivalent
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}Starting deployment preparation...${colors.reset}`);

// Check if Vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'ignore' });
  console.log(`${colors.green}✓ Vercel CLI is installed${colors.reset}`);
} catch (error) {
  console.log(`${colors.yellow}! Vercel CLI is not installed. Installing...${colors.reset}`);
  try {
    execSync('npm install -g vercel', { stdio: 'inherit' });
    console.log(`${colors.green}✓ Vercel CLI installed successfully${colors.reset}`);
  } catch (installError) {
    console.error(`${colors.red}✗ Failed to install Vercel CLI. Please install it manually with 'npm install -g vercel'${colors.reset}`);
    process.exit(1);
  }
}

// Check for vercel.json files
const frontendVercelPath = path.join(projectRoot, 'vercel.json');
const backendVercelPath = path.join(projectRoot, 'backend', 'vercel.json');

if (fs.existsSync(frontendVercelPath)) {
  console.log(`${colors.green}✓ Frontend vercel.json exists${colors.reset}`);
} else {
  console.log(`${colors.red}✗ Frontend vercel.json not found${colors.reset}`);
  process.exit(1);
}

if (fs.existsSync(backendVercelPath)) {
  console.log(`${colors.green}✓ Backend vercel.json exists${colors.reset}`);
} else {
  console.log(`${colors.red}✗ Backend vercel.json not found${colors.reset}`);
  process.exit(1);
}

// Check for .env.production file
const envProductionPath = path.join(projectRoot, '.env.production');
if (fs.existsSync(envProductionPath)) {
  console.log(`${colors.green}✓ .env.production exists${colors.reset}`);
} else {
  console.log(`${colors.yellow}! .env.production not found. Creating template...${colors.reset}`);
  const envTemplate = `# Frontend Production Environment Variables\nVITE_API_URL=https://api.gidf.org.et/api\n`;
  fs.writeFileSync(envProductionPath, envTemplate);
  console.log(`${colors.green}✓ Created .env.production template${colors.reset}`);
  console.log(`${colors.yellow}! .env.production created with API URL set to https://api.gidf.org.et/api${colors.reset}`);
}

// Check for backend .env file
const backendEnvPath = path.join(projectRoot, 'backend', '.env');
const backendEnvExamplePath = path.join(projectRoot, 'backend', '.env.example');

if (!fs.existsSync(backendEnvPath) && fs.existsSync(backendEnvExamplePath)) {
  console.log(`${colors.yellow}! Backend .env not found. Creating from .env.example...${colors.reset}`);
  fs.copyFileSync(backendEnvExamplePath, backendEnvPath);
  console.log(`${colors.green}✓ Created backend .env from template${colors.reset}`);
  console.log(`${colors.yellow}! Please update the backend .env with your production values${colors.reset}`);
}

// Deployment instructions
console.log(`\n${colors.cyan}=== Deployment Instructions ===${colors.reset}`);
console.log(`\n1. ${colors.yellow}Deploy the backend:${colors.reset}`);
console.log(`   cd backend`);
console.log(`   vercel`);
console.log(`\n2. ${colors.yellow}Set up custom domain for backend:${colors.reset}`);
console.log(`   - Go to your backend project in the Vercel dashboard`);
console.log(`   - Navigate to Settings > Domains`);
console.log(`   - Add your API subdomain (api.gidf.org.et)`);
console.log(`   - Follow Vercel's instructions to configure DNS settings`);
console.log(`\n3. ${colors.yellow}Deploy the frontend:${colors.reset}`);
console.log(`   cd ..`);
console.log(`   vercel`);
console.log(`\n4. ${colors.yellow}Set up custom domain for frontend:${colors.reset}`);
console.log(`   - Go to your frontend project in the Vercel dashboard`);
console.log(`   - Navigate to Settings > Domains`);
console.log(`   - Add your domain (gidf.org.et)`);
console.log(`   - Follow Vercel's instructions to configure DNS settings`);

console.log(`\n${colors.green}Deployment preparation complete!${colors.reset}`);