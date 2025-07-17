#!/bin/bash

# Render Build Script für Momentmillionär
echo "Starting Render build process..."

# Node version check
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Install dependencies
echo "Installing dependencies..."
npm ci --only=production

# Install dev dependencies for build
echo "Installing build dependencies..."
npm install --no-save vite @vitejs/plugin-react esbuild tsx typescript

# Build frontend
echo "Building frontend..."
npx vite build

# Build backend
echo "Building backend..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Build complete!"