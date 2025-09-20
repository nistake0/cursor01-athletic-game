#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, rmSync, cpSync, writeFileSync } from 'fs';
import { join } from 'path';

console.log('🚀 Starting GitHub Pages deployment...');

try {
  // Step 0: Clean up old deployment files before building
  console.log('🧹 Cleaning up old deployment files...');
  const filesToRemove = ['assets'];
  filesToRemove.forEach(file => {
    if (existsSync(file)) {
      rmSync(file, { recursive: true, force: true });
      console.log(`   Removed: ${file}`);
    }
  });

  // Restore original index.html for building
  if (!existsSync('index.html')) {
    console.log('📄 Restoring original index.html...');
    const originalIndexHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Pixi.js Game</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #333;
        }
        canvas {
            border: 2px solid white;
        }
    </style>
</head>
<body>
    <script type="module" src="./src/game.ts"></script>
</body>
</html>`;
    
    writeFileSync('index.html', originalIndexHtml);
    console.log('   Restored: index.html');
  }

  // Step 1: Build the project
  console.log('📦 Building project...');
  execSync('npm run build', { stdio: 'inherit' });

  // Step 2: Copy new files
  console.log('📋 Copying new files...');
  cpSync('dist/index.html', 'index.html');
  if (existsSync('dist/assets')) {
    cpSync('dist/assets', 'assets', { recursive: true });
    console.log('   Copied: assets/');
  }
  console.log('   Copied: index.html');

  // Step 3: Git operations
  console.log('📝 Committing changes...');
  execSync('git add .', { stdio: 'inherit' });
  
  const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const commitMessage = `Deploy to GitHub Pages - ${timestamp}`;
  
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
  
  console.log('🚀 Pushing to GitHub...');
  execSync('git push origin main', { stdio: 'inherit' });

  console.log('✅ Deployment completed successfully!');
  console.log('🌐 Your game is available at: https://nistake0.github.io/cursor01-athletic-game/');

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
