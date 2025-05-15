#!/bin/bash

# Clean previous build
rm -rf out
rm -rf .next

# Just rename/move the problematic directory out of public
mv public/morphing-2d-demo-main public/morphing-2d-demo-main-temp || true

# Run build
npm run build

# Create an empty .nojekyll file
touch out/.nojekyll

# Handle the 404 problem by creating a custom 404 page
cp out/404.html out/index.html || echo "No 404.html file to copy"

# Move the problematic directory back
mv public/morphing-2d-demo-main-temp public/morphing-2d-demo-main || true

# Run deployment
echo "Deploying to GitHub Pages..."
npx gh-pages -d out --dotfiles -m "Deploy to GitHub Pages"

echo "Deployment completed!" 