#!/bin/bash

# Create temp directory if it doesn't exist
mkdir -p temp

# Move the problematic morphing demo to temp directory
mv public/morphing-2d-demo-main temp/

# Clean previous build
rm -rf out
rm -rf .next

# Run build
npm run build

# Ensure the .nojekyll file exists in the output directory
touch out/.nojekyll

# Copy the .nojekyll file to the root of the out directory
cp .nojekyll out/

# Move the morphing demo back
mv temp/morphing-2d-demo-main public/

# Run deployment with debug info
echo "Deploying to GitHub Pages..."
npx gh-pages -d out --dotfiles -m "Deploy to GitHub Pages"

echo "Deployment completed!" 