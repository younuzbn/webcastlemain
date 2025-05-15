#!/bin/bash

# Clean previous build
rm -rf out
rm -rf .next

# Run build
npm run build

# Create an empty .nojekyll file
touch out/.nojekyll

# Create an index.html file in the root to redirect to the correct path
cp public/index.html out/index.html || echo "No index.html to copy"

# Copy our 404 page to the out directory
cp public/404.html out/404.html || echo "No 404.html to copy"

# Run deployment
echo "Deploying to GitHub Pages..."
npx gh-pages -d out --dotfiles -m "Deploy to GitHub Pages"

echo "Deployment completed!" 