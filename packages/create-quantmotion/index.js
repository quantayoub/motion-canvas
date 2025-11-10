#!/usr/bin/env node

// This is a thin wrapper that calls the actual @quantmotion/create package
import {spawn} from 'child_process';
import {existsSync} from 'fs';
import {createRequire} from 'module';
import {dirname, join, resolve} from 'path';
import {fileURLToPath} from 'url';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try multiple strategies to find @quantmotion/create
let createPackagePath;

// Strategy 1: Try to resolve from node_modules (when installed as dependency)
try {
  createPackagePath = require.resolve('@quantmotion/create/index.js');
} catch {
  // Strategy 2: Try relative to this package's location (npx installs dependencies)
  const possiblePaths = [
    join(__dirname, 'node_modules', '@quantmotion', 'create', 'index.js'),
    join(__dirname, '..', 'node_modules', '@quantmotion', 'create', 'index.js'),
    resolve(__dirname, '../create/index.js'), // Local development fallback
  ];

  for (const possiblePath of possiblePaths) {
    if (existsSync(possiblePath)) {
      createPackagePath = possiblePath;
      break;
    }
  }

  if (!createPackagePath) {
    console.error('Error: Could not find @quantmotion/create package.');
    console.error('Please ensure @quantmotion/create is installed.');
    process.exit(1);
  }
}

// Forward all arguments to the actual create script
const args = process.argv.slice(2);
const child = spawn('node', [createPackagePath, ...args], {
  stdio: 'inherit',
  shell: true,
});

child.on('exit', code => {
  process.exit(code ?? 0);
});
